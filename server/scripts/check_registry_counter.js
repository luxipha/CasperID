require('dotenv').config();
const { CasperClient, Contracts } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

async function main() {
    console.log('🔍 Checking Identity Registry State\n');

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    console.log('Contract:', `hash-${hash.slice(0, 16)}...`);

    try {
        // Get contract state
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const blockState = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);

        console.log('\nNamed Keys:');
        const namedKeys = blockState.Contract?.namedKeys || [];
        for (const nk of namedKeys) {
            console.log(`  ${nk.name}: ${nk.key.slice(0, 30)}...`);
        }

        // Try to read the did_counter directly
        // In Odra, simple Var<T> values are stored with their name as key
        console.log('\nTrying to read contract variables...');

        // Try common key names
        const tryKeys = ['did_counter', 'admin', 'counter', '0', '1', '2'];

        for (const key of tryKeys) {
            try {
                const result = await contractClient.queryContractDictionary('state', key);
                console.log(`  ${key}: ✅ FOUND!`, JSON.stringify(result));
            } catch (e) {
                // silent
            }
        }

        // Check admin address (stored as Var<Address>)
        // Let's try to query named keys directly
        const adminKey = namedKeys.find(k => k.name.toLowerCase().includes('admin'));
        if (adminKey) {
            console.log('\nAdmin key found:', adminKey.key);
            try {
                const adminState = await client.nodeClient.getBlockState(stateRootHash, adminKey.key, []);
                console.log('Admin state:', JSON.stringify(adminState, null, 2));
            } catch (e) {
                console.log('Could not read admin state:', e.message);
            }
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
