/**
 * Test Odra key derivation based on source code analysis
 *
 * Key formula:
 * 1. index = (parent_index << 4) + field_index  (field_index starts at 1)
 * 2. key_data = [index as u32 BE] + [mapping_key_bytes]
 * 3. final_key = blake2b256(key_data).to_hex()
 *
 * IdentityRegistry fields:
 *   admin: Var<Address>           - index 1
 *   identities: Mapping<Address>  - index 2
 *   context_dids: Mapping<Did>    - index 3
 *   did_counter: Var<u64>         - index 4
 *   issuers: Mapping<Address>     - index 5
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

function buildOdraKey(fieldIndex, mappingKeyBytes) {
    // Parent index is 0 for top-level module
    // Child index = (0 << 4) + fieldIndex = fieldIndex
    const index = fieldIndex;

    // Index as u32 big-endian (4 bytes)
    const indexBuf = Buffer.alloc(4);
    indexBuf.writeUInt32BE(index);

    // Concatenate index + mapping key
    const keyData = Buffer.concat([indexBuf, mappingKeyBytes]);

    // Blake2b-256 hash
    const hashedKey = blake2b256Hex(keyData);

    return hashedKey;
}

async function main() {
    console.log('='.repeat(60));
    console.log('TEST ODRA KEY DERIVATION (FINAL)');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    const contractClient = new Contracts.Contract(client);
    contractClient.setContractHash(`hash-${hash}`);

    const accountHashHex = USER_WALLET.replace('account-hash-', '');
    const accountHashBytes = Buffer.from(accountHashHex, 'hex');

    console.log('\nUser:', USER_WALLET.slice(0, 50) + '...');
    console.log('Account hash (32 bytes):', accountHashHex.slice(0, 32) + '...');

    // Address serialization in Casper/Odra:
    // Account variant = 0x00 + 32 bytes account hash
    const addressBytes = Buffer.concat([Buffer.from([0x00]), accountHashBytes]);

    console.log('\nAddress bytes (33 bytes):', addressBytes.toString('hex').slice(0, 40) + '...');

    // Test keys for different fields
    const testCases = [
        { name: 'identities (index 2)', fieldIndex: 2, keyBytes: addressBytes },
        { name: 'issuers (index 5)', fieldIndex: 5, keyBytes: addressBytes },
        { name: 'did_counter (index 4, no mapping key)', fieldIndex: 4, keyBytes: Buffer.alloc(0) },
    ];

    console.log('\n' + '='.repeat(60));
    console.log('TESTING KEYS');
    console.log('='.repeat(60));

    for (const { name, fieldIndex, keyBytes } of testCases) {
        const odraKey = buildOdraKey(fieldIndex, keyBytes);
        console.log(`\n${name}:`);
        console.log(`  Field index: ${fieldIndex}`);
        console.log(`  Key bytes length: ${keyBytes.length}`);
        console.log(`  Odra key: ${odraKey}`);

        try {
            const result = await contractClient.queryContractDictionary('state', odraKey);
            console.log(`  ✅ SUCCESS! Result:`, JSON.stringify(result).slice(0, 200));
        } catch (e) {
            console.log(`  ❌ Failed: ${e.message.slice(0, 50)}`);
        }
    }

    // Also try without the Address variant prefix
    console.log('\n' + '='.repeat(60));
    console.log('TRYING WITHOUT ADDRESS VARIANT PREFIX');
    console.log('='.repeat(60));

    for (const fieldIndex of [2, 5]) {
        const odraKey = buildOdraKey(fieldIndex, accountHashBytes); // Raw 32 bytes
        console.log(`\nField ${fieldIndex} with raw account hash:`);
        console.log(`  Odra key: ${odraKey}`);

        try {
            const result = await contractClient.queryContractDictionary('state', odraKey);
            console.log(`  ✅ SUCCESS!`, JSON.stringify(result).slice(0, 200));
        } catch (e) {
            console.log(`  ❌ Failed`);
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
