/**
 * Private Claims Service
 *
 * Generates and verifies selectively disclosed, CasperID-signed claims.
 * Users can prove claims (e.g., "over 21", "layer 3 verified")
 * without revealing actual data.
 *
 * Claims can be:
 * - VERIFIED: Backed by KYC document or system verification
 * - UNVERIFIED: Self-declared by user (not verified)
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { UserAccount, UserProfile, Credential } = require('../database/models');
const { buildAgeClaims } = require('../utils/age-claims');

// Available claim types
const CLAIM_TYPES = {
    over_18: {
        id: 'over_18',
        label: 'Over 18',
        description: 'User is 18 years or older',
        icon: '🎂',
        requiredField: 'date_of_birth',
        verificationSource: 'layer_3'
    },
    over_21: {
        id: 'over_21',
        label: 'Over 21',
        description: 'User is 21 years or older',
        icon: '🍺',
        requiredField: 'date_of_birth',
        verificationSource: 'layer_3'
    },
    tier_2: {
        id: 'tier_2',
        label: 'Layer 2 Verified',
        description: 'Completed liveness verification',
        icon: '👤',
        requiredField: null,
        verificationSource: 'layer_2'
    },
    tier_3: {
        id: 'tier_3',
        label: 'Layer 3 Verified',
        description: 'Completed full KYC verification',
        icon: '🛡️',
        requiredField: null,
        verificationSource: 'layer_3'
    },
    verified_identity: {
        id: 'verified_identity',
        label: 'Verified Identity',
        description: 'Name verified via KYC document',
        icon: '✓',
        requiredField: 'first_name',
        verificationSource: 'layer_3'
    },
    country: {
        id: 'country',
        label: 'Country of Residence',
        description: 'Lives in specified country',
        icon: '🌍',
        requiredField: 'country',
        verificationSource: null // Can be self-declared
    }
};

class ZKClaimsService {
    /**
     * Get available claims for a user with their verification status
     */
    async getAvailableClaims(sessionToken) {
        const sessionData = await this.validateUserSession(sessionToken);
        if (!sessionData) {
            throw new Error('Invalid or expired session');
        }

        const { userAccount } = sessionData;
        const profile = await UserProfile.findOne({ wallet: userAccount.wallet });

        const claims = [];

        for (const [claimId, claimDef] of Object.entries(CLAIM_TYPES)) {
            const claimInfo = {
                id: claimId,
                label: claimDef.label,
                description: claimDef.description,
                icon: claimDef.icon,
                available: false,
                verified: false,
                verificationSource: null,
                value: null // For display purposes only (e.g., country name)
            };

            // Check if claim is available and verified
            if (claimId === 'over_18' || claimId === 'over_21') {
                const ageClaims = buildAgeClaims(profile);
                const thresholdSatisfied = claimId === 'over_18' ? ageClaims.over18 : ageClaims.over21;
                claimInfo.available = !!thresholdSatisfied;
                claimInfo.verified = !!thresholdSatisfied && ageClaims.dateOfBirthVerified;
                claimInfo.verificationSource = claimInfo.verified ? 'KYC Document' : null;
            } else if (claimId === 'tier_2') {
                claimInfo.available = ['layer_2', 'layer_3'].includes(userAccount.tier);
                claimInfo.verified = claimInfo.available;
                claimInfo.verificationSource = claimInfo.verified ? 'Liveness Check' : null;
            } else if (claimId === 'tier_3') {
                claimInfo.available = userAccount.tier === 'layer_3';
                claimInfo.verified = claimInfo.available;
                claimInfo.verificationSource = claimInfo.verified ? 'Full KYC' : null;
            } else if (claimId === 'verified_identity') {
                claimInfo.available = !!profile?.first_name;
                claimInfo.verified = userAccount.tier === 'layer_3' && !!profile?.first_name;
                claimInfo.verificationSource = claimInfo.verified ? 'KYC Document' : 'Self-declared';
            } else if (claimId === 'country') {
                claimInfo.available = !!profile?.country;
                // Country is verified if it came from KYC document (Layer 3)
                claimInfo.verified = userAccount.tier === 'layer_3' && !!profile?.country;
                claimInfo.verificationSource = claimInfo.verified ? 'KYC Document' : (profile?.country ? 'Self-declared' : null);
                claimInfo.value = profile?.country || null;
            }

            claims.push(claimInfo);
        }

        return claims;
    }

    /**
     * Generate a signed private-claim package.
     */
    async generateClaimProof(sessionToken, selectedClaims) {
        const sessionData = await this.validateUserSession(sessionToken);
        if (!sessionData) {
            throw new Error('Invalid or expired session');
        }

        const { userAccount } = sessionData;
        const profile = await UserProfile.findOne({ wallet: userAccount.wallet });

        if (!selectedClaims || selectedClaims.length === 0) {
            throw new Error('At least one claim must be selected');
        }

        // Validate and process each selected claim
        const claimResults = {};
        const claimDetails = [];

        for (const claimId of selectedClaims) {
            const claimDef = CLAIM_TYPES[claimId];
            if (!claimDef) {
                throw new Error(`Unknown claim type: ${claimId}`);
            }

            const result = await this.evaluateClaim(claimId, userAccount, profile);
            claimResults[claimId] = result;
            claimDetails.push({
                id: claimId,
                label: claimDef.label,
                icon: claimDef.icon,
                ...result
            });
        }

        // Generate proof ID and timestamp
        const proofId = uuidv4();
        const timestamp = Date.now();
        const expiresAt = timestamp + (60 * 60 * 1000); // 1 hour validity

        // Create proof payload
        const proofPayload = {
            proof_id: proofId,
            version: '1.0.0',
            type: 'CASPERID_PRIVATE_CLAIMS',
            claims: selectedClaims,
            results: claimResults,
            issuer: {
                id: 'CasperID'
            },
            timestamp,
            expires_at: expiresAt
        };

        // Sign the proof
        const proofHash = crypto.createHash('sha256')
            .update(JSON.stringify(proofPayload))
            .digest('hex');

        const signature = jwt.sign(
            { ...proofPayload, proof_hash: proofHash },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return {
            proof_id: proofId,
            claims: claimDetails,
            proof: signature,
            proof_hash: proofHash,
            timestamp,
            expires_at: expiresAt,
            qr_data: JSON.stringify({
                type: 'casperid_private_claims',
                proof_id: proofId,
                proof: signature
            }),
            // Used only while persisting the share. Routes must not return it.
            _storageOwner: {
                user_id: userAccount.user_id,
                wallet: userAccount.wallet,
                human_id: profile?.human_id || null
            }
        };
    }

    /**
     * Verify a signed private-claim package.
     */
    async verifyClaimProof(proofPackage) {
        try {
            let proofData;

            // Handle QR data format or direct proof
            if (typeof proofPackage === 'string') {
                try {
                    const parsed = JSON.parse(proofPackage);
                    proofData = parsed.proof || proofPackage;
                } catch {
                    proofData = proofPackage;
                }
            } else if (proofPackage.proof) {
                proofData = proofPackage.proof;
            } else {
                throw new Error('Invalid proof format');
            }

            // Verify JWT signature
            const decoded = jwt.verify(proofData, process.env.JWT_SECRET);

            // Check expiration
            if (decoded.expires_at && Date.now() > decoded.expires_at) {
                return {
                    valid: false,
                    error: 'Proof has expired',
                    expired: true
                };
            }

            // Verify proof hash
            const expectedPayload = { ...decoded };
            delete expectedPayload.proof_hash;
            delete expectedPayload.iat;
            delete expectedPayload.exp;

            const computedHash = crypto.createHash('sha256')
                .update(JSON.stringify(expectedPayload))
                .digest('hex');

            if (computedHash !== decoded.proof_hash) {
                return {
                    valid: false,
                    error: 'Proof hash mismatch - data may have been tampered'
                };
            }

            // Build claim details for display
            const claimDetails = decoded.claims.map(claimId => {
                const claimDef = CLAIM_TYPES[claimId];
                const result = decoded.results[claimId];
                return {
                    id: claimId,
                    label: claimDef?.label || claimId,
                    icon: claimDef?.icon || '?',
                    valid: result.valid,
                    verified: result.verified,
                    verificationSource: result.verificationSource,
                    value: result.value || null
                };
            });

            return {
                valid: true,
                proof_id: decoded.proof_id,
                claims: claimDetails,
                issuer: decoded.issuer,
                timestamp: decoded.timestamp,
                expires_at: decoded.expires_at,
                verified_at: Date.now()
            };

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return {
                    valid: false,
                    error: 'Proof has expired',
                    expired: true
                };
            }
            if (error.name === 'JsonWebTokenError') {
                return {
                    valid: false,
                    error: 'Invalid proof signature'
                };
            }
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Evaluate a single claim
     */
    async evaluateClaim(claimId, userAccount, profile) {
        const result = {
            valid: false,
            verified: false,
            verificationSource: null,
            value: null
        };

        switch (claimId) {
            case 'over_18':
            case 'over_21': {
                const ageClaims = buildAgeClaims(profile);
                const thresholdSatisfied = claimId === 'over_18' ? ageClaims.over18 : ageClaims.over21;
                result.valid = !!thresholdSatisfied;
                result.verified = !!thresholdSatisfied && ageClaims.dateOfBirthVerified;
                result.verificationSource = result.verified ? 'KYC Document' : null;
                break;
            }

            case 'tier_2': {
                result.valid = ['layer_2', 'layer_3'].includes(userAccount.tier);
                result.verified = result.valid;
                result.verificationSource = result.valid ? 'Liveness Check' : null;
                break;
            }

            case 'tier_3': {
                result.valid = userAccount.tier === 'layer_3';
                result.verified = result.valid;
                result.verificationSource = result.valid ? 'Full KYC' : null;
                break;
            }

            case 'verified_identity': {
                result.valid = !!profile?.first_name;
                result.verified = userAccount.tier === 'layer_3' && !!profile?.first_name;
                result.verificationSource = result.verified ? 'KYC Document' : 'Self-declared';
                break;
            }

            case 'country': {
                result.valid = !!profile?.country;
                result.verified = userAccount.tier === 'layer_3' && !!profile?.country;
                result.verificationSource = result.verified ? 'KYC Document' : (profile?.country ? 'Self-declared' : null);
                result.value = profile?.country || null;
                break;
            }

            default:
                throw new Error(`Unknown claim type: ${claimId}`);
        }

        return result;
    }

    /**
     * Validate user session
     */
    async validateUserSession(sessionToken) {
        try {
            const webauthnService = require('./webauthn');
            return await webauthnService.validateSession(sessionToken);
        } catch (error) {
            return null;
        }
    }
}

module.exports = new ZKClaimsService();
