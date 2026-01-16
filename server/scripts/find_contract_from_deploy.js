const { CasperServiceByJsonRPC } = require('casper-js-sdk');

const RPC_API = 'https://node.testnet.casper.network/rpc';
const DEPLOY_HASH = '2e8f22edb04a35c3fd3e80319146b1d23836272998e0f7da02c3c8fe20036cb7';

const service = new CasperServiceByJsonRPC(RPC_API);

async function findContract() {
    try {
        console.log(`🔍 Inspecting Deploy: ${DEPLOY_HASH}`);
        const result = await service.getDeployInfo(DEPLOY_HASH);

        if (!result || !result.execution_results || result.execution_results.length === 0) {
            console.log("❌ Execution results not found or deploy pending.");
            return;
        }

        const execResult = result.execution_results[0].result;
        if (execResult.Success) {
            console.log("✅ Deploy was successful!");
            const effect = execResult.Success.effect;

            // Look for new contract/package keys in effects
            console.log("\n✨ Discovered Keys in Effects:");
            const transforms = effect.transforms;

            let foundContract = null;
            let foundPackage = null;

            for (const item of transforms) {
                const key = item.key;
                if (key.startsWith('hash-')) {
                    // Probing these hashes
                    console.log(`   - Probing: ${key}`);
                }
            }

            // A more direct way is to look at the 'transforms' for 'WriteContract' or 'WriteContractPackage'
            // But let's just list all 'hash-' keys first.
        } else if (execResult.Failure) {
            console.log("❌ Deploy failed:", execResult.Failure.error_message);
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

findContract();
