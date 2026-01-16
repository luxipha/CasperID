require('dotenv').config();
const { CasperClient, Contracts, CasperServiceByJsonRPC } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

async function main() {
    console.log('🔍 Deep Query of Odra Contract State\n');

    const client = new CasperClient(RPC_API);
    const rpcClient = new CasperServiceByJsonRPC(RPC_API);
    const contractClient = new Contracts.Contract(client);

    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    // Get the state dictionary URef
    const stateRootHash = await client.nodeClient.getStateRootHash();
    const blockState = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);
    const namedKeys = blockState.Contract?.namedKeys || [];
    const stateURef = namedKeys.find(k => k.name === 'state')?.key;

    console.log('State URef:', stateURef);
    console.log('');

    // In Odra 2.x, the state dictionary uses specific key naming:
    // - Simple vars: variable name (e.g., "admin", "did_counter")
    // - Mappings: compound key with namespace

    // Let's try various key formats
    const keysToTry = [
        // Var names from the contract
        'admin',
        'did_counter',
        'identities',
        'context_dids',

        // Odra internal format (index-based)
        '0', '1', '2', '3', '4', '5',

        // Hex variants
        '00', '01', '02',

        // With underscores (Odra naming)
        '__admin',
        '__did_counter',
    ];

    console.log('Trying direct variable names...\n');

    for (const key of keysToTry) {
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log(`  "${key}": ✅ FOUND!`);
            console.log(`    Value:`, JSON.stringify(result, null, 2).slice(0, 200));
        } catch (e) {
            // Only log if not "Query failed"
            if (!e.message.includes('Query failed')) {
                console.log(`  "${key}": ${e.message.slice(0, 50)}`);
            }
        }
    }

    // Try using the RPC directly with state_get_dictionary_item
    console.log('\n\nTrying RPC state_get_dictionary_item...\n');

    const dictionaryQueries = [
        { name: 'admin', key: 'admin' },
        { name: 'did_counter', key: 'did_counter' },
        { name: 'index 0', key: '0' },
    ];

    for (const q of dictionaryQueries) {
        try {
            const result = await rpcClient.getDictionaryItemByName(
                stateRootHash,
                `hash-${hash}`,
                'state',
                q.key
            );
            console.log(`  ${q.name}: ✅ FOUND!`);
            console.log(`    Result:`, JSON.stringify(result, null, 2).slice(0, 300));
        } catch (e) {
            console.log(`  ${q.name}: ❌ ${e.message.slice(0, 60)}`);
        }
    }

    // Check events length to see if any events have been emitted
    console.log('\n\nChecking events...');
    const eventsLengthURef = namedKeys.find(k => k.name === '__events_length')?.key;
    if (eventsLengthURef) {
        try {
            const eventsLength = await client.nodeClient.getBlockState(stateRootHash, eventsLengthURef, []);
            console.log('Events length:', JSON.stringify(eventsLength, null, 2));
        } catch (e) {
            console.log('Could not read events length:', e.message);
        }
    }
}

main().catch(console.error);
