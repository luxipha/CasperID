const { CasperServiceByJsonRPC } = require('casper-js-sdk');

const RPC_API = 'https://node.testnet.casper.network/rpc';
const DEPLOY_HASH = '3658a32d9b7fd8a8721d5235681294955a46ae69b2147cdadc32bbf2b28e3668';

const service = new CasperServiceByJsonRPC(RPC_API);

async function checkDeploy() {
    try {
        console.log(`🔍 Checking Deploy: ${DEPLOY_HASH}`);
        const result = await service.getDeployInfo(DEPLOY_HASH);

        if (!result) {
            console.log("❌ Deploy not found.");
            return;
        }

        if (result.execution_results && result.execution_results.length > 0) {
            const execResult = result.execution_results[0].result;
            if (execResult.Success) {
                console.log("✅ Deploy was successful!");
                console.log("Cost:", execResult.Success.cost);
            } else if (execResult.Failure) {
                console.log("❌ Deploy FAILED!");
                console.log("Error:", execResult.Failure.error_message);
            }
        } else {
            console.log("⏳ Deploy is still pending execution.");
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

checkDeploy();
