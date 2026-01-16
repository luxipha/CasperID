/**
 * Test script to understand the Odra contract's state dictionary
 * and find the correct way to query DID existence
 */
require('dotenv').config();
const { CasperClient, Contracts, CLPublicKey } = require('casper-js-sdk');
const crypto = require('crypto');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// The wallet from the screenshot (the one making mint_master_did calls)
const TEST_WALLET = '01be2c6de7c19a3397157370d9c4f615793d861d6c49ad65cd9316c9b1508121d6';

async function main() {
    console.log('='.repeat(60));
    console.log('CONTRACT QUERY TEST');
    console.log('='.repeat(60));

    if (!CONTRACT_HASH) {
        console.error('CONTRACT_HASH not set in .env');
        return;
    }

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    console.log('\n1. CONTRACT INFO');
    console.log('-'.repeat(40));
    console.log('Contract Hash:', `hash-${hash}`);
    console.log('RPC:', RPC_API);

    // Get contract named keys
    console.log('\n2. NAMED KEYS');
    console.log('-'.repeat(40));

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const contractInfo = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${hash}`,
            []
        );

        if (contractInfo.Contract) {
            const namedKeys = contractInfo.Contract.namedKeys || [];
            console.log('Named keys found:', namedKeys.length);
            namedKeys.forEach(nk => {
                console.log(`  - ${nk.name}: ${nk.key}`);
            });
        }
    } catch (e) {
        console.log('Error getting contract info:', e.message);
    }

    // Derive account hash from public key
    console.log('\n3. KEY DERIVATION');
    console.log('-'.repeat(40));
    console.log('Test wallet (pubkey):', TEST_WALLET);

    let accountHash;
    try {
        const pubKey = CLPublicKey.fromHex(TEST_WALLET);
        accountHash = pubKey.toAccountHashStr();
        console.log('Account hash:', accountHash);
        console.log('Account hash (no prefix):', accountHash.replace('account-hash-', ''));
    } catch (e) {
        console.log('Error deriving account hash:', e.message);
    }

    // Try different dictionary queries
    console.log('\n4. DICTIONARY QUERIES');
    console.log('-'.repeat(40));

    const dictNames = ['state', 'identities', 'registry', 'dids'];
    const keyFormats = [];

    if (accountHash) {
        keyFormats.push(
            { name: 'account-hash full', key: accountHash },
            { name: 'account-hash hex only', key: accountHash.replace('account-hash-', '') },
            { name: 'public key', key: TEST_WALLET },
            { name: 'public key no prefix', key: TEST_WALLET.slice(2) }
        );
    }

    for (const dictName of dictNames) {
        console.log(`\nTrying dictionary: "${dictName}"`);

        for (const { name, key } of keyFormats) {
            try {
                const result = await contractClient.queryContractDictionary(dictName, key);
                console.log(`  ✅ ${name}: SUCCESS`);
                console.log(`     Result:`, JSON.stringify(result, null, 2).slice(0, 200));
            } catch (e) {
                const errMsg = e.message || String(e);
                if (errMsg.includes('dictionary item not found') || errMsg.includes('ValueNotFound')) {
                    console.log(`  ❌ ${name}: Not found (dictionary exists but key missing)`);
                } else if (errMsg.includes('Failed to find base key')) {
                    console.log(`  ⚠️  ${name}: Dictionary "${dictName}" doesn't exist`);
                    break; // No point trying other keys for this dictionary
                } else {
                    console.log(`  ❌ ${name}: ${errMsg.slice(0, 60)}`);
                }
            }
        }
    }

    // Try RPC direct query for state dictionary
    console.log('\n5. DIRECT STATE ROOT QUERY');
    console.log('-'.repeat(40));

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        console.log('State root hash:', stateRootHash);

        // Try to query the contract's state URef directly
        const contractInfo = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${hash}`,
            []
        );

        if (contractInfo.Contract && contractInfo.Contract.namedKeys) {
            const stateKey = contractInfo.Contract.namedKeys.find(nk => nk.name === 'state');
            if (stateKey) {
                console.log('State URef:', stateKey.key);

                // Try to query the state URef with a dictionary item key
                if (accountHash) {
                    const dictItemKey = accountHash.replace('account-hash-', '');
                    console.log('Trying to query state dictionary with key:', dictItemKey.slice(0, 20) + '...');

                    try {
                        const result = await client.nodeClient.getBlockState(
                            stateRootHash,
                            stateKey.key,
                            [dictItemKey]
                        );
                        console.log('Direct query result:', result);
                    } catch (e) {
                        console.log('Direct query error:', e.message.slice(0, 100));
                    }
                }
            }
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
}

main().catch(console.error);
