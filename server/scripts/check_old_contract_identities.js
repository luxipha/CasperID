require('dotenv').config();
const { CasperClient, Contracts } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const OLD_CONTRACT = 'hash-055f94fc5ea037a02be18a8f7e8414e34aae7b2995e9b3daa09856a89e5d78be';

// Test wallets
const TEST_WALLETS = [
    'account-hash-5a98de7122351712b32c20acdfcd26de6625d3365c6f9a2a3fe52998a8b79f31', // jazba
    'account-hash-16391668e214aa990ecb6932bb54a299e527d66fa18eb1dbeaa21535197a52d3', // lomanlaks
];

async function main() {
    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    contractClient.setContractHash(OLD_CONTRACT);

    console.log('🔍 Checking OLD Contract Identities Dictionary');
    console.log('Contract:', OLD_CONTRACT.slice(0, 30) + '...');
    console.log('');

    // First, get the identities dictionary URef
    const stateRootHash = await client.nodeClient.getStateRootHash();
    const blockState = await client.nodeClient.getBlockState(stateRootHash, OLD_CONTRACT, []);
    const identitiesKey = blockState.Contract?.namedKeys?.find(k => k.name === 'identities');

    if (identitiesKey) {
        console.log('Identities URef:', identitiesKey.key);
        console.log('');
    }

    // Try to query identities for test wallets
    console.log('Checking if test wallets exist in OLD contract...\n');

    for (const wallet of TEST_WALLETS) {
        console.log(`Wallet: ${wallet.slice(0, 30)}...`);

        // Try different key formats
        const keyFormats = [
            { name: 'full string', key: wallet },
            { name: 'raw hex', key: wallet.replace('account-hash-', '') },
        ];

        for (const { name, key } of keyFormats) {
            try {
                const result = await contractClient.queryContractDictionary('identities', key);
                console.log(`  ${name}: ✅ FOUND!`);
                console.log(`  Data:`, JSON.stringify(result, null, 2).slice(0, 200));
            } catch (e) {
                if (e.message.includes('Query failed')) {
                    console.log(`  ${name}: Not found`);
                } else {
                    console.log(`  ${name}: Error - ${e.message.slice(0, 40)}`);
                }
            }
        }
        console.log('');
    }

    // Also check if there's any counter or admin in old contract
    console.log('\nChecking old contract state variables...');
    const varNames = ['counter', 'admin', 'tier_counter', 'did_counter'];
    for (const name of varNames) {
        try {
            // In native Casper contracts, vars might be in named keys directly
            const nk = blockState.Contract?.namedKeys?.find(k => k.name === name);
            if (nk) {
                const val = await client.nodeClient.getBlockState(stateRootHash, nk.key, []);
                console.log(`  ${name}: ${JSON.stringify(val)}`);
            }
        } catch (e) {
            // silent
        }
    }
}

main().catch(console.error);
