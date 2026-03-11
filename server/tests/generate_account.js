const { ec, hash, CallData, StarkKeyUtils } = require('starknet');

// Generate a new private key
const privateKey = '0x' + ec.starkCurve.utils.randomPrivateKey().toString(16);
const publicKey = ec.starkCurve.getStarkKey(privateKey);

// OpenZeppelin Account Class Hash on Sepolia (Modern Cairo 1.0)
const OZ_CLASS_HASH = '0x0611400000000000000000000000000000000000000000000000000000000000'; // Example, will verify actual current OZ hash

// Note: In a real scenario, we should use the latest OZ class hash.
// For diagnostic, let's just output the keys first.

console.log('--- NEW MODERN STARKNET ACCOUNT ---');
console.log(`PRIVATE_KEY: ${privateKey}`);
console.log(`PUBLIC_KEY:  ${publicKey}`);
console.log('\n--- NEXT STEPS ---');
console.log('1. Use these keys to determine the address.');
console.log('2. Fund the address with STRK.');
console.log('3. Deploy the account.');
