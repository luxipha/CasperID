require('dotenv').config();
const { CasperClient, Contracts } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const NFT_CONTRACT = process.env.CID_NAME_NFT_CONTRACT_HASH;

async function main() {
    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    const hash = NFT_CONTRACT.startsWith('hash-') ? NFT_CONTRACT : 'hash-' + NFT_CONTRACT;
    contractClient.setContractHash(hash);

    console.log('🔍 Checking CID Name NFT Contract');
    console.log('Contract:', hash.slice(0, 30) + '...');
    console.log('');

    const stateRootHash = await client.nodeClient.getStateRootHash();
    const blockState = await client.nodeClient.getBlockState(stateRootHash, hash, []);

    console.log('Named Keys:');
    for (const nk of blockState.Contract?.namedKeys || []) {
        console.log(`  ${nk.name}: ${nk.key.slice(0, 40)}...`);
    }

    // Try to find the token_counter or similar
    console.log('\nTrying to read state variables...');

    const tryKeys = ['token_counter', 'total_supply', '0', '1', '2', 'admin'];
    for (const key of tryKeys) {
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log(`  "${key}": FOUND! Value:`, JSON.stringify(result).slice(0, 100));
        } catch (e) {
            // silent
        }
    }

    // Check events length
    const eventsLengthKey = blockState.Contract?.namedKeys?.find(k => k.name === '__events_length');
    if (eventsLengthKey) {
        const eventsLength = await client.nodeClient.getBlockState(stateRootHash, eventsLengthKey.key, []);
        console.log('\nEvents emitted:', JSON.stringify(eventsLength));
    }
}

main().catch(console.error);
