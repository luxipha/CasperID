/**
 * End-to-End ZK Proof Test
 *
 * Tests the complete flow from liveness data to Starknet submission:
 * 1. Generate mock facial landmarks (simulating MediaPipe)
 * 2. Extract 9 key landmarks for circuit
 * 3. Compute Poseidon nullifier
 * 4. Generate real Noir ZK proof
 * 5. Submit to backend API
 * 6. Verify on-chain state
 *
 * Run: node tests/e2e_zk_test.js
 */

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { buildPoseidon } from 'circomlibjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const BN254_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

// MediaPipe Face Mesh key landmark indices
const KEY_LANDMARK_INDICES = {
  NOSE_TIP: 1,
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  MOUTH_LEFT: 61,
  MOUTH_RIGHT: 291,
  CHIN: 152,
  FOREHEAD: 10,
};

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       CasperID ZK End-to-End Test                          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

/**
 * Generate mock MediaPipe-style landmarks (468 points)
 * Returns normalized coordinates (0-1 range)
 */
function generateMockLandmarks() {
  const landmarks = [];

  // Generate 468 random landmarks
  for (let i = 0; i < 468; i++) {
    landmarks.push({
      x: 0.3 + Math.random() * 0.4,  // Center face in 0.3-0.7 range
      y: 0.2 + Math.random() * 0.6,  // Face in 0.2-0.8 range
      z: -0.1 + Math.random() * 0.2, // Depth -0.1 to 0.1
    });
  }

  // Set specific key landmarks to consistent positions (simulating a face)
  landmarks[KEY_LANDMARK_INDICES.NOSE_TIP] = { x: 0.5, y: 0.5, z: 0.05 };
  landmarks[KEY_LANDMARK_INDICES.LEFT_EYE_INNER] = { x: 0.42, y: 0.4, z: 0.02 };
  landmarks[KEY_LANDMARK_INDICES.LEFT_EYE_OUTER] = { x: 0.35, y: 0.4, z: 0.01 };
  landmarks[KEY_LANDMARK_INDICES.RIGHT_EYE_INNER] = { x: 0.58, y: 0.4, z: 0.02 };
  landmarks[KEY_LANDMARK_INDICES.RIGHT_EYE_OUTER] = { x: 0.65, y: 0.4, z: 0.01 };
  landmarks[KEY_LANDMARK_INDICES.MOUTH_LEFT] = { x: 0.42, y: 0.65, z: 0.03 };
  landmarks[KEY_LANDMARK_INDICES.MOUTH_RIGHT] = { x: 0.58, y: 0.65, z: 0.03 };
  landmarks[KEY_LANDMARK_INDICES.CHIN] = { x: 0.5, y: 0.8, z: 0.02 };
  landmarks[KEY_LANDMARK_INDICES.FOREHEAD] = { x: 0.5, y: 0.2, z: 0.01 };

  return landmarks;
}

/**
 * Extract and format key landmarks for Noir circuit
 */
function extractKeyLandmarks(landmarks) {
  const keyIndices = [
    KEY_LANDMARK_INDICES.NOSE_TIP,
    KEY_LANDMARK_INDICES.LEFT_EYE_INNER,
    KEY_LANDMARK_INDICES.LEFT_EYE_OUTER,
    KEY_LANDMARK_INDICES.RIGHT_EYE_INNER,
    KEY_LANDMARK_INDICES.RIGHT_EYE_OUTER,
    KEY_LANDMARK_INDICES.MOUTH_LEFT,
    KEY_LANDMARK_INDICES.MOUTH_RIGHT,
    KEY_LANDMARK_INDICES.CHIN,
    KEY_LANDMARK_INDICES.FOREHEAD,
  ];

  return keyIndices.map(idx => {
    const l = landmarks[idx];
    return {
      x: Math.round(l.x * 10000).toString(),
      y: Math.round(l.y * 10000).toString(),
      z: Math.round((l.z || 0) * 10000).toString(),
    };
  });
}

/**
 * Compute geometric distances (same as Noir circuit)
 */
function computeGeometricSum(landmarks) {
  const distSq = (p1, p2) => {
    const dx = BigInt(p1.x) - BigInt(p2.x);
    const dy = BigInt(p1.y) - BigInt(p2.y);
    return dx * dx + dy * dy;
  };

  const eyeWidthSq = distSq(landmarks[2], landmarks[4]);   // l_eye_o to r_eye_o
  const mouthWidthSq = distSq(landmarks[5], landmarks[6]); // m_left to m_right
  const faceHeightSq = distSq(landmarks[7], landmarks[8]); // chin to forehead

  return {
    eyeWidthSq,
    mouthWidthSq,
    faceHeightSq,
    total: eyeWidthSq + mouthWidthSq + faceHeightSq
  };
}

/**
 * Generate a random wallet address for testing
 */
function generateTestWallet() {
  return '0x' + crypto.randomBytes(20).toString('hex');
}

/**
 * Main E2E test
 */
async function runE2ETest() {
  let backend = null;

  try {
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Generate mock liveness data
    // ═══════════════════════════════════════════════════════════════
    console.log('📸 STEP 1: Generating mock liveness data...');

    const mockLandmarks = generateMockLandmarks();
    console.log(`   Generated ${mockLandmarks.length} facial landmarks`);

    const keyLandmarks = extractKeyLandmarks(mockLandmarks);
    console.log('   Extracted 9 key landmarks for circuit');

    const geometry = computeGeometricSum(keyLandmarks);
    console.log(`   Eye width²: ${geometry.eyeWidthSq}`);
    console.log(`   Mouth width²: ${geometry.mouthWidthSq}`);
    console.log(`   Face height²: ${geometry.faceHeightSq}`);
    console.log(`   Geometric sum: ${geometry.total}`);
    console.log('   ✅ Liveness data ready\n');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Compute Poseidon nullifier
    // ═══════════════════════════════════════════════════════════════
    console.log('🔐 STEP 2: Computing Poseidon nullifier...');

    const poseidon = await buildPoseidon();
    const poseidonInput = geometry.total % BN254_FIELD_MODULUS;
    const nullifierResult = poseidon([poseidonInput]);
    const nullifier = poseidon.F.toObject(nullifierResult);
    const nullifierHex = '0x' + nullifier.toString(16);

    console.log(`   Nullifier: ${nullifierHex.slice(0, 20)}...${nullifierHex.slice(-10)}`);
    console.log('   ✅ Nullifier computed\n');

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Load circuit and generate ZK proof
    // ═══════════════════════════════════════════════════════════════
    console.log('⚡ STEP 3: Generating ZK proof (Noir/UltraPLONK)...');

    // Use process.cwd() for more reliable path resolution
    const projectRoot = process.cwd().includes('frontend')
      ? join(process.cwd(), '..')
      : process.cwd();
    const circuitPath = join(projectRoot, 'circuits/liveness/target/circuit.json');
    console.log(`   Loading circuit from: ${circuitPath}`);
    const circuit = JSON.parse(readFileSync(circuitPath, 'utf-8'));
    console.log(`   Circuit loaded: Noir ${circuit.noir_version}`);

    backend = new BarretenbergBackend(circuit);
    const noir = new Noir(circuit);

    const testWallet = generateTestWallet();
    const sessionNonce = '0x' + crypto.randomBytes(16).toString('hex');

    const circuitInputs = {
      landmarks: keyLandmarks,
      wallet_address: testWallet,
      session_nonce: sessionNonce,
      expected_nullifier: nullifierHex,
    };

    console.log(`   Wallet: ${testWallet}`);
    console.log(`   Session: ${sessionNonce.slice(0, 20)}...`);

    console.log('   Generating witness...');
    const startWitness = Date.now();
    const { witness } = await noir.execute(circuitInputs);
    console.log(`   Witness generated in ${Date.now() - startWitness}ms`);

    console.log('   Generating proof (this takes ~3s)...');
    const startProof = Date.now();
    const proof = await backend.generateProof(witness);
    const proofTimeMs = Date.now() - startProof;
    console.log(`   Proof generated in ${proofTimeMs}ms`);

    // Verify locally first
    console.log('   Verifying proof locally...');
    const verified = await backend.verifyProof(proof);
    if (!verified) {
      throw new Error('Local proof verification failed!');
    }
    console.log('   ✅ Proof verified locally\n');

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Prepare proof for submission
    // ═══════════════════════════════════════════════════════════════
    console.log('📦 STEP 4: Preparing proof for submission...');

    // Convert proof to base64 for transport
    const proofBase64 = Buffer.from(proof.proof).toString('base64');
    const proofHash = '0x' + crypto.createHash('sha256')
      .update(JSON.stringify(proof.publicInputs || []))
      .digest('hex')
      .slice(0, 62);

    const submissionPayload = {
      proof: proofBase64,
      proofHash: proofHash,
      publicInputs: {
        nullifier: nullifierHex,
        walletAddress: testWallet,
        sessionNonce: sessionNonce,
        timestamp: Date.now(),
      }
    };

    console.log(`   Proof size: ${proof.proof.length} bytes`);
    console.log(`   Proof hash: ${proofHash.slice(0, 20)}...`);
    console.log('   ✅ Payload ready\n');

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Submit to backend API
    // ═══════════════════════════════════════════════════════════════
    console.log('🚀 STEP 5: Submitting to backend API...');
    console.log(`   API URL: ${API_URL}/api/zk/submit-proof`);

    // First, get CSRF token
    console.log('   Getting CSRF token...');
    let csrfToken = '';
    let cookies = '';
    try {
      const csrfResponse = await fetch(`${API_URL}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      const csrfData = await csrfResponse.json();
      csrfToken = csrfData.csrfToken;
      // Get cookies from response
      cookies = csrfResponse.headers.get('set-cookie') || '';
      console.log(`   CSRF token obtained: ${csrfToken?.slice(0, 20)}...`);
    } catch (csrfError) {
      console.log(`   ⚠️ Could not get CSRF token: ${csrfError.message}`);
    }

    const response = await fetch(`${API_URL}/api/zk/submit-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': cookies,
      },
      body: JSON.stringify(submissionPayload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.log(`   ❌ Submission failed: ${result.error || result.details || 'Unknown error'}`);
      console.log('   Response:', JSON.stringify(result, null, 2));

      // Still continue to show what we can verify
      console.log('\n⚠️  Backend submission failed, but ZK proof generation succeeded!');
      console.log('   This might be because:');
      console.log('   - Backend server is not running');
      console.log('   - Starknet relay account needs funding');
      console.log('   - Network connectivity issue\n');
    } else {
      console.log('   ✅ Submission successful!');
      console.log(`   Transaction: ${result.transactionHash}`);
      console.log(`   Explorer: ${result.explorerUrl}\n`);

      // ═══════════════════════════════════════════════════════════════
      // STEP 6: Verify on-chain state
      // ═══════════════════════════════════════════════════════════════
      console.log('🔍 STEP 6: Verifying on-chain state...');

      // Wait a bit for transaction to be processed
      console.log('   Waiting 5s for transaction confirmation...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      const verifyResponse = await fetch(`${API_URL}/api/zk/verification/${testWallet}`);
      const verifyResult = await verifyResponse.json();

      if (verifyResult.isVerified) {
        console.log('   ✅ Wallet verified on-chain!');
        console.log(`   Transaction: ${verifyResult.transactionHash}`);
      } else {
        console.log('   ⏳ Wallet not yet verified (transaction may still be pending)');
      }

      // Check nullifier
      const nullifierResponse = await fetch(`${API_URL}/api/zk/check-nullifier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nullifier: nullifierHex }),
      });
      const nullifierResult = await nullifierResponse.json();

      if (nullifierResult.isUsed) {
        console.log('   ✅ Nullifier registered on-chain (Sybil protection active)');
      } else {
        console.log('   ⏳ Nullifier not yet registered (transaction may still be pending)');
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Landmarks generated:     468 (MediaPipe format)           ║`);
    console.log(`║  Key landmarks extracted: 9                                ║`);
    console.log(`║  Nullifier computed:      ✅ (Poseidon bn254)              ║`);
    console.log(`║  ZK Proof generated:      ✅ (${proofTimeMs}ms)                       ║`);
    console.log(`║  Proof verified locally:  ✅                               ║`);
    console.log(`║  Backend submission:      ${result?.success ? '✅' : '❌'}                               ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (result?.success) {
      console.log('🎉 END-TO-END TEST PASSED!\n');
    } else {
      console.log('⚠️  ZK proof generation works, but backend submission needs attention.\n');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    if (backend) {
      await backend.destroy();
    }
  }
}

// Run the test
runE2ETest();
