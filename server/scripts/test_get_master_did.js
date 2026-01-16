/**
 * Test get_master_did entry point to check if DID exists
 */
require('dotenv').config();
const { CasperClient, Contracts, CLPublicKey, RuntimeArgs, CLValueBuilder, CLAccountHash } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = 'fe846d085f7d13ee3df425cef6a750edaa27d657cee8566a61d7239edc22f9f6';
const CHAIN_NAME = 'casper-test';

// The issuer wallet (the one calling mint_master_did from screenshot)
const ISSUER_WALLET = '01be2c6de7c19a3397157370d9c4f615793d861d6c49ad65cd9316c9b1508121d6';

// A test user wallet
const TEST_USER = process.env.TEST_USER_WALLET || ISSUER_WALLET;

async function main() {
    console.log('='.repeat(60));
    console.log('TEST get_master_did ENTRY POINT');
    console.log('='.repeat(60));

    const client = new CasperClient(RPC_API);
    const contractClient = new Contracts.Contract(client);
    contractClient.setContractHash(`hash-${CONTRACT_HASH}`);

    console.log('\nContract:', `hash-${CONTRACT_HASH.slice(0, 8)}...`);
    console.log('Test wallet:', ISSUER_WALLET.slice(0, 20) + '...');

    // The get_master_did takes a Key type argument
    // We need to call it as a "view" function using queryContractData or simulate a call

    // Method 1: Try to use the SDK's queryContractData if available
    console.log('\n1. Trying queryContractData...');
    try {
        // For Odra contracts, we might need to call the entry point differently
        // Let's try querying the state directly first

        const pubKey = CLPublicKey.fromHex(ISSUER_WALLET);
        const accountHash = pubKey.toAccountHashStr();
        console.log('Account hash:', accountHash);

        // Try calling get_master_did via simulation/dry-run
        // This requires constructing the proper arguments

    } catch (e) {
        console.log('Error:', e.message);
    }

    // Method 2: Try RPC query_global_state with dictionary item
    console.log('\n2. Trying dictionary query with Odra key format...');
    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();

        // Get the state URef
        const contractInfo = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${CONTRACT_HASH}`,
            []
        );

        const stateURef = contractInfo.Contract.namedKeys.find(nk => nk.name === 'state');
        console.log('State URef:', stateURef?.key);

        if (stateURef) {
            // Odra stores data with specific key prefixes
            // Try different key formats
            const pubKey = CLPublicKey.fromHex(ISSUER_WALLET);
            const accountHashBytes = pubKey.toAccountHash();
            const accountHashHex = Buffer.from(accountHashBytes).toString('hex');

            console.log('Account hash bytes (hex):', accountHashHex);

            // Try querying with the state_entity_addr format
            const keyFormats = [
                accountHashHex,
                `00${accountHashHex}`, // Account variant prefix
                `01${accountHashHex}`, // Hash variant prefix
            ];

            for (const key of keyFormats) {
                console.log(`\nTrying key: ${key.slice(0, 24)}...`);
                try {
                    const result = await contractClient.queryContractDictionary('state', key);
                    console.log('  SUCCESS:', JSON.stringify(result).slice(0, 100));
                } catch (e) {
                    console.log('  Failed:', e.message.slice(0, 60));
                }
            }
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    // Method 3: Check events to see what DIDs were minted
    console.log('\n3. Checking contract events...');
    try {
        const stateRootHash = await client.nodeClient.getStateRootHash();

        // Query __events_length to see how many events
        const contractInfo = await client.nodeClient.getBlockState(
            stateRootHash,
            `hash-${CONTRACT_HASH}`,
            []
        );

        const eventsLengthURef = contractInfo.Contract.namedKeys.find(nk => nk.name === '__events_length');
        if (eventsLengthURef) {
            const eventsLength = await client.nodeClient.getBlockState(
                stateRootHash,
                eventsLengthURef.key,
                []
            );
            console.log('Events count:', eventsLength?.CLValue?.data || eventsLength);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('ANALYSIS');
    console.log('='.repeat(60));
    console.log(`
The contract has these key entry points:
- mint_master_did(tier: U8) -> String
  * Takes only tier, uses CALLER as the user
  * Returns the minted DID string

- get_master_did(wallet: Key) -> Option<String>
  * This is a VIEW function to check if wallet has DID
  * Returns Some(did) or None

PROBLEM: Our current code passes 'user' arg to mint_master_did,
but the contract only accepts 'tier'. The contract uses the
CALLER's address, not a passed-in user address.

This means:
1. The issuer wallet is minting DIDs for ITSELF, not users
2. After first mint, subsequent calls fail (DID already exists)
`);
}

main().catch(console.error);
