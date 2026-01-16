/* eslint-disable */
/**
 * Test script to find correct Odra Mapping<Address, T> key format
 *
 * Odra uses key.to_bytes() which for Address in Casper is:
 * - Tag byte (0 for Account, 1 for Contract)
 * - 32 bytes of hash
 *
 * The SDK's queryContractDictionary internally hashes the key string
 * using blake2b to find the dictionary item.
 */
require('dotenv').config();
const { CasperClient, Contracts, CLValueBuilder, CLAccountHash, CLPublicKey, CLKey } = require('casper-js-sdk');
const crypto = require('crypto');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// Use a wallet we KNOW exists on-chain (from successful mint)
const TARGET_WALLET = 'account-hash-5a98de7122351712b32c20acdfcd26de6625d3365c6f9a2a3fe52998a8b79f31';

async function main() {
    console.log('🔍 Testing Odra Key Formats for Mapping<Address, T>');
    console.log('═'.repeat(60));

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    if (!CONTRACT_HASH) {
        console.error('❌ CONTRACT_HASH not set');
        return;
    }

    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    console.log('Contract:', `hash-${hash.slice(0, 8)}...`);
    console.log('Target Wallet:', TARGET_WALLET);
    console.log('');

    const rawHex = TARGET_WALLET.replace('account-hash-', '');
    const accountHashBytes = Buffer.from(rawHex, 'hex');

    // Key formats to try
    const keyFormats = [];

    // 1. Plain string formats
    keyFormats.push({ name: 'Full account-hash string', key: TARGET_WALLET });
    keyFormats.push({ name: 'Raw hex (no prefix)', key: rawHex });
    keyFormats.push({ name: 'Hex with 0x prefix', key: '0x' + rawHex });

    // 2. Casper Address serialization (Tag + Hash)
    // Account variant = tag 0x00
    const addressBytesAccount = Buffer.concat([Buffer.from([0x00]), accountHashBytes]);
    keyFormats.push({ name: 'Address bytes (tag=0 + hash) as hex', key: addressBytesAccount.toString('hex') });
    keyFormats.push({ name: 'Address bytes as base64', key: addressBytesAccount.toString('base64') });

    // 3. CLKey serialization
    // Key::Account variant = tag 0x00, then account hash
    const clKeyBytes = Buffer.concat([Buffer.from([0x00]), accountHashBytes]);
    keyFormats.push({ name: 'CLKey::Account bytes as hex', key: clKeyBytes.toString('hex') });

    // 4. Try with different tags (in case it's different)
    const keyTag1 = Buffer.concat([Buffer.from([0x01]), accountHashBytes]);
    keyFormats.push({ name: 'With tag=1 as hex', key: keyTag1.toString('hex') });

    // 5. Blake2b hash of raw bytes (some systems hash the key first)
    const blake2b = require('crypto').createHash('blake2b512');
    // Actually casper uses blake2b-256, let's try different approaches

    // 6. Just the 32 bytes as various encodings
    keyFormats.push({ name: 'Raw 32 bytes as base64', key: accountHashBytes.toString('base64') });
    keyFormats.push({ name: 'Raw 32 bytes as base64url', key: accountHashBytes.toString('base64url') });

    // 7. UTF-8 interpretation (Odra does String::from_utf8)
    // This won't work for binary data, but let's see what happens

    // 8. Casper SDK CLKey approach
    try {
        const clAccountHash = new CLAccountHash(accountHashBytes);
        const clKey = CLValueBuilder.key(clAccountHash);

        // Get the inner value bytes
        if (clKey.data && clKey.data.data) {
            const innerBytes = Buffer.from(clKey.data.data);
            keyFormats.push({ name: 'CLKey inner data as hex', key: innerBytes.toString('hex') });
            keyFormats.push({ name: 'CLKey inner data as base64', key: innerBytes.toString('base64') });
        }

        // Try to get full serialized bytes
        if (typeof clKey.toBytes === 'function') {
            try {
                const result = clKey.toBytes();
                if (result.ok) {
                    const bytes = Buffer.from(result.val);
                    keyFormats.push({ name: 'CLKey.toBytes() as hex', key: bytes.toString('hex') });
                    keyFormats.push({ name: 'CLKey.toBytes() as base64', key: bytes.toString('base64') });
                }
            } catch (e) { /* ignore */ }
        }
    } catch (e) {
        console.log('CLKey construction note:', e.message);
    }

    // 9. Try numeric key (the did_counter)
    keyFormats.push({ name: 'Numeric 0', key: '0' });
    keyFormats.push({ name: 'Numeric 1', key: '1' });

    console.log(`Testing ${keyFormats.length} key formats...\n`);

    for (const { name, key } of keyFormats) {
        try {
            const displayKey = key.length > 50 ? key.slice(0, 50) + '...' : key;
            process.stdout.write(`  ${name.padEnd(35)} `);

            const result = await contractClient.queryContractDictionary('state', key);
            console.log('✅ FOUND!');
            console.log('  Result:', JSON.stringify(result, null, 2));
            return; // Exit on first success
        } catch (e) {
            const msg = e.message || '';
            if (msg.includes('not found') || msg.includes('Query failed')) {
                console.log('❌ Not found');
            } else {
                console.log('❌', msg.slice(0, 40));
            }
        }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('None of the standard formats worked.');
    console.log('\nLet\'s check what keys ARE in the dictionary...\n');

    // Try to find ANY key in the dictionary
    // Query the dictionary seed URef and try to enumerate
    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        const blockState = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${hash}`,
            []
        );

        const namedKeys = blockState.Contract?.namedKeys || [];
        console.log('Contract named keys:');
        for (const nk of namedKeys) {
            console.log(`  - ${nk.name}: ${nk.key}`);
        }

        // Find the state dictionary URef
        const stateEntry = namedKeys.find(k => k.name === 'state');
        if (stateEntry) {
            console.log('\nState dictionary URef:', stateEntry.key);

            // Try to query the raw URef to see if there's any data
            try {
                const urefState = await client.nodeClient.getBlockState(
                    stateRootHash,
                    stateEntry.key,
                    []
                );
                console.log('URef state type:', Object.keys(urefState));
            } catch (e) {
                console.log('Could not query URef directly:', e.message);
            }
        }
    } catch (e) {
        console.log('Error checking state:', e.message);
    }
}

main().catch(console.error);
