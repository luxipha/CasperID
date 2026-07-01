const { walletToHuman } = require('../utils/wallet-to-human');

function stripCidSuffix(name) {
    if (!name || typeof name !== 'string') {
        return null;
    }

    return name.replace(/\.cid$/i, '');
}

function getRootNameForAccount(userAccount) {
    if (!userAccount) {
        return null;
    }

    const preferredRoot = userAccount.cns_name || userAccount.human_id;
    if (preferredRoot) {
        return stripCidSuffix(preferredRoot);
    }

    if (!userAccount.wallet) {
        return null;
    }

    const { humanId } = walletToHuman(userAccount.wallet);
    return stripCidSuffix(humanId);
}

function buildContextualName(alias, rootName) {
    if (!alias || !rootName) {
        return null;
    }

    return `${alias}.${stripCidSuffix(rootName)}.cid`;
}

function findContextByAlias(contextDids, alias) {
    if (!Array.isArray(contextDids) || !alias) {
        return null;
    }

    return contextDids.find((contextDid) => contextDid.alias === alias) || null;
}

module.exports = {
    stripCidSuffix,
    getRootNameForAccount,
    buildContextualName,
    findContextByAlias
};
