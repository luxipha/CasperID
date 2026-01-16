/**
 * Script to add the current issuer to the contract's authorized issuers list
 *
 * IMPORTANT: This script must be run with the ORIGINAL DEPLOYER's keys
 * (the account that deployed the contract and is already authorized)
 *
 * Usage:
 *   1. Set DEPLOYER_PRIVATE_KEY and DEPLOYER_PUBLIC_KEY in .env (or below)
 *   2. Run: node scripts/add-issuer.js
 */

require('dotenv').config();
const { CasperClient, Contracts, Keys, RuntimeArgs, CLValueBuilder } = require('casper-js-sdk');

// Configuration
const RPC_API = process.env.CASPER_NODE_URL || 'https://rpc.testnet.casperlabs.io/rpc';
const CHAIN_NAME = process.env.CASPER_NETWORK || 'casper-test';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// The issuer account hash to add (calculated from ISSUER_PUBLIC_KEY)
const ISSUER_ACCOUNT_HASH_TO_ADD = 'account-hash-6d7fab74bd3f4be1cf4eb07ecb9e6bb63cd0719ee5c53c09486914460c204a8e';

// You need to set these to the DEPLOYER's keys (whoever deployed the contract)
// These should be different from ISSUER_* keys unless deployer == issuer
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || process.env.ISSUER_PRIVATE_KEY;
const DEPLOYER_PUBLIC_KEY = process.env.DEPLOYER_PUBLIC_KEY || process.env.ISSUER_PUBLIC_KEY;

async function addIssuer() {
    console.log('=== Add Issuer to Contract ===\n');

    if (!CONTRACT_HASH) {
        console.error('ERROR: CONTRACT_HASH not set');
        process.exit(1);
    }

    if (!DEPLOYER_PRIVATE_KEY || !DEPLOYER_PUBLIC_KEY) {
        console.error('ERROR: Deployer keys not set');
        console.error('Set DEPLOYER_PRIVATE_KEY and DEPLOYER_PUBLIC_KEY in .env');
        process.exit(1);
    }

    console.log('Contract Hash:', CONTRACT_HASH);
    console.log('Issuer to add:', ISSUER_ACCOUNT_HASH_TO_ADD);
    console.log('Network:', CHAIN_NAME);
    console.log('RPC:', RPC_API);
    console.log();

    try {
        // Initialize client
        const client = new CasperClient(RPC_API);
        const contractClient = new Contracts.Contract(client);

        // Set contract hash
        const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
        contractClient.setContractHash(`hash-${hash}`);

        // Load deployer keys
        const privateKey = Uint8Array.from(Buffer.from(DEPLOYER_PRIVATE_KEY, 'hex'));
        const publicKey = Uint8Array.from(Buffer.from(DEPLOYER_PUBLIC_KEY, 'hex'));
        const keys = Keys.Ed25519.parseKeyPair(publicKey, privateKey);

        console.log('Deployer public key:', DEPLOYER_PUBLIC_KEY);
        console.log();

        // Build arguments
        const args = RuntimeArgs.fromMap({
            pub_key: CLValueBuilder.string(ISSUER_ACCOUNT_HASH_TO_ADD)
        });

        // Create deploy
        console.log('Creating deploy to add issuer...');
        const deploy = contractClient.callEntrypoint(
            'add_issuer',
            args,
            keys.publicKey,
            CHAIN_NAME,
            '2500000000', // 2.5 CSPR
            [keys]
        );

        // Submit deploy
        console.log('Submitting deploy...');
        const deployHash = await client.putDeploy(deploy);

        console.log();
        console.log('=== SUCCESS ===');
        console.log('Deploy Hash:', deployHash);
        console.log();
        console.log('View on explorer:');
        console.log(`https://testnet.cspr.live/deploy/${deployHash}`);
        console.log();
        console.log('Wait 1-2 minutes for the deploy to execute on-chain.');
        console.log('After confirmation, your issuer will be authorized to call setVerification().');

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error();
        console.error('Common issues:');
        console.error('1. Deployer keys are not the original contract deployer');
        console.error('2. Deployer account has insufficient CSPR balance');
        console.error('3. Network connectivity issues');
    }
}

addIssuer();
