const { getIssuerKeys } = require('../src/services/casper');
require('dotenv').config();

try {
    const keys = getIssuerKeys();
    console.log("Issuer Public Key (Hex):", keys.publicKey.toHex());
    console.log("Issuer Account Hash:", keys.publicKey.toAccountHashStr());
} catch (e) {
    console.error("Error:", e.message);
}
