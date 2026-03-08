/**
 * Test script to verify nullifier stability with scale-invariant ratios
 *
 * This simulates the same face captured at different distances/positions
 * and verifies the nullifier remains consistent.
 */

import { buildPoseidon } from 'circomlibjs';

const BN254_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

// Initialize Poseidon hasher
async function initPoseidon() {
  const poseidon = await buildPoseidon();
  return (inputs) => {
    const result = poseidon(inputs.map(i => i % BN254_FIELD_MODULUS));
    return poseidon.F.toObject(result);
  };
}

// Compute distance between two points
function dist(p1, p2) {
  const dx = Number(p1.x) - Number(p2.x);
  const dy = Number(p1.y) - Number(p2.y);
  return Math.sqrt(dx * dx + dy * dy);
}

// Compute nullifier from landmarks using scale-invariant ratios
async function computeNullifier(landmarks, poseidonHash) {
  const nose = landmarks[0];
  const l_eye_i = landmarks[1];
  const l_eye_o = landmarks[2];
  const r_eye_i = landmarks[3];
  const r_eye_o = landmarks[4];
  const m_left = landmarks[5];
  const m_right = landmarks[6];
  const chin = landmarks[7];
  const forehead = landmarks[8];

  // Compute key distances
  const eyeWidth = dist(l_eye_o, r_eye_o);
  const mouthWidth = dist(m_left, m_right);
  const faceHeight = dist(chin, forehead);
  const leftEyeWidth = dist(l_eye_i, l_eye_o);
  const rightEyeWidth = dist(r_eye_i, r_eye_o);
  const noseToChin = dist(nose, chin);

  // Compute SCALE-INVARIANT RATIOS
  const ratio1 = mouthWidth / eyeWidth;
  const ratio2 = faceHeight / eyeWidth;
  const ratio3 = leftEyeWidth / eyeWidth;
  const ratio4 = rightEyeWidth / eyeWidth;
  const ratio5 = noseToChin / faceHeight;

  // QUANTIZATION: Scale by 10000 and round to nearest 100
  const SCALE = 10000;
  const QUANTIZE = 100;

  const q1 = BigInt(Math.round(ratio1 * SCALE / QUANTIZE) * QUANTIZE);
  const q2 = BigInt(Math.round(ratio2 * SCALE / QUANTIZE) * QUANTIZE);
  const q3 = BigInt(Math.round(ratio3 * SCALE / QUANTIZE) * QUANTIZE);
  const q4 = BigInt(Math.round(ratio4 * SCALE / QUANTIZE) * QUANTIZE);
  const q5 = BigInt(Math.round(ratio5 * SCALE / QUANTIZE) * QUANTIZE);

  // Combine into geometric fingerprint
  const geometricFingerprint =
    q1 * 100000000000000n +
    q2 * 10000000000n +
    q3 * 1000000n +
    q4 * 100n +
    q5;

  const nullifier = poseidonHash([geometricFingerprint]);

  return {
    nullifier: '0x' + nullifier.toString(16).padStart(62, '0').slice(0, 62),
    ratios: { ratio1, ratio2, ratio3, ratio4, ratio5 },
    quantized: { q1, q2, q3, q4, q5 },
    fingerprint: geometricFingerprint
  };
}

// Generate face landmarks with specified scale and offset
function generateFaceLandmarks(scale = 1.0, offsetX = 0, offsetY = 0) {
  // Base face geometry (normalized 0-1)
  const baseLandmarks = [
    { x: 0.5, y: 0.55 },   // 0: nose
    { x: 0.42, y: 0.45 },  // 1: left eye inner
    { x: 0.35, y: 0.44 },  // 2: left eye outer
    { x: 0.58, y: 0.45 },  // 3: right eye inner
    { x: 0.65, y: 0.44 },  // 4: right eye outer
    { x: 0.40, y: 0.70 },  // 5: mouth left
    { x: 0.60, y: 0.70 },  // 6: mouth right
    { x: 0.50, y: 0.90 },  // 7: chin
    { x: 0.50, y: 0.25 },  // 8: forehead
  ];

  // Apply scale and offset (simulating different distances/positions)
  return baseLandmarks.map(p => ({
    x: ((p.x - 0.5) * scale + 0.5 + offsetX).toString(),
    y: ((p.y - 0.5) * scale + 0.5 + offsetY).toString()
  }));
}

// Add random jitter to landmarks (simulating measurement noise)
function addJitter(landmarks, jitterAmount = 0.005) {
  return landmarks.map(p => ({
    x: (Number(p.x) + (Math.random() - 0.5) * jitterAmount).toString(),
    y: (Number(p.y) + (Math.random() - 0.5) * jitterAmount).toString()
  }));
}

async function runTest() {
  console.log('='.repeat(70));
  console.log('NULLIFIER STABILITY TEST - Scale-Invariant Ratios');
  console.log('='.repeat(70));

  const poseidonHash = await initPoseidon();

  console.log('\n--- TEST 1: Same face, different scales (simulating distance) ---\n');

  const scales = [0.8, 1.0, 1.2, 1.5];
  const scaleResults = [];

  for (const scale of scales) {
    const landmarks = generateFaceLandmarks(scale, 0, 0);
    const result = await computeNullifier(landmarks, poseidonHash);
    scaleResults.push(result);

    console.log(`Scale ${scale}:`);
    console.log(`  Quantized: q1=${result.quantized.q1}, q2=${result.quantized.q2}, q3=${result.quantized.q3}, q4=${result.quantized.q4}, q5=${result.quantized.q5}`);
    console.log(`  Fingerprint: ${result.fingerprint}`);
    console.log(`  Nullifier: ${result.nullifier}`);
    console.log('');
  }

  // Check consistency
  const allSameNullifier = scaleResults.every(r => r.nullifier === scaleResults[0].nullifier);
  console.log(`\nScale invariance: ${allSameNullifier ? '✅ PASS - All nullifiers match!' : '❌ FAIL - Nullifiers differ!'}`);

  console.log('\n--- TEST 2: Same face, different positions (simulating movement) ---\n');

  const offsets = [
    { x: 0, y: 0 },
    { x: 0.1, y: 0 },
    { x: -0.1, y: 0.05 },
    { x: 0.05, y: -0.1 },
  ];
  const offsetResults = [];

  for (const offset of offsets) {
    const landmarks = generateFaceLandmarks(1.0, offset.x, offset.y);
    const result = await computeNullifier(landmarks, poseidonHash);
    offsetResults.push(result);

    console.log(`Offset (${offset.x.toFixed(2)}, ${offset.y.toFixed(2)}):`);
    console.log(`  Nullifier: ${result.nullifier}`);
  }

  const allSameOffset = offsetResults.every(r => r.nullifier === offsetResults[0].nullifier);
  console.log(`\nPosition invariance: ${allSameOffset ? '✅ PASS - All nullifiers match!' : '❌ FAIL - Nullifiers differ!'}`);

  console.log('\n--- TEST 3: Same face with measurement noise (jitter) ---\n');

  const jitterResults = [];
  for (let i = 0; i < 5; i++) {
    const landmarks = addJitter(generateFaceLandmarks(1.0, 0, 0), 0.003);
    const result = await computeNullifier(landmarks, poseidonHash);
    jitterResults.push(result);

    console.log(`Trial ${i + 1}:`);
    console.log(`  Quantized: q1=${result.quantized.q1}, q2=${result.quantized.q2}`);
    console.log(`  Nullifier: ${result.nullifier}`);
  }

  const allSameJitter = jitterResults.every(r => r.nullifier === jitterResults[0].nullifier);
  console.log(`\nNoise tolerance: ${allSameJitter ? '✅ PASS - All nullifiers match!' : '⚠️  WARNING - Some nullifiers differ (expected with high noise)'}`);

  console.log('\n--- TEST 4: Different faces should have different nullifiers ---\n');

  // Person A
  const personA = generateFaceLandmarks(1.0, 0, 0);
  const resultA = await computeNullifier(personA, poseidonHash);

  // Person B - different facial proportions
  const personB = [
    { x: '0.5', y: '0.55' },   // nose
    { x: '0.44', y: '0.45' },  // left eye inner (slightly different)
    { x: '0.36', y: '0.44' },  // left eye outer
    { x: '0.56', y: '0.45' },  // right eye inner
    { x: '0.64', y: '0.44' },  // right eye outer
    { x: '0.42', y: '0.72' },  // mouth left (wider mouth)
    { x: '0.58', y: '0.72' },  // mouth right
    { x: '0.50', y: '0.88' },  // chin (shorter face)
    { x: '0.50', y: '0.28' },  // forehead
  ];
  const resultB = await computeNullifier(personB, poseidonHash);

  console.log('Person A:', resultA.nullifier);
  console.log('Person B:', resultB.nullifier);

  const differentNullifiers = resultA.nullifier !== resultB.nullifier;
  console.log(`\nUniqueness: ${differentNullifiers ? '✅ PASS - Different faces have different nullifiers!' : '❌ FAIL - Collision detected!'}`);

  console.log('\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Scale invariance:    ${allSameNullifier ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Position invariance: ${allSameOffset ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Noise tolerance:     ${allSameJitter ? '✅ PASS' : '⚠️  MARGINAL'}`);
  console.log(`Uniqueness:          ${differentNullifiers ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(70));
}

runTest().catch(console.error);
