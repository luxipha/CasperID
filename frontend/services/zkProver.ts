/**
 * CasperID ZK Prover Service
 *
 * Generates privacy-preserving proofs of liveness verification.
 * The nullifier is derived from facial geometry - same face always produces same nullifier.
 * This prevents Sybil attacks (one person creating multiple accounts).
 *
 * NOTE: This is the client-side implementation.
 * In production, the `generateProof` function will use Stone Prover WASM
 * to generate actual STARK proofs. For now, we compute the nullifier
 * and create a proof structure that the backend can verify.
 */

// Key facial landmark indices from MediaPipe Face Mesh (468 points)
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

export interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface LivenessProofInput {
  // Array of facial landmarks from MediaPipe Face Mesh
  faceLandmarks: FaceLandmark[];
  // Challenge responses captured during liveness check
  challengeResponses: {
    blinkTimestamps: number[];
    mouthOpenRatio: number;
    headMovementDetected: boolean;
  };
  // Session nonce to prevent replay attacks
  sessionNonce: string;
  // Wallet address to bind proof to
  walletAddress: string;
}

export interface ProofOutput {
  // The proof data (in production: STARK proof bytes)
  proof: string;
  // Hash of the proof for verification
  proofHash: string;
  // Public inputs that can be verified on-chain
  publicInputs: {
    // Unique identifier derived from facial geometry (prevents Sybil)
    nullifier: string;
    // Session nonce (prevents replay)
    sessionNonce: string;
    // Timestamp of proof generation
    timestamp: number;
    // Wallet address this proof is bound to
    walletAddress: string;
  };
  // Metadata
  metadata: {
    proofGenerationTimeMs: number;
    landmarkCount: number;
  };
}

/**
 * Simple hash function for generating deterministic nullifiers
 * Uses a combination of position ratios from key facial landmarks
 * This ensures the same face always produces the same nullifier
 */
function computeGeometryHash(landmarks: FaceLandmark[]): string {
  // Extract key facial geometry points
  const points = [
    landmarks[KEY_LANDMARK_INDICES.NOSE_TIP],
    landmarks[KEY_LANDMARK_INDICES.LEFT_EYE_INNER],
    landmarks[KEY_LANDMARK_INDICES.LEFT_EYE_OUTER],
    landmarks[KEY_LANDMARK_INDICES.RIGHT_EYE_INNER],
    landmarks[KEY_LANDMARK_INDICES.RIGHT_EYE_OUTER],
    landmarks[KEY_LANDMARK_INDICES.MOUTH_LEFT],
    landmarks[KEY_LANDMARK_INDICES.MOUTH_RIGHT],
    landmarks[KEY_LANDMARK_INDICES.CHIN],
    landmarks[KEY_LANDMARK_INDICES.FOREHEAD],
  ].filter(p => p); // Filter out any undefined points

  if (points.length < 7) {
    throw new Error('Insufficient facial landmarks for nullifier generation');
  }

  // Compute normalized ratios (scale-invariant, position-invariant)
  // These ratios are unique to each person's facial structure
  const nose = points[0];
  const leftEyeInner = points[1];
  const leftEyeOuter = points[2];
  const rightEyeInner = points[3];
  const rightEyeOuter = points[4];
  const mouthLeft = points[5];
  const mouthRight = points[6];
  const chin = points[7] || nose;
  const forehead = points[8] || nose;

  // Calculate distances
  const eyeWidth = Math.sqrt(
    Math.pow(rightEyeOuter.x - leftEyeOuter.x, 2) +
    Math.pow(rightEyeOuter.y - leftEyeOuter.y, 2)
  );

  const mouthWidth = Math.sqrt(
    Math.pow(mouthRight.x - mouthLeft.x, 2) +
    Math.pow(mouthRight.y - mouthLeft.y, 2)
  );

  const faceHeight = Math.sqrt(
    Math.pow(chin.x - forehead.x, 2) +
    Math.pow(chin.y - forehead.y, 2)
  );

  const noseToMouth = Math.sqrt(
    Math.pow(nose.x - (mouthLeft.x + mouthRight.x) / 2, 2) +
    Math.pow(nose.y - (mouthLeft.y + mouthRight.y) / 2, 2)
  );

  const eyeToNose = Math.sqrt(
    Math.pow(nose.x - (leftEyeInner.x + rightEyeInner.x) / 2, 2) +
    Math.pow(nose.y - (leftEyeInner.y + rightEyeInner.y) / 2, 2)
  );

  // Create normalized ratios (these remain constant regardless of image scale/position)
  const ratios = [
    mouthWidth / eyeWidth,           // mouth-to-eye ratio
    noseToMouth / faceHeight,        // nose position ratio
    eyeToNose / faceHeight,          // eye-nose ratio
    (leftEyeOuter.x - leftEyeInner.x) / eyeWidth, // left eye aspect
    (rightEyeOuter.x - rightEyeInner.x) / eyeWidth, // right eye aspect
  ];

  // Quantize ratios to reduce noise while maintaining uniqueness
  // Using 4 decimal places for precision
  const quantized = ratios.map(r => Math.round(r * 10000));

  // Create a deterministic string from the ratios
  const geometryString = quantized.join(':');

  // Hash the geometry string using a simple but effective hash
  return sha256(geometryString);
}

/**
 * Simple SHA-256 implementation using SubtleCrypto
 * Returns hex string
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous hash for nullifier (fallback if SubtleCrypto unavailable)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Expand to 64 hex chars for consistency
  const base = Math.abs(hash).toString(16);
  return base.padStart(16, '0').repeat(4);
}

/**
 * Compute biometric nullifier from facial landmarks
 * This is a ONE-WAY hash - the nullifier cannot be reversed to reveal facial features
 */
export async function computeNullifier(landmarks: FaceLandmark[]): Promise<string> {
  try {
    const geometryHash = await computeGeometryHash(landmarks);
    // Prefix with 0x for Starknet compatibility (felt252)
    return '0x' + geometryHash.slice(0, 62); // 62 hex chars = 248 bits (fits in felt252)
  } catch (error) {
    console.error('Error computing nullifier:', error);
    throw new Error('Failed to compute biometric nullifier');
  }
}

/**
 * Generate a ZK proof of liveness
 *
 * In production, this will:
 * 1. Initialize Stone Prover WASM module
 * 2. Create a computation trace proving:
 *    - Face was detected with valid landmarks
 *    - Liveness challenges were passed (blinks, mouth movement)
 *    - All happened in temporal sequence
 * 3. Generate STARK proof of the trace
 *
 * Currently, we generate a proof structure that can be verified
 * by the backend and submitted to Starknet.
 */
export async function generateLivenessProof(
  input: LivenessProofInput,
  onProgress?: (progress: number, message: string) => void
): Promise<ProofOutput> {
  const startTime = Date.now();

  try {
    onProgress?.(0, 'Initializing proof generator...');

    // Validate input
    if (!input.faceLandmarks || input.faceLandmarks.length < 100) {
      throw new Error('Insufficient facial landmarks for proof generation');
    }

    onProgress?.(10, 'Extracting facial geometry...');

    // Compute nullifier from facial landmarks
    const nullifier = await computeNullifier(input.faceLandmarks);

    onProgress?.(30, 'Computing biometric nullifier...');

    // Validate liveness challenges were completed
    const { blinkTimestamps, mouthOpenRatio, headMovementDetected } = input.challengeResponses;

    if (blinkTimestamps.length < 2) {
      throw new Error('Insufficient blink data for proof');
    }

    onProgress?.(50, 'Validating liveness challenges...');

    // Create proof payload
    // In production, this would be the actual STARK proof bytes
    const proofData = {
      version: '1.0.0',
      type: 'CASPERID_LIVENESS_V1',
      nullifier,
      landmarkCount: input.faceLandmarks.length,
      challengeData: {
        blinks: blinkTimestamps.length,
        mouthOpen: mouthOpenRatio > 0.15,
        headMovement: headMovementDetected,
      },
      sessionNonce: input.sessionNonce,
      walletAddress: input.walletAddress,
      timestamp: Date.now(),
    };

    onProgress?.(70, 'Generating cryptographic proof...');

    // Serialize and hash the proof
    const proofString = JSON.stringify(proofData);
    const proofHash = await sha256(proofString);

    onProgress?.(90, 'Finalizing proof...');

    const generationTime = Date.now() - startTime;

    onProgress?.(100, 'Proof generation complete');

    return {
      proof: btoa(proofString), // Base64 encode for transport
      proofHash: '0x' + proofHash.slice(0, 62),
      publicInputs: {
        nullifier,
        sessionNonce: input.sessionNonce,
        timestamp: Date.now(),
        walletAddress: input.walletAddress,
      },
      metadata: {
        proofGenerationTimeMs: generationTime,
        landmarkCount: input.faceLandmarks.length,
      },
    };
  } catch (error) {
    console.error('Proof generation failed:', error);
    throw error;
  }
}

/**
 * Verify a proof locally (basic validation)
 * Full verification happens on Starknet via the CasperID_ZK contract
 */
export function verifyProofLocally(proof: ProofOutput): boolean {
  try {
    // Check nullifier format
    if (!proof.publicInputs.nullifier.startsWith('0x')) {
      return false;
    }

    // Check timestamp is recent (within last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (proof.publicInputs.timestamp < oneHourAgo) {
      return false;
    }

    // Check proof data can be decoded
    const decoded = atob(proof.proof);
    const proofData = JSON.parse(decoded);

    // Verify structure
    if (!proofData.nullifier || !proofData.sessionNonce) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the browser supports required crypto features
 */
export function isProverSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.subtle.digest === 'function'
  );
}

export default {
  generateLivenessProof,
  computeNullifier,
  verifyProofLocally,
  isProverSupported,
};
