/**
 * Credential minting utility
 * Shared logic for creating and issuing credentials
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Credential, UserProfile, VerificationRequest } = require('../database/models');
const casperService = require('../services/casper');
const { walletToHuman } = require('./wallet-to-human');

/**
 * Mint a credential for a verification request
 * @param {Object} request - Verification request object
 * @returns {Promise<Object>} Minted credential and transaction info
 */
async function mintCredential(request) {
    const now = Math.floor(Date.now() / 1000); // Unix timestamp

    // Create credential JSON
    const credentialData = {
        subject_wallet: request.wallet,
        tier: request.tier,
        last_kyc_at: now,
        last_liveness_at: request.tier === 'full_kyc' ? now : null,
        issuer: process.env.ISSUER_ID || 'CasperID-Demo',
        issued_at: now,
        expires_at: 0 // No expiration for now
    };

    // Sign credential (JWT)
    const credential_json = jwt.sign(
        credentialData,
        process.env.JWT_SECRET,
        { expiresIn: '10y' }
    );

    // Compute credential hash
    const credential_hash = crypto
        .createHash('sha256')
        .update(credential_json)
        .digest('hex');

    // Call Casper contract to set verification
    const tx_hash = await casperService.setVerification(
        request.wallet,
        request.tier,
        now,
        now,
        process.env.ISSUER_ID || 'CasperID-Demo',
        credential_hash,
        true
    );

    // Generate human-friendly ID
    const { humanId } = walletToHuman(request.wallet);
    
    // Save credential to database
    const credential = new Credential({
        wallet: request.wallet,
        human_id: humanId,
        tier: request.tier,
        last_kyc_at: now,
        last_liveness_at: request.tier === 'full_kyc' ? now : null,
        issuer_id: process.env.ISSUER_ID || 'CasperID-Demo',
        credential_json,
        credential_hash,
        onchain_tx_hash: tx_hash
    });

    await credential.save();

    // Update request status
    request.status = 'approved';
    await request.save();

    // ========================================
    // SYNC VERIFIED DATA TO USER PROFILE
    // ========================================
    try {
        console.log(`Syncing verified data to user profile for wallet: ${request.wallet}`);
        
        // Prepare verified data from the verification request
        const verifiedProfileData = {
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            phone_number: request.phone_number,
            
            // Format address properly if it's an object
            ...(request.home_address && typeof request.home_address === 'object' ? {
                address: {
                    street: request.home_address.street || '',
                    city: request.home_address.city || '',
                    state: request.home_address.state || '',
                    postal_code: request.home_address.postal_code || '',
                    country: request.home_address.country || ''
                }
            } : request.home_address ? {
                address: {
                    street: request.home_address,
                    city: '',
                    state: '',
                    postal_code: '',
                    country: ''
                }
            } : {}),

            // Set verification status
            verification_status: 'verified',
            verification_tier: request.tier,
            verified_at: new Date()
        };

        // Update or create user profile with verified data
        const existingProfile = await UserProfile.findOne({ wallet: request.wallet });
        
        if (existingProfile) {
            // Update existing profile with verified data
            Object.assign(existingProfile, verifiedProfileData);
            await existingProfile.save();
            console.log(`Updated existing profile for wallet: ${request.wallet}`);
        } else {
            // Create new profile with verified data
            const newProfile = new UserProfile({
                wallet: request.wallet,
                human_id: humanId,
                ...verifiedProfileData
            });
            await newProfile.save();
            console.log(`Created new profile for wallet: ${request.wallet}`);
        }
        
    } catch (profileError) {
        console.error('Failed to sync verified data to user profile:', profileError);
        // Don't fail the whole process if profile sync fails
    }

    return {
        credential,
        tx_hash,
        credential_data: credentialData
    };
}

/**
 * Check if a wallet is eligible for automatic basic minting
 * @param {string} wallet - Wallet address
 * @param {string} tier - Verification tier
 * @returns {Promise<boolean>} Whether automatic minting is allowed
 */
async function canAutoMint(wallet, tier) {
    // Only basic tier can be auto-minted
    if (tier !== 'basic') {
        return false;
    }

    // Check if wallet already has a credential
    const existingCredential = await Credential.findOne({ 
        wallet, 
        revoked: false 
    });

    if (existingCredential) {
        return false;
    }

    // Check if there's already a pending request
    const existingRequest = await VerificationRequest.findOne({
        wallet,
        status: 'pending'
    });

    if (existingRequest) {
        return false;
    }

    return true;
}

module.exports = {
    mintCredential,
    canAutoMint
};