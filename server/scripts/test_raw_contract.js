/**
 * Get raw contract data to understand structure
 */
require('dotenv').config();
const { CasperClient } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = 'fe846d085f7d13ee3df425cef6a750edaa27d657cee8566a61d7239edc22f9f6';

async function main() {
    const client = new CasperClient(RPC_API);

    console.log('Fetching contract info...\n');

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const result = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${CONTRACT_HASH}`,
            []
        );

        console.log('Raw result keys:', Object.keys(result));
        console.log('\nFull result (first 3000 chars):');
        console.log(JSON.stringify(result, null, 2).slice(0, 3000));
    } catch (e) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
