/**
 * Debug contract state to understand Odra's storage format
 */
require('dotenv').config();
const { CasperClient, Contracts, CLPublicKey } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// User with successful mint
const USER_WALLET = 'account-hash-abc46e4d6622a72f2f1bbc428b561120c6986d55a6c1e8d1b8dee7b34507dfab';

async function main() {
    console.log('='.repeat(60));
    console.log('DEBUG CONTRACT STATE');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;

    const stateRootHash = await client.nodeClient.getStateRootHash();
    console.log('State root:', stateRootHash.slice(0, 16) + '...');

    // Get contract info
    const contractInfo = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);
    const stateURef = contractInfo.Contract.namedKeys.find(nk => nk.name === 'state');

    console.log('\nContract:', `hash-${hash.slice(0, 16)}...`);
    console.log('State URef:', stateURef?.key);

    // Try to enumerate dictionary items using different approaches
    console.log('\n' + '='.repeat(60));
    console.log('TRYING DIFFERENT ODRA KEY FORMATS');
    console.log('='.repeat(60));

    const contractClient = new Contracts.Contract(client);
    contractClient.setContractHash(`hash-${hash}`);

    const accountHashHex = USER_WALLET.replace('account-hash-', '');

    // Odra uses specific naming for Mapping storage
    // Format: <mapping_name>_<key_hash> or just the serialized key bytes

    // Try using the account hash bytes directly (how Odra serializes Address)
    const testKeys = [];

    // 1. Raw account hash bytes (32 bytes = 64 hex chars)
    testKeys.push({ name: 'raw_32bytes', key: accountHashHex });

    // 2. With Account variant prefix (Odra Address = enum { Account(AccountHash), Contract(ContractHash) })
    // Account variant = 0, so prefix is 0x00
    testKeys.push({ name: 'account_variant', key: '00' + accountHashHex });

    // 3. The key might be hashed - try common hashing
    const crypto = require('crypto');
    const keyBytes = Buffer.from(accountHashHex, 'hex');

    // SHA256 of the raw key
    testKeys.push({ name: 'sha256(key)', key: crypto.createHash('sha256').update(keyBytes).digest('hex') });

    // SHA256 of key with prefix
    const prefixedKey = Buffer.concat([Buffer.from([0x00]), keyBytes]);
    testKeys.push({ name: 'sha256(00+key)', key: crypto.createHash('sha256').update(prefixedKey).digest('hex') });

    // 4. Odra might use the "identities" mapping name as part of the key
    const mappingName = 'identities';
    const nameBytes = Buffer.from(mappingName, 'utf8');
    const combinedKey = Buffer.concat([nameBytes, keyBytes]);
    testKeys.push({ name: 'sha256(name+key)', key: crypto.createHash('sha256').update(combinedKey).digest('hex') });

    // 5. Try numeric indices (did_counter starts at 0)
    for (let i = 0; i < 5; i++) {
        const indexHex = i.toString(16).padStart(2, '0');
        testKeys.push({ name: `index_${i}`, key: indexHex });
        testKeys.push({ name: `index_${i}_64`, key: i.toString(16).padStart(64, '0') });
    }

    console.log(`\nTrying ${testKeys.length} key formats...\n`);

    for (const { name, key } of testKeys) {
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log(`✅ FOUND with "${name}":`);
            console.log(`   Key: ${key.slice(0, 40)}${key.length > 40 ? '...' : ''}`);
            console.log(`   Result:`, JSON.stringify(result, null, 2).slice(0, 300));
            console.log('');
        } catch (e) {
            // Silent fail
        }
    }

    // Also try querying with the SDK's dictionary key builder
    console.log('\n' + '='.repeat(60));
    console.log('CHECKING did_counter');
    console.log('='.repeat(60));

    // The did_counter is a Var<u64>, let's try to read it
    const counterKeys = ['did_counter', 'counter', '0', '1', '2'];
    for (const key of counterKeys) {
        try {
            const result = await contractClient.queryContractDictionary('state', key);
            console.log(`✅ did_counter key "${key}":`, result);
        } catch (e) {
            // Silent
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
