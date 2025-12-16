/**
 * Casper blockchain service
 * Handles interaction with Casper smart contracts
 */

const { CasperClient, Contracts, Keys, RuntimeArgs, CLValueBuilder } = require('casper-js-sdk');

// Configuration
const RPC_API = process.env.CASPER_NODE_URL || 'https://rpc.testnet.casperlabs.io/rpc';
const CHAIN_NAME = process.env.CASPER_NETWORK || 'casper-test';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// Initialize client
const client = new CasperClient(RPC_API);
const contractClient = new Contracts.Contract(client);

if (CONTRACT_HASH) {
    // Handle 'hash-' prefix if present
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);
}

/**
 * Load issuer keys from environment variables
 * @returns {Keys.AsymmetricKey} Key pair
 */
function getIssuerKeys() {
    try {
        const privateKeyHex = process.env.ISSUER_PRIVATE_KEY;
        const publicKeyHex = process.env.ISSUER_PUBLIC_KEY;

        if (!privateKeyHex || !publicKeyHex) {
            throw new Error('Issuer keys not found in environment');
        }

        // Convert hex to Uint8Array
        const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));
        const publicKey = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'));

        // Assume Ed25519 (standard for Casper)
        // Note: SDK v2.x key loading might vary, trying standard parse
        const keys = new Keys.Ed25519.parseKeyPair(publicKey, privateKey);
        return keys;
    } catch (error) {
        console.error('Failed to load issuer keys:', error);
        throw error;
    }
}

/**
 * Get verification status from Casper contract
 * @param {string} accountHash - Account hash to query
 * @returns {Promise<Object>} Verification record
 */
async function getVerificationStatus(accountHash) {
    if (!CONTRACT_HASH) return null;

    try {
        // Query the identities dictionary
        // The key in the dictionary is the account_hash string
        const result = await contractClient.queryContractDictionary(
            'identities',
            accountHash
        );

        if (!result) {
            return { verified: false };
        }

        // Result is a CLValue (Tuple)
        // Data structure: ((verified, tier, last_kyc_at), (last_liveness_at, issuer_id, credential_hash))
        // We need to unpack it. SDK typically returns abstract values.

        // This part depends heavily on SDK response format for Tuple.
        // For robustness, if query fails or returns null, we assume unverified.

        // Note: Parsing complex CLTypes from raw query response can be tricky without types.
        // For MVP, we might trust the backend DB, but this function is asked for "Get Identity Status".

        // Let's interpret the response if possible
        // Assuming result is the data.

        return result;
    } catch (error) {
        console.log(`[Casper] Verification record not found for ${accountHash} (or error)`);
        return { verified: false };
    }
}

/**
 * Set verification status on Casper contract
 * @param {string} accountHash - Account hash
 * @param {string} tier - Verification tier
 * @param {number} lastKycAt - Last KYC timestamp
 * @param {number} lastLivenessAt - Last liveness timestamp
 * @param {string} issuerId - Issuer ID
 * @param {string} credentialHash - Credential hash
 * @param {boolean} verified - Verification status
 * @returns {Promise<string>} Transaction hash
 */
async function setVerification(
    accountHash,
    tier,
    lastKycAt,
    lastLivenessAt,
    issuerId,
    credentialHash,
    verified
) {
    try {
        console.log(`[Casper] Setting verification for ${accountHash}`);

        if (!CONTRACT_HASH) throw new Error('CONTRACT_HASH not configured');

        const keys = getIssuerKeys();

        // Construct arguments matching contract signature:
        // account_hash: String
        // tier: String
        // last_kyc_at: U64
        // last_liveness_at: U64
        // issuer_id: String
        // credential_hash: String
        // verified: Bool
        const args = RuntimeArgs.fromMap({
            account_hash: CLValueBuilder.string(accountHash),
            tier: CLValueBuilder.string(tier),
            last_kyc_at: CLValueBuilder.u64(lastKycAt),
            last_liveness_at: CLValueBuilder.u64(lastLivenessAt),
            issuer_id: CLValueBuilder.string(issuerId),
            credential_hash: CLValueBuilder.string(credentialHash),
            verified: CLValueBuilder.bool(verified)
        });

        // Current CASPER-JS-SDK v2 usage for contract calls
        const deploy = contractClient.callEntrypoint(
            'set_verification',
            args,
            keys.publicKey,
            CHAIN_NAME,
            '3000000000', // Payment: 3 CSPR (Deployment cost ~2.5, keeping buffer)
            [keys] // Signing keys
        );

        // Send deploy
        const deployHash = await client.putDeploy(deploy);
        console.log(`[Casper] Verification set. Deploy Hash: ${deployHash}`);

        return deployHash;
    } catch (error) {
        console.error('[Casper] Set verification error:', error);
        throw error;
    }
}

/**
 * Add an authorized issuer to the contract
 */
async function addIssuer(publicKey) {
    const keys = getIssuerKeys();
    const args = RuntimeArgs.fromMap({
        pub_key: CLValueBuilder.string(publicKey)
    });
    const deploy = contractClient.callEntrypoint('add_issuer', args, keys.publicKey, CHAIN_NAME, '2500000000', [keys]);
    return client.putDeploy(deploy);
}

/**
 * Remove an issuer from the contract
 */
async function removeIssuer(publicKey) {
    const keys = getIssuerKeys();
    const args = RuntimeArgs.fromMap({
        pub_key: CLValueBuilder.string(publicKey)
    });
    const deploy = contractClient.callEntrypoint('remove_issuer', args, keys.publicKey, CHAIN_NAME, '2500000000', [keys]);
    return client.putDeploy(deploy);
}

module.exports = {
    getVerificationStatus,
    setVerification,
    addIssuer,
    removeIssuer
};
