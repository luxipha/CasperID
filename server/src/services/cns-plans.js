const cnsPlansConfig = require('../../../shared/cns-plans.json');

const PACKAGE_ENV_BY_YEARS = {
    1: 'REVENUECAT_PACKAGE_1_YEAR',
    3: 'REVENUECAT_PACKAGE_3_YEAR',
    100: 'REVENUECAT_PACKAGE_LIFETIME'
};

function getPlans() {
    return cnsPlansConfig.plans.map((plan) => ({
        ...plan,
        revenueCatPackageId: process.env[PACKAGE_ENV_BY_YEARS[plan.years]] || plan.revenueCatPackageId
    }));
}

function getPlanByYears(years) {
    const normalizedYears = Number(years);
    return getPlans().find((plan) => plan.years === normalizedYears) || null;
}

function getDefaultPlan() {
    return getPlanByYears(cnsPlansConfig.defaultYears) || getPlans()[0];
}

function getPlanByRevenueCatProductId(productId) {
    if (!productId) {
        return null;
    }

    const normalizedProductId = String(productId).toLowerCase();

    return getPlans().find((plan) => {
        if (plan.revenueCatPackageId && plan.revenueCatPackageId.toLowerCase() === normalizedProductId) {
            return true;
        }

        return (plan.legacyRevenueCatHints || []).some((hint) => normalizedProductId.includes(hint.toLowerCase()));
    }) || null;
}

module.exports = {
    cnsPlansConfig,
    getPlans,
    getPlanByYears,
    getDefaultPlan,
    getPlanByRevenueCatProductId
};
