require('dotenv').config();
const { CasperClient } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const ERROR_UREF = 'uref-5d7b1b23197cda53dec593caf30836a5740afa2279b356fae74bf1bdc2b2e725';

const contracts = {
    'Identity Registry (NEW)': 'hash-fe846d085f7d13ee3df425cef6a750edaa27d657cee8566a61d7239edc22f9f6',
    'CID Name NFT': 'hash-34fb6dd5f7d13c81d04c3037221154e0296b63aecb81d25c27fa300c1137a83e',
    'Identity Registry (OLD)': 'hash-055f94fc5ea037a02be18a8f7e8414e34aae7b2995e9b3daa09856a89e5d78be'
};

async function main() {
    const client = new CasperClient(RPC_API);
    const stateRootHash = await client.nodeClient.getStateRootHash();

    console.log('🔍 Finding which contract owns URef:', ERROR_UREF.slice(0, 30) + '...');
    console.log('');

    for (const [name, hash] of Object.entries(contracts)) {
        console.log(`\n${name}:`);
        console.log(`  Hash: ${hash.slice(0, 25)}...`);

        try {
            const blockState = await client.nodeClient.getBlockState(stateRootHash, hash, []);
            const namedKeys = blockState.Contract?.namedKeys || [];

            let found = false;
            for (const nk of namedKeys) {
                if (nk.key.includes('5d7b1b23197cda53')) {
                    console.log(`  ✅ FOUND! Named key "${nk.name}" has matching URef`);
                    console.log(`     Full URef: ${nk.key}`);
                    found = true;
                }
            }

            if (!found) {
                // Print all named keys for reference
                console.log('  Named keys:');
                for (const nk of namedKeys.slice(0, 6)) {
                    console.log(`    - ${nk.name}: ${nk.key.slice(5, 25)}...`);
                }
            }
        } catch (e) {
            console.log(`  Error: ${e.message.slice(0, 50)}`);
        }
    }

    // Also check the URef directly to see its access rights
    console.log('\n\n📋 Direct URef query:');
    try {
        // Try with different access suffixes
        for (const suffix of ['-000', '-007']) {
            const uref = ERROR_UREF + suffix;
            try {
                const result = await client.nodeClient.getBlockState(stateRootHash, uref, []);
                console.log(`  ${uref.slice(-4)}: ${JSON.stringify(result)}`);
            } catch (e) {
                console.log(`  ${uref.slice(-4)}: Not accessible or doesn't exist`);
            }
        }
    } catch (e) {
        console.log('  Error:', e.message);
    }
}

main().catch(console.error);
