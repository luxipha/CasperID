require('dotenv').config();
const { submitProofToStarknet } = require('../src/services/starknet');
const crypto = require('crypto');

async function runTest() {
    console.log('--- Starknet Integration Test ---');

    // Create a dummy but valid-looking proof payload
    const sessionNonce = crypto.randomUUID();
    const walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
    const nullifier = '0x' + crypto.randomBytes(31).toString('hex'); // felt252 compatible

    const proofData = {
        version: '1.0.0',
        type: 'CASPERID_LIVENESS_V1',
        nullifier,
        landmarkCount: 468,
        challengeData: {
            blinks: 3,
            mouthOpen: true,
            headMovement: true,
        },
        sessionNonce,
        walletAddress,
        timestamp: Date.now(),
    };

    const proofString = JSON.stringify(proofData);
    const proof = Buffer.from(proofString).toString('base64');

    // Hash for proofHash
    const proofHash = '0x' + crypto.createHash('sha256').update(proofString).digest('hex').slice(0, 62);

    const payload = {
        proof,
        proofHash,
        publicInputs: {
            nullifier,
            sessionNonce,
            timestamp: proofData.timestamp,
            walletAddress
        }
    };

    try {
        console.log('Testing submitProofToStarknet...');
        console.log('Nullifier:', nullifier);
        console.log('ProofHash:', proofHash);

        // This will hit the real network (Sepolia)
        const result = await submitProofToStarknet(payload);

        console.log('SUCCESS!');
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('FAILED');
        console.error('Error:', error.message);
        if (error.stack) {
            // Log stack for deep debugging if it's a validation error
            console.error(error.stack);
        }
        process.exit(1);
    }
}

runTest();
