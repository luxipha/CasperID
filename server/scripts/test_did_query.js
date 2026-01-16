require('dotenv').config();

const { CasperServiceByJsonRPC, Contracts, Keys, CLValueBuilder, RuntimeArgs, CLPublicKey, CLAccountHash } = require('casper-js-sdk');

const RPC_API = process.env.CASPER_NODE_URL || 'https://node.testnet.casper.network/rpc';
const CONTRACT_HASH = process.env.CONTRACT_HASH;
const ISSUER_PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY;
const CHAIN_NAME = 'casper-test';

// Test with a known account (you can change this)
const TEST_ACCOUNT = 'account-hash-aaf3d31330ab90aa9e162c7082820d66c810da03c338f8c5d5c9eb5953592de1';

console.log('🔧 Configuration:');
console.log('   RPC:', RPC_API);
console.log('   CONTRACT_HASH:', CONTRACT_HASH);
console.log('   TEST_ACCOUNT:', TEST_ACCOUNT);
console.log('');

const client = new CasperServiceByJsonRPC(RPC_API);
const contractClient = new Contracts.Contract(client);

if (CONTRACT_HASH) {
    const hash = CONTRACT_HASH.startsWith('hash-') ? CONTRACT_HASH.slice(5) : CONTRACT_HASH;
    contractClient.setContractHash(`hash-${hash}`);
}

async function queryTierOnChain() {
    console.log('📡 Step 1: Query existing tier on-chain...');

    try {
        // Try to get state root hash
        const stateRootHash = await client.getStateRootHash();
        console.log('   State Root Hash:', stateRootHash);

        // Query the contract
        const contractData = await client.getStateByStateRootHash(
            stateRootHash,
            CONTRACT_HASH,
            []
        );

        console.log('   Contract exists:', !!contractData);

        // Try to query the identities mapping (this is Odra-specific)
        // The format is typically: hash-{contractHash}/identities/{key}

    } catch (error) {
        console.error('   ❌ Query error:', error.message);
    }
}

async function testGetTierEntrypoint() {
    console.log('\n📡 Step 2: Try calling get_tier entry point...');

    try {
        // The get_tier entry point should be callable
        // But viewing entry points requires a deploy for Casper 1.x

        // Let's check what entry points exist
        const stateRootHash = await client.getStateRootHash();
        const contractData = await client.queryContractData([], CONTRACT_HASH, []);
        console.log('   Contract data keys:', Object.keys(contractData || {}));

    } catch (error) {
        console.error('   ❌ Entry point test error:', error.message);
    }
}

async function simulateMintVsUpdate() {
    console.log('\n📡 Step 3: Simulate the decision logic...');

    // For now, let's assume we can't easily query on-chain state
    // The safest approach is to track locally in the DB

    console.log('   ⚠️  Direct on-chain tier query requires dictionary key format');
    console.log('   💡 Recommendation: Track DID status in local DB (UserAccount.did_minted flag)');
}

async function checkIssuerKeys() {
    console.log('\n🔑 Step 4: Check issuer keys...');

    try {
        if (!ISSUER_PRIVATE_KEY) {
            console.log('   ❌ ISSUER_PRIVATE_KEY not set');
            return;
        }

        let privateKeyHex = ISSUER_PRIVATE_KEY;
        if (privateKeyHex.startsWith('01') || privateKeyHex.startsWith('02')) {
            privateKeyHex = privateKeyHex.slice(2);
        }

        const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');
        console.log('   Private key length:', privateKeyBytes.length, 'bytes');

        const publicKeyBytes = Keys.Ed25519.privateToPublicKey(privateKeyBytes);
        const keys = Keys.Ed25519.parseKeyPair(publicKeyBytes, privateKeyBytes);

        console.log('   ✅ Keys parsed successfully');
        console.log('   Public Key:', keys.publicKey.toHex());

    } catch (error) {
        console.error('   ❌ Key error:', error.message);
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('    CasperID DID Query Test Script');
    console.log('═══════════════════════════════════════════════════════\n');

    await queryTierOnChain();
    await testGetTierEntrypoint();
    await simulateMintVsUpdate();
    await checkIssuerKeys();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('    Conclusion');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`
The issue: We can't easily query Odra dictionary mappings without knowing the exact key format.

Solution options:
1. Track did_minted flag in UserAccount (recommended - simple & reliable)
2. Query the dictionary using the correct Odra key encoding
3. Always call updateTier (but this fails for new users)

Let me implement option 1 - add a did_minted flag to UserAccount.
`);
}

main().catch(console.error);
