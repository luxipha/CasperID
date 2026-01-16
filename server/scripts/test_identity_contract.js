/**
 * Test the Identity Registry contract entry points and state
 */
require('dotenv').config();
const { CasperClient, Contracts, CLPublicKey } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = 'fe846d085f7d13ee3df425cef6a750edaa27d657cee8566a61d7239edc22f9f6';

// The wallet that called mint_master_did (from screenshot)
const TEST_WALLET = '01be2c6de7c19a3397157370d9c4f615793d861d6c49ad65cd9316c9b1508121d6';

async function main() {
    console.log('='.repeat(60));
    console.log('IDENTITY REGISTRY CONTRACT TEST');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);

    console.log('\n1. CONTRACT INFO');
    console.log('-'.repeat(40));
    console.log('Contract Hash:', `hash-${CONTRACT_HASH}`);

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const contractInfo = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${CONTRACT_HASH}`,
            []
        );

        if (contractInfo.Contract) {
            console.log('\nEntry Points:');
            const entryPoints = contractInfo.Contract.entryPoints || [];
            entryPoints.forEach(ep => {
                console.log(`  - ${ep.name}(${ep.args.map(a => a.name + ':' + a.cl_type).join(', ')})`);
            });

            console.log('\nNamed Keys:');
            const namedKeys = contractInfo.Contract.namedKeys || [];
            namedKeys.forEach(nk => {
                console.log(`  - ${nk.name}: ${nk.key}`);
            });
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    // Derive account hash
    console.log('\n2. TEST WALLET');
    console.log('-'.repeat(40));
    const pubKey = CLPublicKey.fromHex(TEST_WALLET);
    const accountHash = pubKey.toAccountHashStr();
    const accountHashHex = accountHash.replace('account-hash-', '');

    console.log('Public Key:', TEST_WALLET);
    console.log('Account Hash:', accountHash);

    // Try to query state with different Odra key formats
    console.log('\n3. ODRA STATE QUERY ATTEMPTS');
    console.log('-'.repeat(40));

    const contractClient = new Contracts.Contract(client);
    contractClient.setContractHash(`hash-${CONTRACT_HASH}`);

    // Odra uses specific key formats for Address types
    // Try: blake2b hash of the address bytes
    const crypto = require('crypto');

    const keyFormats = [
        { name: 'account hash hex', key: accountHashHex },
        { name: 'account hash full', key: accountHash },
        { name: 'pubkey hex', key: TEST_WALLET },
        { name: 'pubkey no prefix', key: TEST_WALLET.slice(2) },
    ];

    for (const { name, key } of keyFormats) {
        console.log(`\nTrying "${name}": ${key.slice(0, 24)}...`);
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log('  ✅ SUCCESS:', JSON.stringify(result).slice(0, 100));
        } catch (e) {
            const msg = e.message || String(e);
            if (msg.includes('ValueNotFound') || msg.includes('not found')) {
                console.log('  ❌ Key not found in dictionary');
            } else {
                console.log('  ❌ Error:', msg.slice(0, 80));
            }
        }
    }

    // Check if there's a get_did or get_identity entry point we should use instead
    console.log('\n4. CHECKING FOR READ ENTRY POINTS');
    console.log('-'.repeat(40));

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const contractInfo = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${CONTRACT_HASH}`,
            []
        );

        if (contractInfo.Contract) {
            const readEntryPoints = contractInfo.Contract.entryPoints.filter(ep =>
                ep.name.includes('get') ||
                ep.name.includes('query') ||
                ep.name.includes('has') ||
                ep.name.includes('exists') ||
                ep.name.includes('is_')
            );

            if (readEntryPoints.length > 0) {
                console.log('Found read entry points:');
                readEntryPoints.forEach(ep => {
                    console.log(`  - ${ep.name}(${ep.args.map(a => a.name).join(', ')})`);
                });
            } else {
                console.log('No obvious read entry points found');
                console.log('All entry points:');
                contractInfo.Contract.entryPoints.forEach(ep => {
                    console.log(`  - ${ep.name}`);
                });
            }
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
