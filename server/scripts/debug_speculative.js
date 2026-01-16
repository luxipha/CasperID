/* eslint-disable */
require('dotenv').config();
const { CasperClient, Contracts, Keys, RuntimeArgs, CLValueBuilder, CLAccountHash, CLPublicKey } = require('casper-js-sdk');
const { TIER_NUMERIC } = require('../src/constants/tier-levels');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// Failing User
const TARGET_WALLET = 'account-hash-7999f7c4321007b155dfb512f29e0af125eea29339eb96b8f9efee49ba772c78';

function getIssuerKeys() {
    const privateKeyHex = process.env.ISSUER_PRIVATE_KEY;
    const cleanPriv = privateKeyHex.startsWith('01') ? privateKeyHex.slice(2) : privateKeyHex;
    const privateKey = Uint8Array.from(Buffer.from(cleanPriv, 'hex'));
    return Keys.Ed25519.parseKeyPair(Keys.Ed25519.privateToPublicKey(privateKey), privateKey);
}

function toAddressArg(walletAddress) {
    if (walletAddress.startsWith('account-hash-')) {
        const hash = walletAddress.replace('account-hash-', '');
        const bytes = Uint8Array.from(Buffer.from(hash, 'hex'));
        return CLValueBuilder.key(new CLAccountHash(bytes));
    }
    return CLValueBuilder.key(CLPublicKey.fromHex(walletAddress));
}

async function main() {
    console.log('🔍 Testing Speculative Execution');

    if (!CONTRACT_HASH) { console.log('No Contract Hash'); return; }

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    const keys = getIssuerKeys();

    // Construct Mint Deploy
    const args = RuntimeArgs.fromMap({
        user: toAddressArg(TARGET_WALLET),
        tier: CLValueBuilder.u8(1)
    });

    const deploy = contractClient.callEntrypoint(
        'mint_master_did',
        args,
        keys.publicKey,
        'casper-test',
        '3500000000',
        [keys]
    );

    console.log('🚀 Sending Speculative Deploy...');
    try {
        // Speculative deploy usually checks validity and execution result
        const result = await client.speculativeDeploy(deploy);
        console.log('✅ Result:', JSON.stringify(result, null, 2));

        // check for execution_result.Failure
        if (result.execution_result && result.execution_result.Failure) {
            console.log('DETECTED FAILURE:', JSON.stringify(result.execution_result.Failure));
        }
    } catch (e) {
        console.error('❌ Speculative Error:', e.message);
        console.log('Details:', e);
    }
}

main();
