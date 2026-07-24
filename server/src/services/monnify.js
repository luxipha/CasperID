const axios = require('axios');

function resolveBaseUrl() {
    if (process.env.MONNIFY_BASE_URL) {
        return process.env.MONNIFY_BASE_URL;
    }

    const environment = (process.env.MONNIFY_ENVIRONMENT || 'live').trim().toLowerCase();
    return environment === 'sandbox'
        ? 'https://sandbox.monnify.com'
        : 'https://api.monnify.com';
}

const MONNIFY_BASE_URL = resolveBaseUrl();
const MONNIFY_AUTH_PATH = process.env.MONNIFY_AUTH_PATH || '/api/v1/auth/login';
const MONNIFY_NIN_VERIFICATION_PATH = process.env.MONNIFY_NIN_VERIFICATION_PATH || '/api/v1/verification/nin';
const MONNIFY_BVN_VERIFICATION_PATH = process.env.MONNIFY_BVN_VERIFICATION_PATH || '/api/v1/verification/bvn-details-match';
const MONNIFY_INIT_TRANSACTION_PATH = process.env.MONNIFY_INIT_TRANSACTION_PATH || '/api/v1/merchant/transactions/init-transaction';
const MONNIFY_QUERY_TRANSACTION_PATH = process.env.MONNIFY_QUERY_TRANSACTION_PATH || '/api/v2/merchant/transactions/query';

function buildUrl(baseUrl, path) {
    if (!path) return baseUrl;
    if (/^https?:\/\//i.test(path)) return path;
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function pickFirstString(...values) {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return '';
}

function normalizeNinVerificationResponse(payload = {}, nin) {
    const body = payload.responseBody || payload.data || payload.result || payload;
    const firstName = pickFirstString(
        body.firstName,
        body.first_name,
        body.givenName,
        body.given_name
    );
    const middleName = pickFirstString(
        body.middleName,
        body.middle_name
    );
    const lastName = pickFirstString(
        body.lastName,
        body.last_name,
        body.surname
    );
    const fullName = pickFirstString(
        body.fullName,
        body.full_name,
        [firstName, middleName, lastName].filter(Boolean).join(' ')
    );

    return {
        requestSuccessful: payload.requestSuccessful !== false,
        responseCode: payload.responseCode || body.responseCode || null,
        responseMessage: payload.responseMessage || body.responseMessage || null,
        ninInformationMatch: payload.ninInformationMatch ?? body.ninInformationMatch ?? body.ninVerified ?? null,
        identity: {
            nin,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            full_name: fullName,
            date_of_birth: pickFirstString(body.dateOfBirth, body.date_of_birth, body.birthDate),
            gender: pickFirstString(body.gender, body.sex),
            phone_number: pickFirstString(body.phoneNumber, body.phone_number, body.mobileNumber),
            address: pickFirstString(body.address, body.residentialAddress, body.residential_address),
            nationality: pickFirstString(body.nationality) || 'Nigerian'
        },
        raw: payload
    };
}

function normalizeBvnVerificationResponse(payload = {}, details) {
    const body = payload.responseBody || payload.data || payload.result || payload;
    const firstName = pickFirstString(
        body.firstName,
        body.first_name,
        body.givenName,
        body.given_name
    );
    const middleName = pickFirstString(
        body.middleName,
        body.middle_name
    );
    const lastName = pickFirstString(
        body.lastName,
        body.last_name,
        body.surname
    );
    const fullName = pickFirstString(
        body.fullName,
        body.full_name,
        [firstName, middleName, lastName].filter(Boolean).join(' ')
    );

    return {
        requestSuccessful: payload.requestSuccessful !== false,
        responseCode: payload.responseCode || body.responseCode || null,
        responseMessage: payload.responseMessage || body.responseMessage || null,
        bvnInformationMatch: payload.bvnInformationMatch ?? body.bvnInformationMatch ?? body.bvnVerified ?? null,
        identity: {
            bvn: details.bvn,
            account_number: details.accountNumber,
            bank_code: details.bankCode,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            full_name: fullName,
            date_of_birth: pickFirstString(body.dateOfBirth, body.date_of_birth, body.birthDate),
            gender: pickFirstString(body.gender, body.sex),
            phone_number: pickFirstString(body.phoneNumber, body.phone_number, body.mobileNumber),
            address: pickFirstString(body.address, body.residentialAddress, body.residential_address),
            nationality: pickFirstString(body.nationality) || 'Nigerian'
        },
        raw: payload
    };
}

class MonnifyService {
    constructor() {
        this.apiKey = process.env.MONNIFY_API_KEY || '';
        this.secretKey = process.env.MONNIFY_SECRET_KEY || '';
        this.contractCode = process.env.MONNIFY_CONTRACT_CODE || '';
        this.environment = (process.env.MONNIFY_ENVIRONMENT || 'live').trim().toLowerCase();
        this.baseUrl = MONNIFY_BASE_URL;
        this.authUrl = buildUrl(this.baseUrl, MONNIFY_AUTH_PATH);
        this.ninVerificationUrl = buildUrl(this.baseUrl, MONNIFY_NIN_VERIFICATION_PATH);
        this.bvnVerificationUrl = buildUrl(this.baseUrl, MONNIFY_BVN_VERIFICATION_PATH);
        this.initTransactionUrl = buildUrl(this.baseUrl, MONNIFY_INIT_TRANSACTION_PATH);
        this.queryTransactionUrl = buildUrl(this.baseUrl, MONNIFY_QUERY_TRANSACTION_PATH);
    }

    ensureConfigured() {
        if (!this.apiKey || !this.secretKey) {
            throw new Error('Monnify API keys are not configured');
        }
    }

    ensurePaymentConfigured() {
        this.ensureConfigured();
        if (!this.contractCode) {
            throw new Error('Monnify contract code is not configured');
        }
    }

    isLiveVerificationEnvironment() {
        return this.environment !== 'sandbox';
    }

    assertNinVerificationAvailable() {
        if (!this.isLiveVerificationEnvironment()) {
            throw new Error('Monnify NIN verification is only available in live mode. Update MONNIFY_ENVIRONMENT and live credentials before using this step.');
        }
    }

    assertBvnVerificationAvailable() {
        if (!this.isLiveVerificationEnvironment()) {
            throw new Error('Monnify BVN verification is only available in live mode. Update MONNIFY_ENVIRONMENT and live credentials before using this step.');
        }
    }

    async authenticate() {
        this.ensureConfigured();

        const auth = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
        const response = await axios.post(
            this.authUrl,
            {},
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const body = response.data?.responseBody || response.data?.data || response.data;
        const accessToken = body?.accessToken || body?.access_token;

        if (!accessToken) {
            throw new Error('Monnify authentication did not return an access token');
        }

        return accessToken;
    }

    isSandboxEnvironment() {
        return this.environment === 'sandbox';
    }

    isSuccessfulPaymentStatus(status = '') {
        return ['PAID', 'SUCCESS', 'COMPLETED'].includes(String(status || '').trim().toUpperCase());
    }

    isFailedPaymentStatus(status = '') {
        return ['FAILED', 'CANCELLED', 'EXPIRED', 'ABANDONED'].includes(String(status || '').trim().toUpperCase());
    }

    verifyWebhookSignature(rawBody, signature) {
        if (this.isSandboxEnvironment()) {
            return true;
        }

        if (!signature) {
            return false;
        }

        const crypto = require('crypto');
        const expected = crypto
            .createHmac('sha512', this.secretKey)
            .update(rawBody)
            .digest('hex');

        return expected === signature;
    }

    async initializeTransaction({
        amount,
        customerEmail,
        customerName,
        paymentReference,
        paymentDescription,
        currencyCode = 'NGN',
        redirectUrl,
        paymentMethods,
        metadata
    }) {
        this.ensurePaymentConfigured();

        if (!amount || Number(amount) <= 0) {
            throw new Error('Monnify transaction amount must be greater than zero');
        }
        if (!customerEmail) {
            throw new Error('Customer email is required for Monnify checkout');
        }
        if (!paymentReference) {
            throw new Error('Payment reference is required for Monnify checkout');
        }
        if (!paymentDescription) {
            throw new Error('Payment description is required for Monnify checkout');
        }
        if (!redirectUrl) {
            throw new Error('Redirect URL is required for Monnify checkout');
        }

        const accessToken = await this.authenticate();
        const payload = {
            amount: Number(amount),
            customerEmail,
            paymentReference,
            paymentDescription,
            currencyCode,
            contractCode: this.contractCode,
            redirectUrl
        };

        if (customerName) {
            payload.customerName = customerName;
        }
        if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
            payload.paymentMethods = paymentMethods;
        }
        if (metadata && typeof metadata === 'object') {
            payload.metadata = metadata;
        }

        const response = await axios.post(
            this.initTransactionUrl,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return response.data?.responseBody || response.data?.data || response.data;
    }

    async queryTransactionByReference(paymentReference) {
        this.ensurePaymentConfigured();

        if (!paymentReference) {
            throw new Error('Payment reference is required to query Monnify transaction');
        }

        const accessToken = await this.authenticate();
        const response = await axios.get(
            this.queryTransactionUrl,
            {
                params: { paymentReference },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                timeout: 30000
            }
        );

        return response.data?.responseBody || response.data?.data || response.data;
    }

    async verifyNIN(nin) {
        if (!/^\d{11}$/.test(nin)) {
            throw new Error('Invalid NIN. NIN must be 11 digits.');
        }

        this.assertNinVerificationAvailable();

        const accessToken = await this.authenticate();
        let response;

        try {
            response = await axios.post(
                this.ninVerificationUrl,
                { nin },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
        } catch (error) {
            const providerMessage = error.response?.data?.responseMessage ||
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message;
            throw new Error(`Monnify NIN verification failed: ${providerMessage}`);
        }

        return normalizeNinVerificationResponse(response.data, nin);
    }

    async verifyBVN({ bvn, accountNumber, bankCode }) {
        if (!/^\d{11}$/.test(bvn)) {
            throw new Error('Invalid BVN. BVN must be 11 digits.');
        }
        if (!/^\d{10}$/.test(accountNumber)) {
            throw new Error('Invalid account number. Account number must be 10 digits.');
        }
        if (!String(bankCode || '').trim()) {
            throw new Error('Bank code is required for BVN verification.');
        }

        this.assertBvnVerificationAvailable();

        const accessToken = await this.authenticate();
        let response;

        try {
            response = await axios.post(
                this.bvnVerificationUrl,
                {
                    bvn,
                    accountNumber,
                    bankCode
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
        } catch (error) {
            const providerMessage = error.response?.data?.responseMessage ||
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message;
            throw new Error(`Monnify BVN verification failed: ${providerMessage}`);
        }

        return normalizeBvnVerificationResponse(response.data, { bvn, accountNumber, bankCode });
    }
}

module.exports = new MonnifyService();
module.exports.normalizeNinVerificationResponse = normalizeNinVerificationResponse;
module.exports.normalizeBvnVerificationResponse = normalizeBvnVerificationResponse;
