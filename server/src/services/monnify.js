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
        this.environment = (process.env.MONNIFY_ENVIRONMENT || 'live').trim().toLowerCase();
        this.baseUrl = MONNIFY_BASE_URL;
        this.authUrl = buildUrl(this.baseUrl, MONNIFY_AUTH_PATH);
        this.ninVerificationUrl = buildUrl(this.baseUrl, MONNIFY_NIN_VERIFICATION_PATH);
        this.bvnVerificationUrl = buildUrl(this.baseUrl, MONNIFY_BVN_VERIFICATION_PATH);
    }

    ensureConfigured() {
        if (!this.apiKey || !this.secretKey) {
            throw new Error('Monnify API keys are not configured');
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
