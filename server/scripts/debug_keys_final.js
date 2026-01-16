/* eslint-disable */
require('dotenv').config();
const { CasperClient, Contracts, CLValueBuilder, CLAccountHash } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH; // hash-fe84...
// The failing user from latest logs (0b28...)
const TARGET_WALLET = 'account-hash-0b28f84f46e66b4e1b2e02e3b40e780788491c65f733cff701c8978dc562e5f0';

async function main() {
    console.log('🔍 Final Key Format Diagnostics');
    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    // Setup
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    // Find Dictionary Name
    const stateRootHash = await client.nodeClient.getStateRootHash();
    const blockState = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);
    const namedKeys = blockState.Contract.namedKeys;
    const dictName = namedKeys.find(k => k.name === 'state')?.name;

    if (!dictName) { console.log('❌ State dict not found'); return; }
    console.log(`✅ Using Dictionary: "${dictName}"`);

    // Target Hex
    const rawHex = TARGET_WALLET.replace('account-hash-', '');

    // Helper to test
    async function testKey(name, key) {
        try {
            process.stdout.write(`Testing ${name} ("${key.substring(0, 20)}..."): `);
            const res = await contractClient.queryContractDictionary(dictName, key);
            console.log('✅ FOUND!');
            // console.log(JSON.stringify(res, null, 2));
            return true;
        } catch (e) {
            console.log('❌');
            return false;
        }
    }

    // LIST OF FORMATS TO TRY
    // 1. Raw Hex (Lowercase)
    await testKey('Raw Hex LC', rawHex.toLowerCase());

    // 2. Raw Hex (Uppercase)
    await testKey('Raw Hex UC', rawHex.toUpperCase());

    // 3. AccountHash Encoded
    const accountHashBytes = Uint8Array.from(Buffer.from(rawHex, 'hex'));
    const b64Hash = Buffer.from(accountHashBytes).toString('base64');
    await testKey('Hash B64', b64Hash);

    // 4. Key::Account (Tag 0) Encoded
    const keyAccountBytes = new Uint8Array(33);
    keyAccountBytes[0] = 0; // Key::Account
    keyAccountBytes.set(accountHashBytes, 1);
    const b64KeyAccount = Buffer.from(keyAccountBytes).toString('base64');
    await testKey('Key::Account B64', b64KeyAccount);

    // 5. Check if we can find ANY key to deduce pattern
    // (Cannot list keys easily)

    // 6. Odra "Mapping" key might be hashed? 
    // If it's `Mapping<Address, u8>` in Odra, it uses `blake2b(key_bytes + namespace_bytes)`.
    // Or `blake2b(namespace_bytes + key_bytes)`.
    const blake = require('blakejs');

    // Attempt: Hash(identities + key)
    function testHashedKey(namespace, keyBytes) {
        const ctx = blake.blake2bInit(32, null);
        blake.blake2bUpdate(ctx, Buffer.from(namespace));
        blake.blake2bUpdate(ctx, keyBytes);
        const hash = blake.blake2bFinal(ctx);
        const b64 = Buffer.from(hash).toString('base64');
        return testKey(`Hash(${namespace} + Key)`, b64);
    }

    // Key bytes variants:
    // A: AccountHash (32 bytes)
    // B: Key::Account (33 bytes: 00 + Hash)

    // Namespace: "identities"
    await testHashedKey('identities', accountHashBytes);       // Hash(identities + 32bytes)
    await testHashedKey('identities', keyAccountBytes);      // Hash(identities + 33bytes)

    // Namespace: "user_identities" (another common name)
    await testHashedKey('user_identities', accountHashBytes);
    await testHashedKey('user_identities', keyAccountBytes);

    // Also try just Hashing the key alone (no namespace)
    const ctx = blake.blake2bInit(32, null);
    blake.blake2bUpdate(ctx, keyAccountBytes);
    const h = blake.blake2bFinal(ctx);
    const b64h = Buffer.from(h).toString('base64');
    await testKey('Hash(Key::Account)', b64h);

    // 7. Try "account-hash-" prefix string again
    await testKey('Full String', TARGET_WALLET);

}

main();
