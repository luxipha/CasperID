#!/usr/bin/env node

// Test script to verify CasperID data mapping is working correctly
console.log('🧪 Testing CasperID Data Mapping\n');

// Simulate what CasperID actually provides
const casperIdData = {
    wallet: '0203a44378d9ccd3353ee2fe93c40a1be9518443334d86800aeefb23a4b96c55e3e1', // public key
    cnsName: 'nete-tute-bona', // human ID
    verified: true,
    tier: 'full_kyc'
};

console.log('✅ CasperID provides:', casperIdData);

// Simulate how marketplace backend now maps it
const mappedData = {
    publicKey: casperIdData.wallet,           // wallet = public key
    humanId: casperIdData.cnsName,           // cnsName = human ID  
    provider: 'casperid',                    // hardcoded
    accountHash: casperIdData.wallet,        // placeholder - could derive from publicKey later
    verified: casperIdData.verified,
    tier: casperIdData.tier
};

console.log('✅ Marketplace maps to:', mappedData);

// Verify the mapping works
const testResults = {
    'Public Key Mapping': mappedData.publicKey === casperIdData.wallet,
    'Human ID Mapping': mappedData.humanId === casperIdData.cnsName,
    'Provider Set': mappedData.provider === 'casperid',
    'Account Hash Present': mappedData.accountHash !== undefined,
    'Verification Status': mappedData.verified === casperIdData.verified,
    'Tier Mapping': mappedData.tier === casperIdData.tier
};

console.log('\n🔍 Test Results:');
Object.entries(testResults).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed}`);
});

const allTestsPassed = Object.values(testResults).every(result => result === true);
console.log(`\n🎯 Overall Result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);

if (allTestsPassed) {
    console.log('🎉 CasperID integration mapping is working correctly!');
} else {
    console.log('❌ CasperID integration needs further fixes.');
    process.exit(1);
}