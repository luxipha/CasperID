/**
 * Debug Odra key format by examining a successful mint transaction
 */
require('dotenv').config();
const { CasperClient, CLPublicKey } = require('casper-js-sdk');
const crypto = require('crypto');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// Successful mint transaction
const SUCCESS_TX = '393a1de71e462d170e4f31cb22a6549c6e364a3826818e238b759e48b68ebc93';
const USER_WALLET = 'account-hash-abc46e4d6622a72f2f1bbc428b561120c6986d55a6c1e8d1b8dee7b34507dfab';

async function main() {
    console.log('='.repeat(60));
    console.log('DEBUG ODRA KEY FORMAT');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;

    // Get the successful deploy to see what keys were written
    console.log('\n1. Checking successful mint transaction...');
    try {
        const deployInfo = await client.nodeClient.getDeployInfo(SUCCESS_TX);

        if (deployInfo.execution_results?.[0]?.result?.Success) {
            console.log('✅ Transaction succeeded');

            // Look at the transforms to see what was written
            const transforms = deployInfo.execution_results[0].result.Success.effect?.transforms || [];
            console.log(`\nTransforms (${transforms.length} total):`);

            // Filter for Write transforms (new data written)
            const writes = transforms.filter(t => t.transform === 'WriteAccount' ||
                                                   t.transform?.WriteCLValue ||
                                                   t.transform?.AddKeys ||
                                                   typeof t.transform === 'object');

            writes.slice(0, 10).forEach((t, i) => {
                console.log(`\n  [${i}] Key: ${t.key}`);
                console.log(`      Transform: ${JSON.stringify(t.transform).slice(0, 100)}`);
            });
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    // Try different Odra key formats
    console.log('\n2. Testing Odra key formats...');

    const accountHashHex = USER_WALLET.replace('account-hash-', '');
    const accountHashBytes = Buffer.from(accountHashHex, 'hex');

    // Odra Mapping key derivation attempts
    const keyAttempts = [
        { name: 'raw account hash', key: accountHashHex },
        { name: 'with 0x00 prefix (Account)', key: '00' + accountHashHex },
        { name: 'with 0x01 prefix (Hash)', key: '01' + accountHashHex },
        // { name: 'blake2b of account hash', key: crypto.createHash('blake2b256').update(accountHashBytes).digest('hex') },
        { name: 'sha256 of account hash', key: crypto.createHash('sha256').update(accountHashBytes).digest('hex') },
        // Odra often uses index-based keys for mappings
        { name: 'index 0', key: '00' },
        { name: 'index 1', key: '01' },
        // Try "identities" prefix
        { name: 'identities_' + accountHashHex.slice(0,16), key: 'identities_' + accountHashHex },
    ];

    const { Contracts } = require('casper-js-sdk');
    const contractClient = new Contracts.Contract(client);
    contractClient.setContractHash(`hash-${hash}`);

    for (const attempt of keyAttempts) {
        try {
            const result = await contractClient.queryContractDictionary('state', attempt.key);
            console.log(`\n✅ SUCCESS with "${attempt.name}":`);
            console.log(`   Key: ${attempt.key.slice(0, 40)}...`);
            console.log(`   Result:`, JSON.stringify(result).slice(0, 200));
        } catch (e) {
            // Silent fail for most
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
