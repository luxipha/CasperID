/**
 * Diagnostic script to verify issuer account hash format
 * Run: node scripts/diagnose-issuer.js
 */

require('dotenv').config();
const { Keys } = require('casper-js-sdk');

console.log('=== Issuer Account Hash Diagnostic ===\n');

// Get issuer keys from environment
const publicKeyHex = process.env.ISSUER_PUBLIC_KEY;
const contractHash = process.env.CONTRACT_HASH;

if (!publicKeyHex) {
    console.error('ERROR: ISSUER_PUBLIC_KEY not set in .env');
    process.exit(1);
}

console.log('1. Environment Variables:');
console.log('   ISSUER_PUBLIC_KEY:', publicKeyHex);
console.log('   CONTRACT_HASH:', contractHash);
console.log();

try {
    // Parse the public key
    const publicKeyBytes = Uint8Array.from(Buffer.from(publicKeyHex, 'hex'));

    // Check key type (01 prefix = Ed25519, 02 = secp256k1)
    const keyType = publicKeyHex.startsWith('01') ? 'Ed25519' :
                    publicKeyHex.startsWith('02') ? 'secp256k1' : 'Unknown';
    console.log('2. Key Analysis:');
    console.log('   Key Type:', keyType);
    console.log('   Key Length:', publicKeyHex.length, 'hex chars');
    console.log();

    // Generate account hash from public key
    console.log('3. Account Hash Generation:');

    // For Ed25519 keys
    if (keyType === 'Ed25519') {
        // The public key without the 01 prefix
        const rawPublicKey = publicKeyHex.slice(2); // Remove '01' prefix
        console.log('   Raw public key (without prefix):', rawPublicKey);

        // Try to compute account hash
        try {
            const accountHashBytes = Keys.Ed25519.accountHash(publicKeyBytes);
            const accountHashHex = Buffer.from(accountHashBytes).toString('hex');

            console.log();
            console.log('4. EXPECTED ISSUER ACCOUNT HASH:');
            console.log('   ================================');
            console.log('   account-hash-' + accountHashHex);
            console.log('   ================================');
            console.log();

            // Compare with contract hash if it looks like it might be the admin account
            console.log('5. Hash Comparison:');
            const contractHashClean = contractHash?.replace('hash-', '').replace('account-hash-', '');
            console.log('   CONTRACT_HASH (cleaned):', contractHashClean);
            console.log('   Issuer account hash:    ', accountHashHex);
            console.log('   Match:', contractHashClean === accountHashHex ? 'YES' : 'NO');
            console.log();

            console.log('6. IMPORTANT NOTES:');
            console.log('   - Smart contract uses runtime::get_caller().to_string() for auth');
            console.log('   - This returns format: "account-hash-{hex}"');
            console.log('   - Your issuer MUST be registered with this exact format');
            console.log();
            console.log('   If transactions are failing with PermissionDenied:');
            console.log('   1. The issuer account hash above must be in the contract\'s "issuers" dictionary');
            console.log('   2. Run add_issuer() with the full "account-hash-{hex}" string');
            console.log();

        } catch (hashError) {
            console.error('   Error computing account hash:', hashError.message);
        }
    }

} catch (error) {
    console.error('Error:', error.message);
}

console.log('=== End Diagnostic ===');
