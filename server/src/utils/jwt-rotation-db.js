/**
 * Database-backed JWT rotation system
 * Tracks rotation state in MongoDB to prevent restart issues
 */

const crypto = require('crypto');

// Import models - we'll create a new schema for this
const mongoose = require('mongoose');

// Schema for tracking JWT rotation state
const jwtRotationSchema = new mongoose.Schema({
  secretId: {
    type: String,
    required: true,
    unique: true
  },
  currentSecretHash: {
    type: String,
    required: true
  },
  previousSecretHash: {
    type: String
  },
  lastRotationTime: {
    type: Date,
    required: true
  },
  nextRotationDue: {
    type: Date,
    required: true
  },
  rotationCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
});

const JWTRotation = mongoose.model('JWTRotation', jwtRotationSchema);

// In-memory secret storage (for this process only)
let currentSecrets = {
  current: process.env.JWT_SECRET,
  previous: null,
  lastRotation: null
};

/**
 * Initialize JWT rotation with database backing
 */
async function initializeJWTRotation() {
  try {
    console.log('🔒 Initializing JWT rotation system...');
    
    // Check if we have a rotation record
    let rotationRecord = await JWTRotation.findOne({ active: true });
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (!rotationRecord) {
      // First time setup
      console.log('📝 Setting up JWT rotation for first time...');
      
      let secretToUse = process.env.JWT_SECRET;
      let shouldRotateNow = false;
      
      // If using default secret, generate a new one immediately
      if (process.env.JWT_SECRET === 'test-secret-key-change-in-production') {
        console.log('⚠️ Default JWT secret detected - generating secure secret...');
        secretToUse = crypto.randomBytes(64).toString('hex');
        shouldRotateNow = true;
      }
      
      // Create initial rotation record
      rotationRecord = new JWTRotation({
        secretId: 'main',
        currentSecretHash: hashSecret(secretToUse),
        lastRotationTime: shouldRotateNow ? now : new Date(0), // Epoch if not rotated yet
        nextRotationDue: thirtyDaysFromNow,
        rotationCount: shouldRotateNow ? 1 : 0
      });
      
      await rotationRecord.save();
      
      currentSecrets.current = secretToUse;
      
      if (shouldRotateNow) {
        console.log('✅ Secure JWT secret generated and saved');
      }
    } else {
      // Existing rotation record found
      console.log('📂 Loading existing JWT rotation state...');
      
      // Check if it's time to rotate
      if (now > rotationRecord.nextRotationDue) {
        console.log('📅 JWT secret rotation due - rotating now...');
        await performRotation();
      } else {
        const timeUntilRotation = rotationRecord.nextRotationDue - now;
        const daysUntilRotation = Math.ceil(timeUntilRotation / (24 * 60 * 60 * 1000));
        console.log(`⏰ Next JWT rotation due in ${daysUntilRotation} days`);
      }
      
      // Load current secrets (we can't retrieve the actual secrets from hash, 
      // so we'll trust the current env var or regenerate if needed)
      currentSecrets.current = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    }
    
    // Schedule periodic checks (every hour)
    setInterval(checkRotationDue, 60 * 60 * 1000);
    
    console.log('✅ JWT rotation system initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize JWT rotation:', error);
    // Fall back to using env secret
    currentSecrets.current = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
  }
}

/**
 * Hash a secret for storage (one-way hash)
 */
function hashSecret(secret) {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Check if rotation is due and perform if needed
 */
async function checkRotationDue() {
  try {
    const rotationRecord = await JWTRotation.findOne({ active: true });
    
    if (rotationRecord && new Date() > rotationRecord.nextRotationDue) {
      console.log('📅 Scheduled rotation due - performing rotation...');
      await performRotation();
    }
  } catch (error) {
    console.error('❌ Error checking rotation schedule:', error);
  }
}

/**
 * Perform actual JWT secret rotation
 */
async function performRotation() {
  try {
    const rotationRecord = await JWTRotation.findOne({ active: true });
    
    if (!rotationRecord) {
      throw new Error('No rotation record found');
    }
    
    // Generate new secret
    const newSecret = crypto.randomBytes(64).toString('hex');
    const now = new Date();
    const nextRotationDue = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    // Update in-memory secrets
    currentSecrets.previous = currentSecrets.current;
    currentSecrets.current = newSecret;
    currentSecrets.lastRotation = now;
    
    // Update database record
    rotationRecord.previousSecretHash = rotationRecord.currentSecretHash;
    rotationRecord.currentSecretHash = hashSecret(newSecret);
    rotationRecord.lastRotationTime = now;
    rotationRecord.nextRotationDue = nextRotationDue;
    rotationRecord.rotationCount += 1;
    
    await rotationRecord.save();
    
    console.log('🔄 JWT secret rotated successfully');
    console.log(`ℹ️ Next rotation scheduled for: ${nextRotationDue.toISOString()}`);
    
    // Schedule cleanup of previous secret after 24 hours
    setTimeout(() => {
      currentSecrets.previous = null;
      console.log('🧹 Previous JWT secret cleaned up');
    }, 24 * 60 * 60 * 1000);
    
    return {
      rotated: true,
      nextRotationDue,
      rotationCount: rotationRecord.rotationCount
    };
    
  } catch (error) {
    console.error('❌ Failed to perform JWT rotation:', error);
    throw error;
  }
}

/**
 * Get current secret for signing
 */
function getCurrentSecret() {
  return currentSecrets.current;
}

/**
 * Get valid secrets for verification
 */
function getValidSecrets() {
  const validSecrets = [currentSecrets.current];
  if (currentSecrets.previous) {
    validSecrets.push(currentSecrets.previous);
  }
  return validSecrets;
}

/**
 * Verify token with rotation support
 */
function verifyTokenWithRotation(token, jwt) {
  const validSecrets = getValidSecrets();
  
  for (const secret of validSecrets) {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      continue;
    }
  }
  
  return null;
}

/**
 * Force rotation (admin endpoint)
 */
async function forceRotation() {
  const result = await performRotation();
  return {
    message: 'JWT secret rotated successfully',
    nextRotationDue: result.nextRotationDue,
    rotationCount: result.rotationCount
  };
}

/**
 * Get rotation status
 */
async function getRotationStatus() {
  try {
    const rotationRecord = await JWTRotation.findOne({ active: true });
    
    if (!rotationRecord) {
      return {
        initialized: false,
        error: 'No rotation record found'
      };
    }
    
    return {
      initialized: true,
      lastRotation: rotationRecord.lastRotationTime,
      nextRotationDue: rotationRecord.nextRotationDue,
      rotationCount: rotationRecord.rotationCount,
      hasCurrentSecret: !!currentSecrets.current,
      hasPreviousSecret: !!currentSecrets.previous
    };
  } catch (error) {
    return {
      initialized: false,
      error: error.message
    };
  }
}

module.exports = {
  initializeJWTRotation,
  getCurrentSecret,
  getValidSecrets,
  verifyTokenWithRotation,
  forceRotation,
  getRotationStatus,
  performRotation
};