/**
 * Generate Starknet Account for CasperID ZK Relay
 *
 * This creates a new account keypair that can be used as the relay
 * account for sponsoring gas fees on Starknet Sepolia.
 */

const { stark, ec, hash, CallData } = require('starknet');

// Generate a random private key
const privateKey = stark.randomAddress();

// Derive the public key from the private key
const publicKey = ec.starkCurve.getStarkKey(privateKey);

// Argent X account class hash (Sepolia)
// This is the standard account contract used by Argent X wallet
const ARGENT_ACCOUNT_CLASS_HASH = '0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f';

// OZ Account class hash (alternative)
const OZ_ACCOUNT_CLASS_HASH = '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';

// Calculate the account address (using Argent X)
const constructorCalldata = CallData.compile({
  owner: publicKey,
  guardian: '0x0'
});

const accountAddress = hash.calculateContractAddressFromHash(
  publicKey, // salt
  ARGENT_ACCOUNT_CLASS_HASH,
  constructorCalldata,
  0 // deployer address (0 for counterfactual)
);

console.log('\n========================================');
console.log('  CasperID ZK - Starknet Account Generator');
console.log('========================================\n');

console.log('Generated Starknet Account (Argent X compatible):\n');
console.log('STARKNET_RELAY_PRIVATE_KEY=' + privateKey);
console.log('STARKNET_RELAY_PUBLIC_KEY=' + publicKey);
console.log('STARKNET_RELAY_ADDRESS=' + accountAddress);

console.log('\n----------------------------------------');
console.log('IMPORTANT - Next Steps:');
console.log('----------------------------------------');
console.log('1. Fund this address with Sepolia ETH from a faucet:');
console.log('   https://starknet-faucet.vercel.app/');
console.log('\n2. The account needs to be deployed before use.');
console.log('   You can deploy it via Argent X wallet by importing');
console.log('   the private key, or use sncast:\n');
console.log('   sncast account deploy \\');
console.log('     --name casperid_relay \\');
console.log('     --class-hash ' + ARGENT_ACCOUNT_CLASS_HASH);
console.log('\n3. Add these to your .env file:');
console.log('   STARKNET_RELAY_ADDRESS=' + accountAddress);
console.log('   STARKNET_RELAY_PRIVATE_KEY=' + privateKey);
console.log('\n========================================\n');
