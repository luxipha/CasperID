const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { Payment, UserAccount } = require('../database/models');
const { eventBus, EVENTS } = require('../services/eventBus');
const { requireAuth } = require('../middleware/auth');
const { getPlanByYears, getDefaultPlan, getPlanByRevenueCatProductId } = require('../services/cns-plans');
const { finalizeCompletedPayment } = require('../services/payment-fulfillment');

function getCheckoutPlan(years) {
    return getPlanByYears(years) || getDefaultPlan();
}

async function completePaymentRecord(payment, transactionId) {
    payment.status = 'completed';
    payment.orderId = transactionId || payment.orderId;
    payment.completed_at = payment.completed_at || new Date();
    await payment.save();
    return payment;
}

async function attemptPaymentFulfillment(payment, transactionId) {
    try {
        return await finalizeCompletedPayment(payment, { transactionId });
    } catch (error) {
        console.error(`[Payment] Fulfillment failed for ${payment.reference}:`, error.message);
        return {
            minted: false,
            error: error.message
        };
    }
}

// POST /api/payment/revenuecat/webhook
// This handles the server-to-server webhook from RevenueCat for fiat purchases
router.post('/revenuecat/webhook', async (req, res) => {
    try {
        // Authenticate the webhook request
        const authHeader = req.headers.authorization;
        const expectedToken = process.env.Revenue_cat_key;

        // Verify the auth header if secret is configured
        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            console.error('[Payment] Invalid RevenueCat Webhook Secret');
            return res.status(401).json({ error: 'Unauthorized webhook' });
        }

        const event = req.body.event;
        if (!event) return res.status(400).json({ error: 'Invalid event payload' });

        const eventType = event.type;
        // Verify we care about this event
        if (eventType === 'INITIAL_PURCHASE' || eventType === 'NON_RENEWING_PURCHASE') {

            const transactionId = event.transaction_id;
            const appUserId = event.app_user_id;
            const productId = event.product_id;

            // Try to find the payment record by reference (appUserId)
            let paymentRecord = await Payment.findOne({ reference: appUserId });
            let domainName = '';
            let plan = getDefaultPlan();
            let userId = '';
            let user = null;

            if (paymentRecord) {
                domainName = paymentRecord.metadata.domainName;
                plan = getPlanByYears(paymentRecord.metadata.years) || getDefaultPlan();
                userId = paymentRecord.metadata.userId;
                // Find the user from our payment record
                user = await UserAccount.findOne({ user_id: userId });
            } else {
                // Fallback to legacy lookup if no payment record found
                const attrs = event.subscriber_attributes || {};
                domainName = attrs.domain_name?.value;
                userId = attrs.user_id?.value || appUserId;
                plan = getPlanByRevenueCatProductId(productId) || getDefaultPlan();
                // Try to find user from subscriber attributes
                user = await UserAccount.findOne({ user_id: userId });
            }

            if (!domainName) {
                console.error('[Payment] Could not find domain name for RevenueCat transaction', transactionId);
                return res.status(400).json({ error: 'Missing domain name' });
            }

            if (!user) {
                console.error(`[Payment] Could not find user for RevenueCat transaction. UserID: ${userId}`);
                return res.status(400).json({ error: 'Missing user data' });
            }

            const price = plan.priceUsd;

            if (paymentRecord) {
                await completePaymentRecord(paymentRecord, transactionId);
                console.log(`[Payment] Updated payment ${paymentRecord.reference} to completed for RevenueCat tx ${transactionId}`);
            } else {
                // Fallback: create a new record (no matching pending record found)
                paymentRecord = await Payment.create({
                    reference: transactionId,
                    type: 'fiat',
                    provider: 'revenuecat',
                    amount: price,
                    currency: 'USD',
                    status: 'completed',
                    metadata: {
                        domainName: domainName,
                        years: plan.years,
                        userId: user.user_id,
                        userWallet: user.wallet,
                        userEmail: user.recovery_email || user.email
                    },
                    completed_at: new Date()
                });
            }

            const wallet = user.wallet;

            console.log(`[Payment] Valid RevenueCat Fiat Purchase! Payment recorded for ${domainName}.cid for ${wallet}. Finalizing registration server-side.`);

            const fulfillment = await attemptPaymentFulfillment(paymentRecord, transactionId);

            // Emit payment completed event (subscribers handle email, activity)
            eventBus.emit(EVENTS.PAYMENT_COMPLETED, {
                userId: user.user_id,
                email: user.recovery_email || user.email,
                wallet: wallet,
                amount: price,
                currency: 'USD',
                items: `${domainName}.cid Domain Registration (${plan.years} year${plan.years > 1 ? 's' : ''})`,
                transactionId: transactionId,
                provider: 'revenuecat'
            });

            if (!fulfillment.minted) {
                console.warn(`[Payment] RevenueCat fulfillment deferred for ${paymentRecord.reference}: ${fulfillment.error}`);
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('[Payment] RevenueCat Webhook Error:', error);
        res.status(500).json({ error: 'Internal server error while processing webhook' });
    }
});

// POST /api/payment/revenuecat/create
// Initializes a fiat payment session (Stripe/RevenueCat)
router.post('/revenuecat/create', requireAuth, async (req, res) => {
    try {
        const { domainName, years } = req.body;
        const userId = req.user.userId;
        const userEmail = req.user.email || '';
        const userWallet = req.user.wallet;

        const plan = getCheckoutPlan(years);
        const priceUsd = plan.priceUsd;

        // Note: For RevenueCat Web Billing, we usually create a Stripe Checkout session
        // that RevenueCat tracks via webhooks. Here we'll generate a secure checkout link.
        // For now, we simulate the redirection to a real checkout provider
        // but store the intent in our database for webhook matching.

        const reference = `rc_ref_${crypto.randomBytes(8).toString('hex')}`;

        // Construct redirect URL so the user returns to the app after payment
        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
        const redirectUrl = `${origin}/cns-success?reference=${reference}`;

        await Payment.create({
            reference: reference,
            type: 'fiat',
            provider: 'revenuecat',
            amount: priceUsd,
            currency: 'USD',
            status: 'pending',
            metadata: {
                domainName,
                years: plan.years,
                userId,
                userWallet,
                userEmail
            }
        });

        // In a full production setup with Stripe + RC:
        // const session = await stripe.checkout.sessions.create({...});
        // return res.json({ success: true, checkoutUrl: session.url });

        // Placeholder that mimics the real behavior for now
        // Real RevenueCat Purchase Link provided by user - direct to checkout using package_id
        const purchaseLink = `https://pay.rev.cat/xkvcmsuutoelrqal/${reference}?package_id=${encodeURIComponent(plan.revenueCatPackageId)}`;

        res.json({
            success: true,
            checkoutUrl: purchaseLink,
            redirectUrl, // Frontend uses this to know where to navigate on return
            orderId: reference
        });

    } catch (error) {
        console.error('[Payment] RevenueCat Creation Error:', error);
        res.status(500).json({ error: 'Failed to initialize fiat checkout session' });
    }
});

// POST /api/payment/boomfi/create
// Creates a Boomfi payment session via their Merchant API
router.post('/boomfi/create', requireAuth, async (req, res) => {
    try {
        const { domainName, years, currency } = req.body;
        const userId = req.user.userId;
        const userEmail = req.body.userEmail || req.user.email || '';
        const userName = req.body.userName || '';
        const userWallet = req.user.wallet;

        const boomfiApiKey = process.env.BOOMFI_API_KEY;
        if (!boomfiApiKey) {
            console.error('[Payment] BOOMFI_API_KEY not configured');
            return res.status(500).json({ error: 'Payment provider not configured' });
        }

        const plan = getCheckoutPlan(years);
        const priceUsd = plan.priceUsd;

        // Create a unique reference for tracking
        const reference = `bf_ref_${crypto.randomBytes(8).toString('hex')}`;

        // Construct redirect URL so the user returns to the app after payment
        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
        const boomfiRedirectUrl = `${origin}/cns-success?reference=${reference}`;

        // Create Boomfi payment via Merchant API
        const boomfiPayload = {
            name: `${domainName}.cid Registration`,
            amount: String(priceUsd),
            currency: 'USD',
            reference: reference,
            description: `CasperID domain: ${domainName}.cid for ${years} year(s)`,
            redirect_url: boomfiRedirectUrl,
            metadata: {
                ext_ref: reference,
                domain_name: domainName,
                years: String(plan.years),
                user_id: userId
            }
        };

        // Add customer info if provided (pre-fills checkout form)
        if (userEmail) {
            boomfiPayload.customer_email = userEmail;
        }
        if (userName) {
            boomfiPayload.customer_name = userName;
        }

        const boomfiResponse = await axios.post(
            'https://mapi.boomfi.xyz/v1/paylinks',
            boomfiPayload,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-API-KEY': boomfiApiKey
                },
                timeout: 30000
            }
        );

        // Boomfi returns data nested in 'data' field
        const responseData = boomfiResponse.data.data || boomfiResponse.data;
        const paylinkId = responseData.id;

        if (!paylinkId) {
            console.error('[Payment] Boomfi API did not return id:', boomfiResponse.data);
            return res.status(500).json({ error: 'Failed to create payment link' });
        }

        // Construct checkout URL from paylink ID
        // Try to pre-fill customer info via query params
        const checkoutParams = new URLSearchParams();
        if (userEmail) checkoutParams.set('email', userEmail);
        if (userName) checkoutParams.set('name', userName);

        const queryString = checkoutParams.toString();
        const checkoutUrl = `https://pay.boomfi.xyz/${paylinkId}${queryString ? '?' + queryString : ''}`;

        console.log(`[Payment] Boomfi paylink created successfully - id: ${paylinkId}, checkoutUrl: ${checkoutUrl}`);

        // Save payment record
        await Payment.create({
            reference: reference,
            type: 'crypto',
            provider: 'boomfi',
            amount: priceUsd,
            currency: 'USD',
            payCurrency: currency || 'USDC',
            status: 'pending',
            orderId: paylinkId,
            metadata: {
                domainName,
                years: plan.years,
                userId,
                userWallet,
                userEmail,
                userName,
                boomfiPaylinkId: paylinkId
            }
        });

        console.log(`[Payment] Returning to frontend - ref: ${reference}, checkoutUrl: ${checkoutUrl}`);

        res.json({
            success: true,
            checkoutUrl: checkoutUrl,
            redirectUrl: boomfiRedirectUrl, // Frontend uses this to know where to navigate on return
            orderId: reference
        });

    } catch (error) {
        console.error('[Payment] Boomfi API Error:', error.response?.data || error.message);

        const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            'Failed to initialize crypto checkout session';

        res.status(500).json({ error: errorMessage });
    }
});

// POST /api/payment/boomfi/webhook
// Boomfi signature: HMAC-SHA256, message = timestamp + "." + raw_body
router.post('/boomfi/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const webhookSecret = process.env.BOOMFI_WEBHOOK_SECRET;
        const signature = req.headers['x-boomfi-signature'];
        const timestamp = req.headers['x-boomfi-timestamp'];

        // req.body is a Buffer when using express.raw()
        const rawBody = req.body;
        const rawBodyString = rawBody.toString();

        // Verify HMAC-SHA256 signature if secret is configured
        if (webhookSecret) {
            if (!signature || !timestamp) {
                console.error('[Payment] Boomfi webhook missing signature or timestamp header');
                return res.status(401).json({ error: 'Missing signature headers' });
            }

            // Message format from docs: timestamp + "." + raw_request_body
            const message = `${timestamp}.${rawBodyString}`;
            const hmac = crypto.createHmac('sha256', webhookSecret);
            const expectedSignature = hmac.update(message).digest('base64');

            if (signature !== expectedSignature) {
                console.error('[Payment] Invalid Boomfi signature');
                console.error(`[Payment] Expected: ${expectedSignature}, Got: ${signature}`);
                return res.status(401).json({ error: 'Invalid Boomfi Signature' });
            }
        }

        // Parse the raw body as JSON
        const payload = JSON.parse(rawBodyString);

        // Log the event type for debugging
        console.log(`[Payment] Boomfi webhook received - event: ${payload.event}, status: ${payload.status}, id: ${payload.id}`);

        // Handle payment completion based on Boomfi event naming: Payment.Completed, Payment.Updated
        const eventType = payload.event;
        const isCompleted = eventType === 'Payment.Completed' ||
            (eventType === 'Payment.Updated' && payload.status === 'Completed');

        if (isCompleted) {
            const paymentId = payload.id;
            // External reference is in metadata.ext_ref
            const externalRef = payload.metadata?.ext_ref;

            console.log(`[Payment] Boomfi payment completed - paymentId: ${paymentId}, ext_ref: ${externalRef}`);

            // Try to find by our reference (ext_ref matches our 'bf_ref_...')
            const payment = await Payment.findOne({
                $or: [{ reference: externalRef }, { reference: paymentId }],
                status: 'pending'
            });

            if (payment) {
                await completePaymentRecord(payment, paymentId);

                const metadata = payment.metadata;

                if (metadata && metadata.domainName) {
                    // Find the user to get their wallet
                    const user = await UserAccount.findOne({ user_id: metadata.userId });
                    const walletAddress = user ? user.wallet : metadata.wallet;

                    if (walletAddress) {
                        console.log(`[Payment] Boomfi payment success! Payment recorded for ${metadata.domainName}.cid for ${walletAddress}. Finalizing registration server-side.`);

                        const fulfillment = await attemptPaymentFulfillment(payment, paymentId);

                        // Emit payment completed event (subscribers handle email, activity)
                        const userEmail = user?.recovery_email || user?.email || metadata.userEmail;
                        const years = metadata.years || 1;

                        eventBus.emit(EVENTS.PAYMENT_COMPLETED, {
                            userId: user?.user_id || metadata.userId,
                            email: userEmail,
                            wallet: walletAddress,
                            amount: payment.amount,
                            currency: payment.currency || 'USD',
                            items: `${metadata.domainName}.cid Domain Registration (${years} year${years > 1 ? 's' : ''})`,
                            transactionId: paymentId,
                            provider: 'boomfi'
                        });

                        if (!fulfillment.minted) {
                            console.warn(`[Payment] Boomfi fulfillment deferred for ${payment.reference}: ${fulfillment.error}`);
                        }
                    } else {
                        console.error('[Payment] No wallet found for Boomfi payment', externalRef);
                    }
                }
            } else {
                console.warn(`[Payment] Boomfi webhook: no pending payment found for ext_ref: ${externalRef}, paymentId: ${paymentId}`);
            }
        } else if (eventType === 'Payment.Failed' || payload.status === 'Failed') {
            // Handle failed payments
            const externalRef = payload.metadata?.ext_ref;
            console.warn(`[Payment] Boomfi payment failed for ext_ref: ${externalRef}`);

            const payment = await Payment.findOne({ reference: externalRef, status: 'pending' });
            if (payment) {
                payment.status = 'failed';
                await payment.save();
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('[Payment] Boomfi Webhook Error:', error);
        res.status(500).json({ error: 'Internal server error processing crypto webhook' });
    }
});

// GET /api/payment/status/:reference
// Checks payment status. If fulfillment was deferred, this can retry registration.
router.get('/status/:reference', async (req, res) => {
    try {
        const { reference } = req.params;

        const payment = await Payment.findOne({ reference });

        if (!payment) {
            return res.json({ success: false, status: 'not_found', error: 'Payment not found' });
        }

        // Payment is still pending — frontend should keep polling
        if (payment.status === 'pending' || payment.status === 'confirming') {
            return res.json({ success: true, status: payment.status });
        }

        // Payment failed
        if (payment.status === 'failed' || payment.status === 'expired') {
            return res.json({ success: true, status: payment.status });
        }

        // Payment completed — return minted state, retrying fulfillment only if needed
        if (payment.status === 'completed') {
            const fulfillment = await attemptPaymentFulfillment(payment, payment.orderId || payment.reference);

            if (fulfillment.minted) {
                return res.json({
                    success: true,
                    status: 'completed',
                    minted: true,
                    name: fulfillment.name,
                    txHash: fulfillment.txHash,
                    alreadyMinted: fulfillment.alreadyMinted
                });
            }

            return res.json({
                success: true,
                status: 'completed',
                minted: false,
                error: fulfillment.error || 'Payment confirmed but domain registration is still pending'
            });
        }

        return res.json({ success: true, status: payment.status });
    } catch (error) {
        console.error('[Payment] Status Error:', error);
        res.status(500).json({ success: false, error: 'Failed to check payment status' });
    }
});

module.exports = router;
