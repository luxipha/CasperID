const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { Payment, UserAccount, VerificationRequestV2, AdminSetting } = require('../database/models');
const { eventBus, EVENTS } = require('../services/eventBus');
const { requireAuth } = require('../middleware/auth');
const { getPlanByYears, getDefaultPlan, getPlanByRevenueCatProductId } = require('../services/cns-plans');
const { finalizeCompletedPayment } = require('../services/payment-fulfillment');
const monnifyService = require('../services/monnify');

function getCheckoutPlan(years) {
    return getPlanByYears(years) || getDefaultPlan();
}

const MONNIFY_PAYMENT_METHODS = ['CARD', 'ACCOUNT_TRANSFER', 'USSD'];
const PAYMENT_SETTINGS_KEY = 'payment_settings';
const DEFAULT_MONNIFY_USD_TO_NGN_RATE = Number(process.env.MONNIFY_USD_TO_NGN_RATE || process.env.NGN_USD_RATE || 1650);
const DEFAULT_VERIFICATION_FEE_NGN = Number(
    process.env.MONNIFY_VERIFICATION_FEE_NGN ||
    process.env.MONNIFY_NIN_VERIFICATION_FEE_NGN ||
    process.env.MONNIFY_BVN_VERIFICATION_FEE_NGN ||
    1500
);

function resolveOrigin(req) {
    return req.headers.origin || `${req.protocol}://${req.get('host')}`;
}

async function getPaymentSettings() {
    const settingsRecord = await AdminSetting.findOne({ key: PAYMENT_SETTINGS_KEY }).lean();
    const settings = settingsRecord?.value || {};

    const verificationFeeNgn = Number(settings.verification_fee_ngn);
    const usdToNgnRate = Number(settings.usd_to_ngn_rate);

    return {
        verificationFeeNgn: Number.isFinite(verificationFeeNgn) && verificationFeeNgn > 0
            ? verificationFeeNgn
            : DEFAULT_VERIFICATION_FEE_NGN,
        usdToNgnRate: Number.isFinite(usdToNgnRate) && usdToNgnRate > 0
            ? usdToNgnRate
            : DEFAULT_MONNIFY_USD_TO_NGN_RATE
    };
}

function buildVerificationPricing(verificationFeeNgn) {
    return {
        nimc: {
            amount: verificationFeeNgn,
            currency: 'NGN'
        },
        bvn: {
            amount: verificationFeeNgn,
            currency: 'NGN'
        }
    };
}

function convertUsdToNgn(usdAmount, fxRate) {
    if (!Number.isFinite(fxRate) || fxRate <= 0) {
        throw new Error('Monnify NGN conversion rate is not configured');
    }

    return {
        fxRate,
        ngnAmount: Math.ceil(Number(usdAmount) * fxRate)
    };
}

function buildDashboardRedirectUrl(origin, params) {
    const searchParams = new URLSearchParams(params);
    return `${origin}/dashboard?${searchParams.toString()}`;
}

function isVerificationPayment(payment) {
    return payment?.metadata?.purpose === 'verification';
}

function isCnsPayment(payment) {
    return payment?.metadata?.purpose === 'cns' || !!payment?.metadata?.domainName;
}

async function emitCnsPaymentCompleted(payment, transactionId) {
    const metadata = payment.metadata || {};
    const user = await UserAccount.findOne({ user_id: metadata.userId });
    const walletAddress = user ? user.wallet : metadata.userWallet;
    const userEmail = user?.recovery_email || user?.email || metadata.userEmail;
    const years = metadata.years || 1;

    if (!walletAddress) {
        console.error('[Payment] No wallet found for Monnify CNS payment', payment.reference);
        return;
    }

    eventBus.emit(EVENTS.PAYMENT_COMPLETED, {
        userId: user?.user_id || metadata.userId,
        email: userEmail,
        wallet: walletAddress,
        amount: payment.amount,
        currency: payment.currency || 'NGN',
        items: `${metadata.domainName}.cid Domain Registration (${years} year${years > 1 ? 's' : ''})`,
        transactionId,
        provider: 'monnify'
    });
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

async function handleMonnifyPaymentCompletion(payment, transactionId, providerPayload = {}) {
    await completePaymentRecord(payment, transactionId);

    payment.metadata = {
        ...(payment.metadata || {}),
        monnifyTransactionReference: transactionId || payment.metadata?.monnifyTransactionReference,
        monnifyPaymentMethod: providerPayload.paymentMethod || payment.metadata?.monnifyPaymentMethod
    };
    await payment.save();

    if (isCnsPayment(payment)) {
        const fulfillment = await attemptPaymentFulfillment(payment, transactionId);
        await emitCnsPaymentCompleted(payment, transactionId);
        return {
            completed: true,
            fulfillment
        };
    }

    return {
        completed: true,
        verificationEntitled: isVerificationPayment(payment)
    };
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

// POST /api/payment/monnify/cns/create
// Creates a Monnify NGN checkout for .cid registration.
router.post('/monnify/cns/create', requireAuth, async (req, res) => {
    try {
        const { domainName, years } = req.body;
        const userId = req.user.userId;
        const userEmail = req.user.email || '';
        const userWallet = req.user.wallet;

        if (!domainName) {
            return res.status(400).json({ error: 'Domain name is required' });
        }

        const user = await UserAccount.findOne({ user_id: userId });
        const customerName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.cns_name || 'CasperID User';
        const plan = getCheckoutPlan(years);
        const priceUsd = plan.priceUsd;
        const paymentSettings = await getPaymentSettings();
        const { fxRate, ngnAmount } = convertUsdToNgn(priceUsd, paymentSettings.usdToNgnRate);
        const reference = `mnfy_cns_${crypto.randomBytes(8).toString('hex')}`;
        const origin = resolveOrigin(req);
        const redirectUrl = buildDashboardRedirectUrl(origin, {
            view: 'register-cid',
            paymentProvider: 'monnify',
            paymentPurpose: 'cns',
            paymentReference: reference
        });

        const transaction = await monnifyService.initializeTransaction({
            amount: ngnAmount,
            customerEmail: userEmail,
            customerName,
            paymentReference: reference,
            paymentDescription: `CasperID domain registration for ${domainName}.cid`,
            currencyCode: 'NGN',
            redirectUrl,
            paymentMethods: MONNIFY_PAYMENT_METHODS,
            metadata: {
                purpose: 'cns',
                domainName,
                years: String(plan.years),
                userId
            }
        });

        await Payment.create({
            reference,
            type: 'fiat',
            provider: 'monnify',
            amount: ngnAmount,
            currency: 'NGN',
            status: 'pending',
            orderId: transaction.transactionReference || reference,
            metadata: {
                purpose: 'cns',
                country: 'nigeria',
                domainName,
                years: plan.years,
                userId,
                userWallet,
                userEmail,
                userName: customerName,
                usdBasePrice: priceUsd,
                fxRate,
                monnifyTransactionReference: transaction.transactionReference || null,
                monnifyCheckoutUrl: transaction.checkoutUrl || null
            }
        });

        res.json({
            success: true,
            checkoutUrl: transaction.checkoutUrl,
            redirectUrl,
            orderId: reference,
            amount: ngnAmount,
            currency: 'NGN',
            usdBasePrice: priceUsd,
            fxRate
        });
    } catch (error) {
        console.error('[Payment] Monnify CNS creation error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.message || 'Failed to initialize Monnify checkout'
        });
    }
});

// POST /api/payment/monnify/verification/create
// Creates a request-scoped Monnify checkout for Nigeria verification.
router.post('/monnify/verification/create', requireAuth, async (req, res) => {
    try {
        const { requestId, verificationMethod, redirectPath } = req.body;
        const method = String(verificationMethod || '').trim().toLowerCase();
        const paymentSettings = await getPaymentSettings();
        const pricing = buildVerificationPricing(paymentSettings.verificationFeeNgn)[method];

        if (!requestId || !pricing) {
            return res.status(400).json({
                error: 'requestId and a valid verificationMethod are required'
            });
        }

        const verificationRequest = await VerificationRequestV2.findOne({
            request_id: requestId,
            user_id: req.user.userId,
            verification_tier: 'layer_3',
            status: { $in: ['pending', 'in_progress'] }
        });

        if (!verificationRequest) {
            return res.status(404).json({
                error: 'Active Layer 3 verification request not found'
            });
        }

        const existingCompleted = await Payment.findOne({
            provider: 'monnify',
            status: 'completed',
            'metadata.purpose': 'verification',
            'metadata.verificationRequestId': requestId,
            'metadata.verificationMethod': method,
            'metadata.userId': req.user.userId
        });

        if (existingCompleted) {
            return res.json({
                success: true,
                status: 'completed',
                orderId: existingCompleted.reference,
                paymentReference: existingCompleted.reference
            });
        }

        const pendingPayment = await Payment.findOne({
            provider: 'monnify',
            status: 'pending',
            'metadata.purpose': 'verification',
            'metadata.verificationRequestId': requestId,
            'metadata.verificationMethod': method,
            'metadata.userId': req.user.userId
        });

        if (pendingPayment?.metadata?.monnifyCheckoutUrl) {
            return res.json({
                success: true,
                checkoutUrl: pendingPayment.metadata.monnifyCheckoutUrl,
                redirectUrl: pendingPayment.metadata.redirectPath || null,
                orderId: pendingPayment.reference,
                paymentReference: pendingPayment.reference,
                amount: pendingPayment.amount,
                currency: pendingPayment.currency
            });
        }

        const user = await UserAccount.findOne({ user_id: req.user.userId });
        const customerName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'CasperID User';
        const reference = `mnfy_ver_${crypto.randomBytes(8).toString('hex')}`;
        const origin = resolveOrigin(req);
        const targetRedirectPath = redirectPath || `/dashboard?view=kyc&paymentProvider=monnify&paymentPurpose=verification&paymentReference=${reference}&requestId=${encodeURIComponent(requestId)}&method=${encodeURIComponent(method)}`;
        const redirectUrl = targetRedirectPath.startsWith('http')
            ? targetRedirectPath
            : `${origin}${targetRedirectPath.startsWith('/') ? '' : '/'}${targetRedirectPath}`;

        const transaction = await monnifyService.initializeTransaction({
            amount: pricing.amount,
            customerEmail: req.user.email || user?.recovery_email || user?.email,
            customerName,
            paymentReference: reference,
            paymentDescription: `CasperID ${method.toUpperCase()} verification`,
            currencyCode: pricing.currency,
            redirectUrl,
            paymentMethods: MONNIFY_PAYMENT_METHODS,
            metadata: {
                purpose: 'verification',
                requestId,
                verificationMethod: method,
                userId: req.user.userId
            }
        });

        await Payment.create({
            reference,
            type: 'fiat',
            provider: 'monnify',
            amount: pricing.amount,
            currency: pricing.currency,
            status: 'pending',
            orderId: transaction.transactionReference || reference,
            metadata: {
                purpose: 'verification',
                country: 'nigeria',
                userId: req.user.userId,
                userWallet: req.user.wallet,
                userEmail: req.user.email || user?.recovery_email || user?.email,
                userName: customerName,
                verificationMethod: method,
                verificationRequestId: requestId,
                redirectPath: targetRedirectPath,
                monnifyTransactionReference: transaction.transactionReference || null,
                monnifyCheckoutUrl: transaction.checkoutUrl || null
            }
        });

        res.json({
            success: true,
            checkoutUrl: transaction.checkoutUrl,
            redirectUrl,
            orderId: reference,
            paymentReference: reference,
            amount: pricing.amount,
            currency: pricing.currency
        });
    } catch (error) {
        console.error('[Payment] Monnify verification creation error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.message || 'Failed to initialize Monnify verification checkout'
        });
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

// POST /api/payment/monnify/webhook
// Monnify signs production webhooks with monnify-signature.
router.post('/monnify/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const rawBodyBuffer = req.body;
        const rawBody = rawBodyBuffer.toString();
        const signature = req.headers['monnify-signature'];

        if (!monnifyService.verifyWebhookSignature(rawBody, signature)) {
            console.error('[Payment] Invalid Monnify webhook signature');
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        const payload = JSON.parse(rawBody);
        const eventType = String(payload.eventType || '').toUpperCase();
        const eventData = payload.eventData || {};
        const paymentReference = eventData.paymentReference;
        const transactionReference = eventData.transactionReference;
        const paymentStatus = eventData.paymentStatus;

        if (eventType !== 'SUCCESSFUL_TRANSACTION' || !paymentReference) {
            return res.json({ received: true });
        }

        if (!monnifyService.isSuccessfulPaymentStatus(paymentStatus)) {
            return res.json({ received: true });
        }

        const payment = await Payment.findOne({ reference: paymentReference });
        if (!payment) {
            console.warn(`[Payment] Monnify webhook: no payment found for ${paymentReference}`);
            return res.json({ received: true });
        }

        if (payment.status === 'completed') {
            return res.json({ received: true, status: 'already_completed' });
        }

        await handleMonnifyPaymentCompletion(payment, transactionReference || paymentReference, {
            paymentMethod: eventData.paymentMethod
        });

        res.json({ received: true });
    } catch (error) {
        console.error('[Payment] Monnify webhook error:', error);
        res.status(500).json({ error: 'Internal server error processing Monnify webhook' });
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
            if (payment.provider === 'monnify') {
                try {
                    const providerPayment = await monnifyService.queryTransactionByReference(reference);
                    if (monnifyService.isSuccessfulPaymentStatus(providerPayment.paymentStatus)) {
                        await handleMonnifyPaymentCompletion(payment, providerPayment.transactionReference || payment.orderId || reference, {
                            paymentMethod: providerPayment.paymentMethod
                        });
                    } else if (monnifyService.isFailedPaymentStatus(providerPayment.paymentStatus)) {
                        payment.status = providerPayment.paymentStatus === 'EXPIRED' ? 'expired' : 'failed';
                        await payment.save();
                    }
                } catch (error) {
                    console.warn(`[Payment] Monnify status query failed for ${reference}:`, error.message);
                }
            }

            if (payment.status === 'pending' || payment.status === 'confirming') {
                return res.json({
                    success: true,
                    status: payment.status,
                    purpose: payment.metadata?.purpose || null,
                    provider: payment.provider
                });
            }
        }

        // Payment failed
        if (payment.status === 'failed' || payment.status === 'expired') {
            return res.json({
                success: true,
                status: payment.status,
                purpose: payment.metadata?.purpose || null,
                provider: payment.provider
            });
        }

        // Payment completed — return minted state, retrying fulfillment only if needed
        if (payment.status === 'completed') {
            if (isVerificationPayment(payment)) {
                return res.json({
                    success: true,
                    status: 'completed',
                    provider: payment.provider,
                    purpose: 'verification',
                    entitled: true,
                    verificationMethod: payment.metadata?.verificationMethod || null,
                    verificationRequestId: payment.metadata?.verificationRequestId || null
                });
            }

            const fulfillment = await attemptPaymentFulfillment(payment, payment.orderId || payment.reference);

            if (fulfillment.minted) {
                return res.json({
                    success: true,
                    status: 'completed',
                    provider: payment.provider,
                    purpose: payment.metadata?.purpose || 'cns',
                    minted: true,
                    name: fulfillment.name,
                    txHash: fulfillment.txHash,
                    alreadyMinted: fulfillment.alreadyMinted
                });
            }

            return res.json({
                success: true,
                status: 'completed',
                provider: payment.provider,
                purpose: payment.metadata?.purpose || 'cns',
                minted: false,
                error: fulfillment.error || 'Payment confirmed but domain registration is still pending'
            });
        }

        return res.json({
            success: true,
            status: payment.status,
            purpose: payment.metadata?.purpose || null,
            provider: payment.provider
        });
    } catch (error) {
        console.error('[Payment] Status Error:', error);
        res.status(500).json({ success: false, error: 'Failed to check payment status' });
    }
});

module.exports = router;
