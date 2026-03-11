const { RpcProvider, hash, shortString } = require('starknet');
require('dotenv').config();

const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia-rpc.publicnode.com' });

const addresses = [
    '0x0039193d73574fe08242ab68c18cb6faa335c3a6092a42eec26dd57b453c706c',
    '0x59c78108f63de4e7d0d3305b75e137cd8e5878c3769f35fb27eca36b23d8833'
];

// STRK Token Address on Sepolia
const STRK_ADDR = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

async function check() {
    for (const addr of addresses) {
        console.log(`\nChecking: ${addr}`);
        try {
            const classHash = await provider.getClassHashAt(addr);
            console.log(`Class Hash: ${classHash}`);

            // Try to get balance via call
            try {
                const strkBalance = await provider.callContract({
                    contractAddress: STRK_ADDR,
                    entrypoint: 'balanceOf',
                    calldata: [addr]
                });
                console.log(`STRK Balance (low): ${parseInt(strkBalance[0], 16)}`);
            } catch (e) {
                console.log('Could not fetch STRK balance');
            }

        } catch (e) {
            console.log(`Error checking ${addr}: ${e.message}`);
        }
    }
}

check();
