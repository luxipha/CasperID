// CasperID Liveness Verification Circuit (Noir)
// ---------------------------------------------
// Proves that a user owns a specific biometric identity (nullifier)
// without revealing the raw facial ratios to the blockchain.
//
// SCALE-INVARIANT DESIGN:
// Instead of raw landmark coordinates (which vary with camera distance),
// we use pre-computed RATIOS that remain constant for the same face:
// - mouth_width / eye_width
// - face_height / eye_width
// - left_eye_width / eye_width
// - right_eye_width / eye_width
// - nose_to_chin / face_height
//
// These ratios are quantized (scaled by 10000, rounded to nearest 100)
// to absorb small measurement variations while maintaining uniqueness.

use dep::std;

fn main(
    // PRIVATE INPUTS (Pre-computed quantized ratios from facial geometry)
    // These ratios are scale-invariant - same face = same ratios
    // Using u32 to allow range validation comparisons
    q1: u32,  // mouth_width / eye_width * 10000, rounded to nearest 100
    q2: u32,  // face_height / eye_width * 10000, rounded to nearest 100
    q3: u32,  // left_eye_width / eye_width * 10000, rounded to nearest 100
    q4: u32,  // right_eye_width / eye_width * 10000, rounded to nearest 100
    q5: u32,  // nose_to_chin / face_height * 10000, rounded to nearest 100

    // PUBLIC INPUTS (Committed to the blockchain)
    wallet_address: pub Field,
    session_nonce: pub Field,
    expected_nullifier: pub Field,
) {
    // 1. Validate ratios are within reasonable human ranges
    // These constraints prevent invalid/fabricated inputs

    // mouth_width / eye_width should be ~0.5-1.0 (5000-10000 quantized)
    assert(q1 >= 4000);
    assert(q1 <= 12000);

    // face_height / eye_width should be ~2.0-4.0 (20000-40000 quantized)
    assert(q2 >= 15000);
    assert(q2 <= 50000);

    // eye widths should be ~0.1-0.35 of inter-eye distance (1000-3500 quantized)
    assert(q3 >= 500);
    assert(q3 <= 5000);
    assert(q4 >= 500);
    assert(q4 <= 5000);

    // nose_to_chin / face_height should be ~0.3-0.6 (3000-6000 quantized)
    assert(q5 >= 2000);
    assert(q5 <= 7000);

    // 2. Convert to Field for computation (required for Poseidon hash)
    let q1_f: Field = q1 as Field;
    let q2_f: Field = q2 as Field;
    let q3_f: Field = q3 as Field;
    let q4_f: Field = q4 as Field;
    let q5_f: Field = q5 as Field;

    // 3. Combine quantized ratios into geometric fingerprint
    // Using weighted combination to create unique value
    // Same formula as TypeScript: fingerprint = q1*10^14 + q2*10^10 + q3*10^6 + q4*10^2 + q5

    let w1: Field = 100000000000000;  // 10^14
    let w2: Field = 10000000000;      // 10^10
    let w3: Field = 1000000;          // 10^6
    let w4: Field = 100;              // 10^2

    let geometric_fingerprint = q1_f * w1 + q2_f * w2 + q3_f * w3 + q4_f * w4 + q5_f;

    // 4. Hash the fingerprint to create the nullifier
    let nullifier = std::hash::poseidon::bn254::hash_1([geometric_fingerprint]);

    // 5. Verify nullifier matches expected value
    assert(nullifier == expected_nullifier);
}
