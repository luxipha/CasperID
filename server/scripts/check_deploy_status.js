/* eslint-disable */
require('dotenv').config();
const { CasperClient } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';

// From the server logs - the first successful mint
const DEPLOY_HASH = '76ca4d35513f315ad8a9d17733e8a4c13d74420c77a1adfd94d2e9b516994ecc';

async function main() {
    console.log('🔍 Checking Deploy Status');
    console.log('Deploy Hash:', DEPLOY_HASH);
    console.log('');

    const client = new CasperClient(RPC_API);

    try {
        const deployResult = await client.getDeploy(DEPLOY_HASH);

        if (!deployResult || !deployResult[1]) {
            console.log('❌ Deploy not found');
            return;
        }

        const executionResults = deployResult[1].execution_results;

        if (!executionResults || executionResults.length === 0) {
            console.log('⏳ Deploy pending - no execution results yet');
            return;
        }

        const result = executionResults[0].result;

        if (result.Success) {
            console.log('✅ Deploy SUCCEEDED!');
            console.log('');

            // Check for any transforms or writes
            const transforms = result.Success.effect?.transforms || [];
            console.log(`Transforms: ${transforms.length}`);

            // Look for Write transforms (these show state changes)
            const writes = transforms.filter(t => t.transform && t.transform.Write);
            console.log(`Writes: ${writes.length}`);

            for (const w of writes.slice(0, 5)) {
                console.log('  Write to:', w.key);
            }
        } else if (result.Failure) {
            console.log('❌ Deploy FAILED!');
            console.log('Error:', result.Failure.error_message);
            console.log('Cost:', result.Failure.cost);
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
