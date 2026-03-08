/**
 * ZK Prover Test Script
 *
 * Tests the Noir circuit integration with the zkProver service.
 * Run with: node --experimental-vm-modules tests/zkProver.test.js
 */

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { buildPoseidon } from 'circomlibjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// BN254 field modulus
const BN254_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

// Load circuit
const circuitPath = join(__dirname, '../../circuits/liveness/target/circuit.json');
const circuit = JSON.parse(readFileSync(circuitPath, 'utf-8'));

console.log('=== CasperID ZK Prover Test ===\n');
console.log('Circuit loaded:', circuit.noir_version);
console.log('Parameters:', circuit.abi.parameters.map(p => p.name).join(', '));
console.log('');

// Mock facial landmarks (9 key points scaled by 10000)
// These simulate MediaPipe Face Mesh normalized coordinates
const mockLandmarks = [
  { x: '5000', y: '3500', z: '100' },   // 0: Nose tip
  { x: '4200', y: '3000', z: '50' },    // 1: Left eye inner
  { x: '3800', y: '3000', z: '60' },    // 2: Left eye outer
  { x: '5800', y: '3000', z: '50' },    // 3: Right eye inner
  { x: '6200', y: '3000', z: '60' },    // 4: Right eye outer
  { x: '4500', y: '5500', z: '80' },    // 5: Mouth left
  { x: '5500', y: '5500', z: '80' },    // 6: Mouth right
  { x: '5000', y: '7000', z: '90' },    // 7: Chin
  { x: '5000', y: '1500', z: '70' },    // 8: Forehead
];

// Compute geometric distances (same as Noir circuit)
function distSq(p1, p2) {
  const dx = BigInt(p1.x) - BigInt(p2.x);
  const dy = BigInt(p1.y) - BigInt(p2.y);
  return dx * dx + dy * dy;
}

const eyeWidthSq = distSq(mockLandmarks[2], mockLandmarks[4]);   // l_eye_o to r_eye_o
const mouthWidthSq = distSq(mockLandmarks[5], mockLandmarks[6]); // m_left to m_right
const faceHeightSq = distSq(mockLandmarks[7], mockLandmarks[8]); // chin to forehead

const geometricSum = eyeWidthSq + mouthWidthSq + faceHeightSq;

console.log('Geometric measurements:');
console.log('  Eye width²:', eyeWidthSq.toString());
console.log('  Mouth width²:', mouthWidthSq.toString());
console.log('  Face height²:', faceHeightSq.toString());
console.log('  Geometric sum:', geometricSum.toString());
console.log('');

async function runTest() {
  try {
    // Initialize Poseidon
    console.log('Initializing Poseidon hasher...');
    const poseidon = await buildPoseidon();

    // Compute nullifier using Poseidon
    const poseidonInput = geometricSum % BN254_FIELD_MODULUS;
    const nullifierResult = poseidon([poseidonInput]);
    const nullifier = poseidon.F.toObject(nullifierResult);

    console.log('Computed nullifier (Poseidon):', '0x' + nullifier.toString(16));
    console.log('');

    // Initialize Noir
    console.log('Initializing Noir backend...');
    const backend = new BarretenbergBackend(circuit);
    const noir = new Noir(circuit);

    // Prepare circuit inputs
    const circuitInputs = {
      landmarks: mockLandmarks,
      wallet_address: '0x1234567890abcdef',
      session_nonce: '0xdeadbeef',
      expected_nullifier: '0x' + nullifier.toString(16),
    };

    console.log('Circuit inputs prepared');
    console.log('  wallet_address:', circuitInputs.wallet_address);
    console.log('  session_nonce:', circuitInputs.session_nonce);
    console.log('  expected_nullifier:', circuitInputs.expected_nullifier);
    console.log('');

    // Generate witness
    console.log('Generating witness...');
    const startWitness = Date.now();
    const { witness } = await noir.execute(circuitInputs);
    console.log(`Witness generated in ${Date.now() - startWitness}ms`);
    console.log('');

    // Generate proof
    console.log('Generating proof (this may take a while)...');
    const startProof = Date.now();
    const proof = await backend.generateProof(witness);
    console.log(`Proof generated in ${Date.now() - startProof}ms`);
    console.log('');

    // Verify proof
    console.log('Verifying proof...');
    const startVerify = Date.now();
    const verified = await backend.verifyProof(proof);
    console.log(`Proof verified in ${Date.now() - startVerify}ms`);
    console.log('Verification result:', verified ? '✅ VALID' : '❌ INVALID');
    console.log('');

    // Output proof details
    console.log('Proof details:');
    console.log('  Proof size:', proof.proof.length, 'bytes');
    console.log('  Public inputs:', proof.publicInputs?.length || 0);
    console.log('');

    console.log('=== Test Complete ===');

    // Cleanup
    await backend.destroy();

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
