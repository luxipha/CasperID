/* eslint-disable */
require('dotenv').config();
const { CasperClient, Contracts, CLValueBuilder, CLAccountHash } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;

// The failing user from latest logs
const TARGET_WALLET = 'account-hash-7999f7c4321007b155dfb512f29e0af125eea29339eb96b8f9efee49ba772c78';

async function main() {
    console.log('🔍 Diagnosing for User:', TARGET_WALLET);

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    // 1. Get State Dictionary Name
    const stateRootHash = await client.nodeClient.getStateRootHash();
    const blockState = await client.nodeClient.getBlockState(stateRootHash, `hash-${hash}`, []);
    const namedKeys = blockState.Contract.namedKeys;
    const dictName = namedKeys.find(k => k.name === 'state')?.name;

    console.log('Dictionary Name:', dictName); // Should be 'state'

    if (!dictName) return;

    // 2. Try ALL Key Formats
    const rawHex = TARGET_WALLET.replace('account-hash-', '');

    // A: String
    try {
        const res = await contractClient.queryContractDictionary(dictName, TARGET_WALLET);
        console.log('A (String): FOUND');
    } catch (e) { console.log('A (String): Failed'); }

    // B: Raw Hex
    try {
        const res = await contractClient.queryContractDictionary(dictName, rawHex);
        console.log('B (RawHex): FOUND');
    } catch (e) { console.log('B (RawHex): Failed'); }

    // C: CLKey (Base64) - Fixed
    try {
        const accountHashBytes = Uint8Array.from(Buffer.from(rawHex, 'hex'));

        // Manual Serialization (Standard Key::Account serialization)
        // Tag (0) + 32 bytes
        const keyBytes = new Uint8Array(33);
        keyBytes[0] = 0; // Key::Account variant
        keyBytes.set(accountHashBytes, 1);
        const base64Key = Buffer.from(keyBytes).toString('base64');

        console.log('C (Manual Key::Account):', base64Key);

        const res = await contractClient.queryContractDictionary(dictName, base64Key);
        console.log('C (Manual): FOUND ->', JSON.stringify(res, null, 2));
    } catch (e) { console.log('C (Manual): Failed -', e.message); }

    // D: Debug CLKey object
    try {
        const { CLValueBuilder, CLAccountHash } = require('casper-js-sdk');
        const accountHashBytes = Uint8Array.from(Buffer.from(rawHex, 'hex'));
        const clAccountHash = new CLAccountHash(accountHashBytes);
        const clKey = CLValueBuilder.key(clAccountHash);

        // Try clKey.toBytes() again or inspect
        try {
            const bytes = clKey.toBytes(); // Should return Uint8Array
            const b64 = Buffer.from(bytes).toString('base64');
            console.log('D (SDK Key):', b64);
            const res = await contractClient.queryContractDictionary(dictName, b64);
            console.log('D (SDK): FOUND ->', JSON.stringify(res, null, 2));
        } catch (ex) {
            console.log('D (SDK): toBytes failed:', ex.message);
            // Maybe .data?
            console.log('D (SDK) keys:', Object.keys(clKey));
        }
    } catch (e) { console.log('D (SDK): Failed setup'); }
}

main();
