/* eslint-disable */
require('dotenv').config();
const { CasperClient, Contracts } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;
// account-hash-0b28... from user logs
const TARGET_WALLET = 'account-hash-0b28f84f46e66b4e1b2e02e3b40e780788491c65f733cff701c8978dc562e5f0';

async function main() {
    console.log('🔍 Diagnosing On-Chain State');

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);

    if (!CONTRACT_HASH) {
        console.error('❌ CONTRACT_HASH not set');
        return;
    }

    // Clean hash
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);

    console.log('Contract:', `hash-${hash}`);
    console.log('Target:', TARGET_WALLET);

    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();
        console.log('State Root:', stateRootHash);

        const blockState = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${hash}`,
            []
        );

        if (!blockState.Contract) {
            console.error('❌ Not a stored Contract! Found:', Object.keys(blockState));
            return;
        }

        const namedKeys = blockState.Contract.namedKeys;
        const keyNames = namedKeys.map(k => k.name);
        console.log('Named Keys:', keyNames);

        // Find identity dictionary
        const dictName = keyNames.find(k => k.toLowerCase() === 'state') ||
            keyNames.find(k => k.toLowerCase().includes('identit'));
        if (!dictName) {
            console.error('❌ No state/identity dictionary found.');
            return;
        }

        console.log(`✅ Found dictionary: "${dictName}"`);
        console.log(`\nAttempting query for "${TARGET_WALLET}"...`);

        // Attempt 1: String Key
        try {
            console.log('Attempt 1 (String):');
            const res = await contractClient.queryContractDictionary(dictName, TARGET_WALLET);
            console.log('✅ SUCCESS! Result:', JSON.stringify(res, null, 2));
            return; // Exit if success
        } catch (e) {
            console.log('❌ Failed:', e.message);
        }

        // Attempt 2: Raw Hex (without prefix)
        const rawHex = TARGET_WALLET.replace('account-hash-', '');
        try {
            console.log(`\nAttempt 2 (Raw Hex): "${rawHex}"`);
            const res = await contractClient.queryContractDictionary(dictName, rawHex);
            console.log('✅ SUCCESS! Result:', JSON.stringify(res, null, 2));
        } catch (e) {
            console.log('❌ Failed:', e.message);
        }

        // Attempt 3: CLKey Serialization
        // Mappings usually use the base64 of the serialized Key bytes
        try {
            console.log('\nAttempt 3 (CLKey):');
            const { CLValueBuilder, CLAccountHash } = require('casper-js-sdk');
            const accountHashBytes = Uint8Array.from(Buffer.from(rawHex, 'hex'));
            const clAccountHash = new CLAccountHash(accountHashBytes);
            const clKey = CLValueBuilder.key(clAccountHash);

            // Get bytes of the CLType (Key)
            const keyBytes = clKey.toBytes().unwrap();
            const base64Key = Buffer.from(keyBytes).toString('base64');

            console.log(`Key Bytes (B64): "${base64Key}"`);

            const res = await contractClient.queryContractDictionary(dictName, base64Key);
            console.log('✅ SUCCESS! Result:', JSON.stringify(res, null, 2));
        } catch (e) {
            console.log('❌ Failed:', e.message);
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
