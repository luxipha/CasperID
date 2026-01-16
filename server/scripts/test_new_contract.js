/**
 * Test the new IdentityRegistry contract integration
 */
require('dotenv').config();
const { CasperClient, Contracts, CLPublicKey, RuntimeArgs, CLValueBuilder, CLAccountHash } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;
const ISSUER_PUBLIC_KEY = process.env.ISSUER_PUBLIC_KEY;

async function main() {
    console.log('='.repeat(60));
    console.log('TEST NEW IDENTITY REGISTRY CONTRACT');
    console.log('='.repeat(60));

    if (!CONTRACT_HASH) {
        console.error('CONTRACT_HASH not set in .env');
        return;
    }

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    console.log('\n1. CONTRACT INFO');
    console.log('-'.repeat(40));
    console.log('Contract Hash:', `hash-${hash}`);
    console.log('Issuer Public Key:', ISSUER_PUBLIC_KEY?.slice(0, 20) + '...');

    // Get contract entry points
    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const contractInfo = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);

        if (contractInfo.Contract) {
            const eps = contractInfo.Contract.entrypoints?.map(e => e.name) || [];
            console.log('Entry points:', eps.join(', '));
        }
    } catch (e) {
        console.log('Error getting contract info:', e.message);
    }

    // Check if issuer is authorized
    console.log('\n2. CHECK ISSUER AUTHORIZATION');
    console.log('-'.repeat(40));

    if (ISSUER_PUBLIC_KEY) {
        const issuerPubKey = CLPublicKey.fromHex(ISSUER_PUBLIC_KEY);
        const issuerAccountHash = issuerPubKey.toAccountHashStr();
        console.log('Issuer Account Hash:', issuerAccountHash);

        // Try to query if issuer is authorized
        // The contract has is_issuer(address: Address) -> bool
        // This is a view function that reads from storage

        const accountHashHex = issuerAccountHash.replace('account-hash-', '');

        // Try different key formats to query issuers mapping
        console.log('\nTrying to query issuers mapping...');
        const keyVariants = [
            accountHashHex,
            `00${accountHashHex}`,
            `issuers_${accountHashHex}`,
        ];

        for (const key of keyVariants) {
            try {
                const result = await contractClient.queryContractDictionary('state', key);
                console.log(`  Key ${key.slice(0, 20)}...: `, result);
            } catch (e) {
                // console.log(`  Key ${key.slice(0, 20)}...: not found`);
            }
        }
    }

    // Test with a dummy user address
    console.log('\n3. CHECK DID FOR TEST USER');
    console.log('-'.repeat(40));

    const testUserPubKey = '01be2c6de7c19a3397157370d9c4f615793d861d6c49ad65cd9316c9b1508121d6';
    const testUserAccountHash = CLPublicKey.fromHex(testUserPubKey).toAccountHashStr();
    console.log('Test User Account Hash:', testUserAccountHash);

    const testAccountHashHex = testUserAccountHash.replace('account-hash-', '');

    // Try to query if user has DID
    console.log('\nTrying to query identities mapping for test user...');
    const userKeyVariants = [
        testAccountHashHex,
        `00${testAccountHashHex}`,
    ];

    for (const key of userKeyVariants) {
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log(`  ✅ Found DID with key ${key.slice(0, 20)}...:`);
            console.log(`     Result:`, JSON.stringify(result).slice(0, 200));
        } catch (e) {
            console.log(`  ❌ Key ${key.slice(0, 20)}...: ${e.message.slice(0, 50)}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`
Next steps:
1. If issuer is not authorized, run: node scripts/add-issuer.js
2. Test minting by calling the /api/passkey/did/mint endpoint
3. Check cspr.live for transaction status
`);
}

main().catch(console.error);
