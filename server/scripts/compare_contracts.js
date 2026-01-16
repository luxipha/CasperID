require('dotenv').config();
const { CasperClient } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';

const contracts = {
    'Identity Registry': 'hash-fe846d085f7d13ee3df425cef6a750edaa27d657cee8566a61d7239edc22f9f6',
    'CID Name NFT': 'hash-34fb6dd5f7d13c81d04c3037221154e0296b63aecb81d25c27fa300c1137a83e'
};

async function checkContract(name, hash) {
    const client = new CasperClient(RPC_API);
    const cleanHash = hash.startsWith('hash-') ? hash : 'hash-' + hash;

    console.log(name + ':');
    console.log('  Hash:', cleanHash.slice(0, 30) + '...');

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const blockState = await client.nodeClient.getBlockState(stateRootHash, cleanHash, []);
        const namedKeys = blockState.Contract?.namedKeys || [];

        // Find state/storage dictionary
        const stateKey = namedKeys.find(k => k.name === 'state' || k.name === 'storage');
        if (stateKey) {
            console.log('  State URef:', stateKey.key);

            // Compare with error URef
            if (stateKey.key.includes('5d7b1b23197cda53dec593caf30836a5740afa2279b356fae74bf1bdc2b2e725')) {
                console.log('  >>> THIS MATCHES THE ERROR URef! <<<');
            }
        }

        // List all named keys
        console.log('  Named keys:');
        for (const nk of namedKeys) {
            console.log('    -', nk.name);
        }
    } catch (e) {
        console.log('  Error:', e.message.slice(0, 60));
    }
    console.log('');
}

async function main() {
    console.log('Checking both contracts...\n');
    console.log('Error URef from original message:');
    console.log('  uref-5d7b1b23197cda53dec593caf30836a5740afa2279b356fae74bf1bdc2b2e725-000');
    console.log('');

    for (const [name, hash] of Object.entries(contracts)) {
        await checkContract(name, hash);
    }
}

main().catch(console.error);
