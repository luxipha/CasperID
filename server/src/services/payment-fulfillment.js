const { Payment, UserAccount } = require('../database/models');
const cnsResolver = require('./cns-resolver');
const { eventBus, EVENTS } = require('./eventBus');

function getNormalizedRootName(name) {
    const parsed = cnsResolver.parseCidName(name);
    return parsed ? parsed.root : null;
}

async function getUserForPayment(payment) {
    const metadata = payment?.metadata || {};

    if (metadata.userId) {
        const byUserId = await UserAccount.findOne({ user_id: metadata.userId });
        if (byUserId) {
            return byUserId;
        }
    }

    if (metadata.userWallet) {
        const byWallet = await UserAccount.findOne({ wallet: metadata.userWallet });
        if (byWallet) {
            return byWallet;
        }
    }

    return null;
}

async function emitCnsRegisteredEvent({ payment, user, domainName, transactionId }) {
    eventBus.emit(EVENTS.CNS_REGISTERED, {
        userId: user.user_id,
        email: user.recovery_email || user.email,
        wallet: user.wallet,
        domainName,
        years: payment.metadata?.years || 1,
        transactionId: transactionId || payment.reference
    });
}

async function finalizeCompletedPayment(payment, { transactionId } = {}) {
    if (!payment) {
        throw new Error('Payment record is required');
    }

    if (payment.status !== 'completed') {
        throw new Error('Payment is not completed');
    }

    const metadata = payment.metadata || {};
    const domainName = metadata.domainName;
    const normalizedRootName = getNormalizedRootName(domainName);

    if (!normalizedRootName) {
        throw new Error('Missing or invalid domain name in payment record');
    }

    const user = await getUserForPayment(payment);
    if (!user) {
        throw new Error('User not found for payment');
    }

    if (user.cns_name && user.cns_name !== normalizedRootName) {
        throw new Error(`User already owns premium name ${user.cns_name}.cid`);
    }

    if (user.cns_name === normalizedRootName) {
        if (!payment.txHash && user.onchain_name_tx) {
            payment.txHash = user.onchain_name_tx;
            await payment.save();
        }

        return {
            minted: true,
            alreadyMinted: true,
            name: `${normalizedRootName}.cid`,
            txHash: payment.txHash || user.onchain_name_tx || null,
            user
        };
    }

    const result = await cnsResolver.registerPremiumName(user.wallet, domainName);
    payment.txHash = result.txHash || payment.txHash || null;
    payment.completed_at = payment.completed_at || new Date();
    await payment.save();

    await emitCnsRegisteredEvent({
        payment,
        user,
        domainName: normalizedRootName,
        transactionId
    });

    return {
        minted: true,
        alreadyMinted: false,
        name: result.name,
        txHash: result.txHash || null,
        user
    };
}

async function findCompletedPaymentForUser({ reference, userId, wallet, domainName }) {
    if (!reference || !domainName) {
        return null;
    }

    const normalizedRootName = getNormalizedRootName(domainName);
    if (!normalizedRootName) {
        return null;
    }

    const payment = await Payment.findOne({
        reference,
        status: 'completed',
        'metadata.domainName': normalizedRootName,
        $or: [
            { 'metadata.userId': userId },
            { 'metadata.userWallet': wallet }
        ]
    });

    return payment;
}

module.exports = {
    finalizeCompletedPayment,
    findCompletedPaymentForUser,
    getUserForPayment,
    getNormalizedRootName
};
