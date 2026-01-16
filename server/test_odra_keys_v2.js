/**
 * Test Odra key derivation - Version 2
 * Try more variations based on Odra source code patterns
 */
require('dotenv').config();
const { CasperClient, Contracts } = require('casper-js-sdk');
const { blake2b } = require('blakejs');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

const USER_WALLET = 'account-hash-abc46e4d6622a72f2f1bbc428b561120c6986d55a6c1e8d1b8dee7b34507dfab';

function blake2b256Hex(data) {
    return Buffer.from(blake2b(data, null, 32)).toString('hex');
}

async function main() {
    console.log('='.repeat(60));
    console.log('TEST ODRA KEY DERIVATION V2');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    const contractClient = new Contracts.Contract(client);
    contractClient.setContractHash(`hash-${hash}`);

    const accountHashHex = USER_WALLET.replace('account-hash-', '');
    const accountHashBytes = Buffer.from(accountHashHex, 'hex');

    console.log('\nAccount hash:', accountHashHex);

    const testKeys = [];

    // Odra uses little-endian for multi-byte indexes
    // Try 0-indexed and 1-indexed variations
    // identities is the 2nd field (index 1 if 0-indexed, index 2 if 1-indexed)

    for (let fieldIndex = 0; fieldIndex <= 5; fieldIndex++) {
        // Single byte index
        const idx1 = Buffer.from([fieldIndex]);
        // Two byte index (little endian)
        const idx2 = Buffer.alloc(2);
        idx2.writeUInt16LE(fieldIndex);

        // Address formats
        const addrFormats = [
            { name: 'raw', data: accountHashBytes },
            { name: '0x00+raw', data: Buffer.concat([Buffer.from([0x00]), accountHashBytes]) },
        ];

        for (const idxBuf of [idx1, idx2]) {
            for (const addr of addrFormats) {
                const keyData = Buffer.concat([idxBuf, addr.data]);
                const hashedKey = blake2b256Hex(keyData);

                testKeys.push({
                    name: `field${fieldIndex}_${idxBuf.length}b_${addr.name}`,
                    key: hashedKey
                });
            }
        }
    }

    // Also try string-based keys (some Odra versions use string concatenation)
    const stringKeys = [
        'identities',
        'identities_' + accountHashHex,
        'admin',
        'did_counter',
        'issuers',
        'issuers_' + accountHashHex,
    ];

    for (const strKey of stringKeys) {
        testKeys.push({ name: `str:${strKey.slice(0,20)}`, key: strKey });
        testKeys.push({ name: `blake2b(${strKey.slice(0,15)})`, key: blake2b256Hex(Buffer.from(strKey)) });
    }

    console.log(`\nTesting ${testKeys.length} keys...`);

    let found = 0;
    for (const { name, key } of testKeys) {
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log(`\n✅ FOUND: "${name}"`);
            console.log(`   Key: ${key.slice(0, 48)}...`);
            console.log(`   Result:`, JSON.stringify(result).slice(0, 300));
            found++;
        } catch (e) {
            // Silent
        }
    }

    if (found === 0) {
        console.log('\n❌ No keys matched. Trying alternative approaches...');

        // Try querying with dictionary seed from URef
        console.log('\nChecking state URef structure...');
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const contractInfo = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);
        const stateURef = contractInfo.Contract.namedKeys.find(nk => nk.name === 'state');
        console.log('State URef:', stateURef?.key);

        // The URef format is: uref-<hash>-<access_rights>
        // The dictionary seed is the hash part
        if (stateURef) {
            const urefParts = stateURef.key.match(/uref-([a-f0-9]+)-/);
            if (urefParts) {
                const dictSeed = urefParts[1];
                console.log('Dictionary seed:', dictSeed.slice(0, 32) + '...');

                // Try using dict seed + key
                const combinedKey = blake2b256Hex(Buffer.concat([
                    Buffer.from(dictSeed, 'hex'),
                    accountHashBytes
                ]));
                console.log('Combined key:', combinedKey.slice(0, 32) + '...');

                try {
                    const result = await contractClient.queryContractDictionary('state', combinedKey);
                    console.log('✅ Combined key worked!', result);
                } catch (e) {
                    console.log('Combined key failed');
                }
            }
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
