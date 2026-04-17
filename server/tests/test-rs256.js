// RS256 end-to-end test - requires DB connection
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const rsaManager = require('../src/utils/rsa-key-manager');
    await rsaManager.initializeRsaKeys();

    const { generateBusinessToken, verifyBusinessToken, verifyAnyToken, verifyToken } = require('../src/utils/jwt-manager');
    const jwt = require('jsonwebtoken');
    const { default: fetch } = await import('node-fetch');

    let pass = 0, fail = 0;
    function check(label, condition) {
        if (condition) { console.log('✅', label); pass++; }
        else { console.log('❌', label); fail++; }
    }

    // 1. Generate RS256 business token
    const token = generateBusinessToken({
        userId: 'user_test123',
        wallet: '0xABC',
        humanId: 'john.doe',
        verified: true,
        tier: 'layer_1',
        email: 'john@restaurant.com',
        sharedData: []
    }, 'app_testRestaurant');

    const parts = token.split('.');
    const header = JSON.parse(Buffer.from(parts[0], 'base64url'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url'));

    check('Token uses RS256 algorithm', header.alg === 'RS256');
    check('Token has kid in header', !!header.kid);
    check('Token iss = casperid.com', payload.iss === 'casperid.com');
    check('Token aud = app_testRestaurant', payload.aud === 'app_testRestaurant');
    check('Token sub is set', !!payload.sub);
    check('Token has token_type = business', payload.token_type === 'business');
    check('Token has app_id field', payload.app_id === 'app_testRestaurant');

    // 2. Server-side verification
    const serverVerified = verifyBusinessToken(token);
    check('verifyBusinessToken works', !!serverVerified);
    check('verifyAnyToken returns RS256 alg', verifyAnyToken(token)?._alg === 'RS256');

    // 3. HS256 token should NOT verify as business token
    const hs256Token = require('../src/utils/jwt-manager').generateToken({ wallet: '0xDEF', humanId: 'test', verified: false, tier: 'layer_0' }, 'test');
    check('HS256 token rejected by verifyBusinessToken', verifyBusinessToken(hs256Token) === null);
    check('HS256 token accepted by verifyToken (existing sessions intact)', !!verifyToken(hs256Token));
    check('verifyAnyToken detects HS256 alg', verifyAnyToken(hs256Token)?._alg === 'HS256');

    // 4. External client simulation: fetch JWKS, find matching key, verify locally
    const jwksRes = await fetch('http://localhost:3001/.well-known/jwks.json');
    const jwks = await jwksRes.json();
    check('JWKS endpoint returns keys array', Array.isArray(jwks.keys) && jwks.keys.length > 0);

    const jwkKey = jwks.keys.find(k => k.kid === header.kid);
    check('kid in token matches a key in JWKS', !!jwkKey);
    check('JWKS key has RS256 alg', jwkKey?.alg === 'RS256');
    check('JWKS key use = sig', jwkKey?.use === 'sig');

    // Verify using JWKS-derived public key (simulates what external clients do)
    const { createPublicKey } = require('crypto');
    const pubKey = createPublicKey({ key: jwkKey, format: 'jwk' });
    const externalVerified = jwt.verify(token, pubKey, { algorithms: ['RS256'] });
    check('External client can verify token using JWKS (no API call needed)', externalVerified.sub === 'user_test123');

    // 5. Tampered token rejected
    const tampered = token.slice(0, -5) + 'XXXXX';
    let rejected = false;
    try { jwt.verify(tampered, pubKey, { algorithms: ['RS256'] }); }
    catch { rejected = true; }
    check('Tampered token rejected', rejected);

    console.log(`\n📊 ${pass} passed, ${fail} failed`);
    if (fail === 0) console.log('🎉 All RS256 tests passed!');

    await mongoose.disconnect();
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('💥', e.message); process.exit(1); });
