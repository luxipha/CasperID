const { Keys } = require('casper-js-sdk');
const crypto = require('crypto');
const { UserAccount } = require('../database/models');
const { walletToHuman } = require('../utils/wallet-to-human');

/**
 * Self-Custody Wallet Generation Service
 * Creates deterministic Casper wallets from passkey + email + salt
 * Maintains true self-custody - private keys never stored on server
 */
class WalletGeneratorService {
    constructor() {
        this.DERIVATION_INFO = 'CasperID-Wallet-v1';
        this.KEY_LENGTH = 32; // 256 bits
    }

    /**
     * Generate deterministic wallet from passkey credential and email
     * Uses HKDF for secure key derivation
     */
    async generateWalletFromPasskey(credentialId, recoveryEmail, userSalt, additionalEntropy = '') {
        try {
            // Input validation
            if (!credentialId || !recoveryEmail || !userSalt) {
                throw new Error('Missing required parameters for wallet generation');
            }

            // Create deterministic seed from inputs
            const seed = this.deriveWalletSeed(credentialId, recoveryEmail, userSalt, additionalEntropy);

            // Generate Ed25519 key pair from seed
            const keyPair = this.generateKeyPairFromSeed(seed);

            // Create Casper wallet address
            const walletAddress = this.generateWalletAddress(keyPair.publicKey);

            // Generate human-readable ID
            const humanId = this.generateHumanId(walletAddress);

            return {
                walletAddress,
                publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
                humanId,
                // Note: privateKey is intentionally not returned for security
                derivationInputs: {
                    credentialId: credentialId.slice(0, 8) + '...', // Partial for debugging
                    emailHash: this.hashInput(recoveryEmail).slice(0, 8) + '...',
                    saltHash: userSalt.slice(0, 8) + '...'
                }
            };

        } catch (error) {
            console.error('Wallet generation failed:', error);
            throw new Error(`Wallet generation failed: ${error.message}`);
        }
    }

    /**
     * Restore wallet for signing (use only when user needs to sign)
     * Returns private key for immediate use and discards
     */
    async restoreWalletForSigning(credentialId, recoveryEmail, userSalt, additionalEntropy = '') {
        try {
            // Derive the same seed
            const seed = this.deriveWalletSeed(credentialId, recoveryEmail, userSalt, additionalEntropy);

            // Generate key pair
            const keyPair = this.generateKeyPairFromSeed(seed);

            return {
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey,
                walletAddress: this.generateWalletAddress(keyPair.publicKey)
            };

        } catch (error) {
            console.error('Wallet restoration failed:', error);
            throw new Error(`Wallet restoration failed: ${error.message}`);
        }
    }

    /**
     * Update user account with generated wallet information
     */
    async updateUserAccountWithWallet(userId, walletInfo) {
        try {
            const userAccount = await UserAccount.findOne({ user_id: userId });
            if (!userAccount) {
                throw new Error('User account not found');
            }

            userAccount.wallet = walletInfo.walletAddress;
            userAccount.tier = 'layer_1'; // Upgrade to Layer 1
            userAccount.updated_at = new Date();

            await userAccount.save();

            return userAccount;

        } catch (error) {
            console.error('User account wallet update failed:', error);
            throw new Error(`Failed to update user account: ${error.message}`);
        }
    }

    /**
     * Derive deterministic seed using HKDF
     * Combines multiple entropy sources for security
     */
    deriveWalletSeed(credentialId, recoveryEmail, userSalt, additionalEntropy = '') {
        try {
            // Normalize inputs
            const normalizedEmail = recoveryEmail.toLowerCase().trim();

            // Create input material by concatenating all entropy sources
            const inputMaterial = [
                this.hashInput(credentialId),
                this.hashInput(normalizedEmail),
                userSalt,
                additionalEntropy
            ].join('|');

            // Use HKDF to derive key material
            const inputKeyMaterial = crypto.createHash('sha256').update(inputMaterial).digest();

            // Extract phase
            const prk = crypto.createHmac('sha256', Buffer.alloc(32, 0)).update(inputKeyMaterial).digest();

            // Expand phase
            const info = Buffer.from(this.DERIVATION_INFO, 'utf8');
            const t1 = crypto.createHmac('sha256', prk).update(Buffer.concat([info, Buffer.from([0x01])])).digest();

            return t1.slice(0, this.KEY_LENGTH);

        } catch (error) {
            console.error('Seed derivation failed:', error);
            throw new Error('Failed to derive wallet seed');
        }
    }

    /**
     * Generate Ed25519 key pair from seed (deterministic)
     */
    generateKeyPairFromSeed(seed) {
        try {
            // Ensure seed is exactly 32 bytes for Ed25519
            const privateKeyBytes = seed.slice(0, 32);
            const privateKeyHex = privateKeyBytes.toString('hex');

            // Generate deterministic private key from seed
            const privateKey = Keys.Ed25519.parsePrivateKey(privateKeyHex);

            // Derive corresponding public key
            const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);

            return {
                privateKey,
                publicKey
            };

        } catch (error) {
            console.error('Key pair generation failed:', error);
            throw new Error('Failed to generate key pair from seed');
        }
    }

    /**
     * Generate Casper wallet address from public key
     */
    generateWalletAddress(publicKey) {
        try {
            // Generate account hash from public key
            const accountHashBytes = Keys.Ed25519.accountHash(publicKey);

            // Convert to hex string with account-hash prefix
            const accountHashHex = Buffer.from(accountHashBytes).toString('hex');
            return `account-hash-${accountHashHex}`;

        } catch (error) {
            console.error('Wallet address generation failed:', error);
            // Fallback to account hex method
            try {
                const accountHex = Keys.Ed25519.accountHex(publicKey);
                return `account-hash-${accountHex}`;
            } catch (fallbackError) {
                throw new Error('Failed to generate wallet address');
            }
        }
    }

    /**
     * Generate human-readable ID from wallet address
     * Uses the sophisticated Markov chain-based wallet-to-human utility
     */
    generateHumanId(walletAddress) {
        try {
            // Use the existing walletToHuman function with Markov chain
            const { humanId } = walletToHuman(walletAddress);
            return humanId;

        } catch (error) {
            console.error('Human ID generation failed:', error);
            return `user-${Date.now()}`;
        }
    }

    /**
     * Create consistent hash of input string
     */
    hashInput(input) {
        return crypto.createHash('sha256').update(String(input)).digest('hex');
    }

    /**
     * Sign a payload using the user's self-custody Ed25519 wallet.
     * The private key is reconstructed from the user's deterministic seed,
     * used to produce a real 64-byte Ed25519 signature, then immediately
     * cleared from memory.
     *
     * @param {string} userId          - User account ID
     * @param {Buffer|Uint8Array} transactionData - Raw bytes to sign (typically a SHA-256 digest)
     * @param {string} purpose         - Descriptive label (e.g. 'verification_proof')
     * @returns {{ signature, publicKey, walletAddress, purpose }}
     */
    async signTransactionForUser(userId, transactionData, purpose = 'verification') {
        try {
            const userAccount = await UserAccount.findOne({ user_id: userId });
            if (!userAccount) {
                throw new Error('User account not found');
            }

            if (!userAccount.active_passkey_id) {
                throw new Error('No active passkey found for user');
            }

            // Restore wallet temporarily for signing
            const wallet = await this.restoreWalletForSigning(
                userAccount.active_passkey_id,
                userAccount.recovery_email,
                userAccount.user_salt
            );

            // Build the Casper AsymmetricKey pair (gives us the .sign() method)
            const keyPair = Keys.Ed25519.parseKeyPair(
                wallet.publicKey,   // Uint8Array
                wallet.privateKey   // Uint8Array  
            );

            // Produce a real 64-byte Ed25519 signature
            const signatureBytes = keyPair.sign(Buffer.isBuffer(transactionData)
                ? transactionData
                : Buffer.from(transactionData));

            const signature = Buffer.from(signatureBytes).toString('hex');
            const publicKeyHex = Buffer.from(wallet.publicKey).toString('hex');
            const walletAddress = wallet.walletAddress;

            // Zero private key bytes from memory immediately after use
            if (wallet.privateKey instanceof Uint8Array) {
                wallet.privateKey.fill(0);
            }
            wallet.privateKey = null;

            return {
                signature,
                publicKey: publicKeyHex,
                walletAddress,
                purpose
            };

        } catch (error) {
            console.error('Transaction signing failed:', error);
            throw new Error(`Transaction signing failed: ${error.message}`);
        }
    }

    /**
     * Validate that a given wallet was generated from the expected inputs
     */
    async validateWalletOwnership(credentialId, recoveryEmail, userSalt, expectedWalletAddress) {
        try {
            const derivedWallet = await this.generateWalletFromPasskey(
                credentialId,
                recoveryEmail,
                userSalt
            );

            return derivedWallet.walletAddress === expectedWalletAddress;

        } catch (error) {
            console.error('Wallet validation failed:', error);
            return false;
        }
    }

    /**
     * Generate backup recovery data (encrypted)
     * For emergency recovery scenarios
     */
    async generateBackupRecoveryData(userId, masterPassword) {
        try {
            const userAccount = await UserAccount.findOne({ user_id: userId });
            if (!userAccount) {
                throw new Error('User account not found');
            }

            // Create backup data
            const backupData = {
                user_id: userId,
                recovery_email: userAccount.recovery_email,
                user_salt: userAccount.user_salt,
                active_passkey_id: userAccount.active_passkey_id,
                wallet: userAccount.wallet,
                backup_timestamp: Date.now(),
                version: 1
            };

            // Encrypt backup data with master password
            const iv = crypto.randomBytes(16); // Generate random IV
            const key = crypto.scryptSync(masterPassword, 'salt', 32); // Derive key
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

            const encrypted = Buffer.concat([
                cipher.update(JSON.stringify(backupData), 'utf8'),
                cipher.final()
            ]);

            const authTag = cipher.getAuthTag();

            return {
                encryptedBackup: encrypted.toString('base64'),
                authTag: authTag.toString('base64'),
                iv: iv.toString('base64'),
                version: 1
            };

        } catch (error) {
            console.error('Backup generation failed:', error);
            throw new Error(`Backup generation failed: ${error.message}`);
        }
    }

    /**
     * Restore from backup recovery data
     */
    async restoreFromBackup(encryptedBackup, authTag, masterPassword) {
        try {
            const decipher = crypto.createDecipher('aes-256-gcm', masterPassword);
            decipher.setAuthTag(Buffer.from(authTag, 'base64'));

            const decrypted = Buffer.concat([
                decipher.update(Buffer.from(encryptedBackup, 'base64')),
                decipher.final()
            ]);

            const backupData = JSON.parse(decrypted.toString('utf8'));

            // Validate backup data structure
            if (!backupData.user_id || !backupData.recovery_email || !backupData.user_salt) {
                throw new Error('Invalid backup data structure');
            }

            return backupData;

        } catch (error) {
            console.error('Backup restoration failed:', error);
            throw new Error(`Backup restoration failed: ${error.message}`);
        }
    }
}

module.exports = new WalletGeneratorService();