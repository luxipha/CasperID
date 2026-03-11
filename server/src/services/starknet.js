/**
 * CasperID Starknet Service
 *
 * Handles ZK proof submission and verification on Starknet Sepolia.
 * This service acts as a relay for users without Starknet wallets,
 * sponsoring gas fees for proof submission.
 */

const { RpcProvider, Account, Contract, CallData, cairo } = require('starknet');

// ============================================
// CONFIGURATION
// ============================================

const STARKNET_RPC_URL = process.env.STARKNET_RPC_URL ||
  'https://starknet-sepolia-rpc.publicnode.com';

const CASPERID_ZK_CONTRACT = process.env.CASPERID_ZK_CONTRACT;
const STARKNET_RELAY_ADDRESS = process.env.STARKNET_RELAY_ADDRESS;
const STARKNET_RELAY_PRIVATE_KEY = process.env.STARKNET_RELAY_PRIVATE_KEY;

// Contract ABI (minimal - just the functions we need)
const CASPERID_ZK_ABI = {
  abi: [
    {
      name: 'verify_and_register',
      type: 'function',
      inputs: [
        { name: 'proof_hash', type: 'felt252' },
        { name: 'wallet_address', type: 'ContractAddress' },
        { name: 'biometric_nullifier', type: 'felt252' }
      ],
      outputs: [{ type: 'bool' }],
      state_mutability: 'external'
    },
    {
      name: 'is_verified',
      type: 'function',
      inputs: [{ name: 'wallet', type: 'ContractAddress' }],
      outputs: [{ type: 'bool' }],
      state_mutability: 'view'
    },
    {
      name: 'is_nullifier_used',
      type: 'function',
      inputs: [{ name: 'nullifier', type: 'felt252' }],
      outputs: [{ type: 'bool' }],
      state_mutability: 'view'
    },
    {
      name: 'add_valid_proof',
      type: 'function',
      inputs: [{ name: 'proof_hash', type: 'felt252' }],
      outputs: [],
      state_mutability: 'external'
    },
    {
      name: 'get_verified_count',
      type: 'function',
      inputs: [],
      outputs: [{ type: 'u64' }],
      state_mutability: 'view'
    }
  ]
};

// ============================================
// PROVIDER & ACCOUNT SETUP
// ============================================

let provider = null;
let relayAccount = null;
let contract = null;

/**
 * Initialize the Starknet provider and relay account
 */
function initializeProvider() {
  if (provider) return;

  provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL });

  if (STARKNET_RELAY_ADDRESS && STARKNET_RELAY_PRIVATE_KEY) {
    relayAccount = new Account({
      provider,
      address: STARKNET_RELAY_ADDRESS,
      signer: STARKNET_RELAY_PRIVATE_KEY
    });
    console.log('[Starknet] Relay account initialized:', STARKNET_RELAY_ADDRESS);
  } else {
    console.warn('[Starknet] Relay account not configured - ZK submissions will fail');
  }

  if (CASPERID_ZK_CONTRACT) {
    contract = new Contract(CASPERID_ZK_ABI, CASPERID_ZK_CONTRACT, relayAccount || provider);
    console.log('[Starknet] Contract initialized:', CASPERID_ZK_CONTRACT);
  } else {
    console.warn('[Starknet] Contract address not configured');
  }
}

// Initialize on module load
initializeProvider();

// ============================================
// PROOF VERIFICATION
// ============================================

/**
 * Verify a ZK proof from the frontend
 * Basic validation before submitting to Starknet
 */
function verifyProofLocally(proofData) {
  try {
    // 1. Try to decode as JSON (Mock/Legacy format)
    let proof;
    try {
      const decoded = Buffer.from(proofData.proof, 'base64').toString('utf-8');
      proof = JSON.parse(decoded);
    } catch (e) {
      // 2. If JSON parsing fails, it's likely a raw binary ZK proof (Noir format)
      console.log('[Starknet] Received binary proof, relying on public inputs for verification');

      // For binary proofs, we rely on the publicInputs provided in the request
      const { publicInputs } = proofData;

      if (!publicInputs.nullifier || !publicInputs.walletAddress || !publicInputs.sessionNonce) {
        return { valid: false, error: 'Missing public inputs for binary proof' };
      }

      // Check timestamp if available in publicInputs
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      if (publicInputs.timestamp && publicInputs.timestamp < oneHourAgo) {
        return { valid: false, error: 'Proof has expired' };
      }

      return { valid: true, format: 'binary' };
    }

    // 3. Verify structure for JSON proofs
    if (!proof.nullifier || !proof.sessionNonce || !proof.walletAddress) {
      return { valid: false, error: 'Invalid proof structure' };
    }

    // Verify version
    if (proof.version !== '1.0.0') {
      return { valid: false, error: 'Unsupported proof version' };
    }

    // Verify timestamp is recent (within last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (proof.timestamp < oneHourAgo) {
      return { valid: false, error: 'Proof has expired' };
    }

    // Verify challenge data (if mock)
    if (proof.type === 'CASPERID_LIVENESS_V1' && (!proof.challengeData || proof.challengeData.blinks < 2)) {
      return { valid: false, error: 'Insufficient liveness data' };
    }

    // Verify nullifier matches public input
    if (proof.nullifier !== proofData.publicInputs.nullifier) {
      return { valid: false, error: 'Nullifier mismatch' };
    }

    return { valid: true, proof, format: 'json' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// ============================================
// STARKNET SUBMISSION
// ============================================

/**
 * Format Casper Wallet to Starknet ContractAddress (felt252)
 * Casper format: "account-hash-HEX64"
 * Starknet max is ~251 bits. We take the last 62 hex chars of the hash (248 bits)
 */
function formatWalletToFelt(casperWallet) {
  if (!casperWallet) return cairo.felt('0x0');
  let hex = casperWallet.toString();
  if (hex.startsWith('account-hash-')) hex = hex.replace('account-hash-', '');
  if (hex.startsWith('0x')) hex = hex.slice(2);

  // Take the last 62 characters (248 bits) which easily fits in a 251-bit felt
  const safeHex = '0x' + hex.slice(-62);
  return safeHex;
}

/**
 * Submit a ZK proof to Starknet
 * This registers the identity on-chain using the relay account for gas
 */
async function submitProofToStarknet({ proof, proofHash, publicInputs }) {
  // Check configuration
  if (!contract || !relayAccount) {
    throw new Error('Starknet not configured. Set CASPERID_ZK_CONTRACT and relay account env vars.');
  }

  // Verify proof locally first
  const verification = verifyProofLocally({ proof, publicInputs });
  if (!verification.valid) {
    throw new Error(`Proof verification failed: ${verification.error}`);
  }

  try {
    // Check if nullifier is already used (Sybil prevention)
    const nullifierUsed = await isNullifierUsed(publicInputs.nullifier);
    if (nullifierUsed) {
      throw new Error('This biometric identity is already registered');
    }

    // Convert wallet address to Starknet format (fits inside felt252 limit)
    const walletAddress = formatWalletToFelt(publicInputs.walletAddress);

    // First, register the proof hash as valid (owner operation)
    console.log('[Starknet] Adding valid proof hash:', proofHash);
    const proofHashFelt = cairo.felt(proofHash);

    // Starknet felt252 limit is ~252 bits. BN254 poseidon hash can be 254 bits.
    // We mask the nullifier to 251 bits to ensure it always fits in a felt252.
    const MASK_251_BITS = (1n << 251n) - 1n;
    const safeNullifier = '0x' + (BigInt(publicInputs.nullifier) & MASK_251_BITS).toString(16);
    const nullifierFelt = cairo.felt(safeNullifier);

    const addProofTx = await relayAccount.execute({
      contractAddress: CASPERID_ZK_CONTRACT,
      entrypoint: 'add_valid_proof',
      calldata: [proofHashFelt]
    });

    console.log('[Starknet] Waiting for proof hash registration...');
    await provider.waitForTransaction(addProofTx.transaction_hash);
    console.log('[Starknet] Proof hash registered:', addProofTx.transaction_hash);

    // Now register the identity
    console.log('[Starknet] Registering identity...');
    const registerTx = await relayAccount.execute({
      contractAddress: CASPERID_ZK_CONTRACT,
      entrypoint: 'verify_and_register',
      calldata: [proofHashFelt, walletAddress, nullifierFelt]
    });

    const receipt = await provider.waitForTransaction(registerTx.transaction_hash);
    console.log('[Starknet] Identity registered:', registerTx.transaction_hash);

    return {
      success: true,
      transactionHash: registerTx.transaction_hash,
      explorerUrl: `https://sepolia.voyager.online/tx/${registerTx.transaction_hash}`,
      blockNumber: receipt.block_number,
    };
  } catch (error) {
    console.error('[Starknet] Submission failed:', error);
    throw new Error(`Starknet submission failed: ${error.message}`);
  }
}

/**
 * Check if a wallet address is ZK-verified on Starknet
 */
async function isWalletVerified(walletAddress) {
  if (!CASPERID_ZK_CONTRACT) {
    throw new Error('Starknet contract not configured');
  }

  try {
    initializeProvider();
    const safeWallet = formatWalletToFelt(walletAddress);
    const result = await contract.is_verified(safeWallet);
    return !!result;
  } catch (error) {
    console.error('[Starknet] Verification check failed:', error.message);
    return false;
  }
}

/**
 * Check if a nullifier has been used (Sybil check)
 */
async function isNullifierUsed(nullifier) {
  if (!CASPERID_ZK_CONTRACT) {
    throw new Error('Starknet contract not configured');
  }

  try {
    const MASK_251_BITS = (1n << 251n) - 1n;
    const safeNullifier = '0x' + (BigInt(nullifier) & MASK_251_BITS).toString(16);

    const result = await contract.is_nullifier_used(safeNullifier);
    return !!result;
  } catch (error) {
    console.error('[Starknet] Error checking nullifier:', error.message);
    return false;
  }
}

/**
 * Get total number of verified identities
 */
async function getVerifiedCount() {
  if (!contract) {
    throw new Error('Starknet contract not configured');
  }

  try {
    const resp = await provider.callContract({
      contractAddress: CASPERID_ZK_CONTRACT,
      entrypoint: 'get_verified_count',
      calldata: []
    });
    return Number(resp[0]);
  } catch (error) {
    console.error('[Starknet] Count fetch failed:', error);
    return 0;
  }
}

/**
 * Get service status
 */
function getServiceStatus() {
  return {
    configured: !!contract && !!relayAccount,
    contractAddress: CASPERID_ZK_CONTRACT || null,
    relayAddress: STARKNET_RELAY_ADDRESS || null,
    rpcUrl: STARKNET_RPC_URL,
    network: 'starknet-sepolia',
  };
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  submitProofToStarknet,
  isWalletVerified,
  isNullifierUsed,
  getVerifiedCount,
  getServiceStatus,
  verifyProofLocally,
};
