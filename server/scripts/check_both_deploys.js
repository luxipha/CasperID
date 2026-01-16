require('dotenv').config();
const { CasperClient } = require('casper-js-sdk');

const client = new CasperClient(process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc');

// Both deploy hashes for user 2 (lomanlaks)
const deploys = [
    { name: 'First mint (Path 1)', hash: '67ca5778b239bc36204b22d24b4f78039cb1dc6a22b3039f1069318af7b77470' },
    { name: 'Second mint (Path 2)', hash: '9cd4e1cfeb070f8bc4d6a4b7dab8c6968c99afc94aaf81914b4567d8671a0351' }
];

async function main() {
    console.log('Checking deploy statuses...\n');

    for (const deploy of deploys) {
        console.log(`${deploy.name}:`);
        console.log(`  Hash: ${deploy.hash.slice(0, 16)}...`);

        try {
            const result = await client.getDeploy(deploy.hash);
            const execResults = result[1] && result[1].execution_results;

            if (!execResults || execResults.length === 0) {
                console.log('  Status: ⏳ PENDING (not yet executed)');
            } else {
                const r = execResults[0].result;
                if (r.Success) {
                    console.log('  Status: ✅ SUCCESS');
                } else if (r.Failure) {
                    console.log('  Status: ❌ FAILED');
                    console.log('  Error:', r.Failure.error_message);
                }
            }
        } catch (e) {
            console.log('  Error:', e.message);
        }
        console.log('');
    }
}

main();
