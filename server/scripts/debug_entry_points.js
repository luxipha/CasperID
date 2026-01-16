/* eslint-disable */
require('dotenv').config();
const { CasperClient } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

async function main() {
    console.log('🔍 Listing Contract Entry Points');
    const client = new CasperClient(RPC_API);

    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    console.log('Contract:', hash);

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const blockState = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);

        if (!blockState.Contract) {
            console.error('❌ Not a stored Contract');
            return;
        }

        // Use correct property name from inspection
        const entryPoints = blockState.Contract.entrypoints;

        if (!entryPoints) {
            console.log('❌ No entry points found. Keys:', Object.keys(blockState.Contract));
            return;
        }

        console.log('\nAvailable Entry Points:');
        entryPoints.forEach(ep => {
            console.log(`- ${ep.name}`);
            console.log('  Args:', JSON.stringify(ep.args));
        });

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
