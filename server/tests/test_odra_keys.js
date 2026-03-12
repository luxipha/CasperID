/**
 * Test Odra key derivation based on storage layout documentation
 *
 * Odra key format:
 * - Each field has an index (0x01, 0x02, etc.)
 * - For Mappings: index_bytes + key_bytes
 * - Final key is HASHED (blake2b256) and hex encoded
 *
 * IdentityRegistry layout:
 *   admin: Var<Address>                    index: 0x01
 *   identities: Mapping<Address, ...>      index: 0x02
 *   context_dids: Mapping<Did, ...>        index: 0x03
 *   did_counter: Var<u64>                  index: 0x04
 *   issuers: Mapping<Address, bool>        index: 0x05
 */
require('dotenv').config();
const { CasperClient, Contracts } = require('casper-js-sdk');
const crypto = require('crypto');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// User with successful mint
const USER_WALLET = 'account-hash-abc46e4d6622a72f2f1bbc428b561120c6986d55a6c1e8d1b8dee7b34507dfab';

// Blake2b-256 hash function (Casper uses this)
function blake2b256(data) {
    // Node.js doesn't have blake2b built-in, try using casper-js-sdk's internal
    try {
        const { blake2b } = require('blakejs');
        return Buffer.from(blake2b(data, null, 32));
    } catch (e) {
        // Fallback to sha256 for testing
        console.log('Note: Using SHA256 as blake2b not available');
        return crypto.createHash('sha256').update(data).digest();
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('TEST ODRA KEY DERIVATION');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;

    const contractClient = new Contracts.Contract(client);
    contractClient.setContractHash(`hash-${hash}`);

    const accountHashHex = USER_WALLET.replace('account-hash-', '');
    const accountHashBytes = Buffer.from(accountHashHex, 'hex');

    console.log('\nUser wallet:', USER_WALLET.slice(0, 40) + '...');
    console.log('Account hash (32 bytes):', accountHashHex.slice(0, 32) + '...');

    // Build test keys based on Odra storage layout
    const testKeys = [];

    // Field indexes (1-indexed based on struct order)
    const IDENTITIES_INDEX = 0x02;  // Second field
    const ISSUERS_INDEX = 0x05;     // Fifth field
    const DID_COUNTER_INDEX = 0x04; // Fourth field

    // Test 1: identities mapping key
    // Key format: field_index (1 byte) + address_bytes (33 bytes for Address enum)
    // Address in Odra is: enum { Account(AccountHash), Contract(ContractHash) }
    // Account variant = 0x00 prefix

    // Try different index byte formats
    for (const indexFormat of [
        Buffer.from([IDENTITIES_INDEX]),           // Single byte: 0x02
        Buffer.from([0x00, IDENTITIES_INDEX]),     // Two bytes: 0x00 0x02
    ]) {
        // Address can be: raw bytes, or with Account variant prefix (0x00)
        for (const addressFormat of [
            accountHashBytes,                                    // Raw 32 bytes
            Buffer.concat([Buffer.from([0x00]), accountHashBytes]), // 0x00 + 32 bytes (Account variant)
        ]) {
            const keyData = Buffer.concat([indexFormat, addressFormat]);

            // Hash the key (blake2b-256)
            const hashedKey = blake2b256(keyData).toString('hex');

            testKeys.push({
                name: `idx:${indexFormat.toString('hex')} addr:${addressFormat.length}bytes`,
                key: hashedKey,
                rawKey: keyData.toString('hex')
            });

            // Also try without hashing (raw hex, truncated to 64 chars)
            const rawKeyHex = keyData.toString('hex').slice(0, 64);
            testKeys.push({
                name: `idx:${indexFormat.toString('hex')} addr:${addressFormat.length}bytes (raw)`,
                key: rawKeyHex,
                rawKey: keyData.toString('hex')
            });
        }
    }

    // Test 2: Try did_counter (Var<u64>) - should be just the index
    testKeys.push({
        name: 'did_counter (index only)',
        key: blake2b256(Buffer.from([DID_COUNTER_INDEX])).toString('hex'),
        rawKey: Buffer.from([DID_COUNTER_INDEX]).toString('hex')
    });

    // Test 3: Try raw index values
    for (let i = 1; i <= 5; i++) {
        testKeys.push({
            name: `raw_index_${i}`,
            key: Buffer.from([i]).toString('hex').padStart(64, '0'),
            rawKey: i.toString()
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log(`TESTING ${testKeys.length} KEY FORMATS`);
    console.log('='.repeat(60));

    for (const { name, key, rawKey } of testKeys) {
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log(`\n✅ SUCCESS: "${name}"`);
            console.log(`   Raw key data: ${rawKey.slice(0, 40)}...`);
            console.log(`   Hashed key: ${key.slice(0, 40)}...`);
            console.log(`   Result:`, JSON.stringify(result).slice(0, 200));
        } catch (e) {
            // Silent fail - only show successes
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
}

main().catch(console.error);
