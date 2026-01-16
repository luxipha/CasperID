/**
 * Test mint_for_user entry point
 */
require('dotenv').config();

async function main() {
    console.log('='.repeat(60));
    console.log('TEST mint_for_user');
    console.log('='.repeat(60));

    // Reload casper service with updated config
    delete require.cache[require.resolve('./src/services/casper')];
    const casperService = require('../src/services/casper');

    // Test user wallet (use a unique address for testing)
    const testWallet = process.env.ISSUER_PUBLIC_KEY; // Use issuer for first test
    // Or use a random test wallet:
    // const testWallet = '020303030303030303030303030303030303030303030303030303030303030303';

    console.log('\nTest wallet:', testWallet?.slice(0, 20) + '...');

    try {
        console.log('\n1. Testing mintMasterDID (calls mint_for_user)...');
        const result = await casperService.mintMasterDID(testWallet, 'layer_1');

        if (typeof result === 'object' && result.alreadyExists) {
            console.log('✅ DID already exists for this wallet');
        } else {
            console.log('✅ Mint transaction submitted!');
            console.log('   Deploy hash:', result);
            console.log('   Check on cspr.live:', `https://testnet.cspr.live/deploy/${result}`);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.message.includes('Unauthorized')) {
            console.log('\n⚠️  The issuer is NOT authorized to mint.');
            console.log('   The issuer needs to be added via add_issuer or be the contract admin.');
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
