/**
 * Credential minting utility
 * Shared logic for creating and issuing credentials
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Credential, UserProfile, VerificationRequest, UserAccount } = require('../database/models');
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
        last_liveness_at: (request.tier === 'layer_3' || request.tier === 'layer_3') ? now : null,
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

    // Check if DID is already being minted (database-level race condition guard)
    const existingAccount = await UserAccount.findOne({ wallet: request.wallet });
    let tx_hash = null;

    if (existingAccount?.did_minted) {
        console.log(`[Credential-Minter] DID already minted for ${request.wallet.slice(0, 20)}... (skipping chain call)`);
        tx_hash = existingAccount.onchain_did_tx || 'already_minted';
    } else {
        // Set did_minted flag IMMEDIATELY to prevent race conditions
        await UserAccount.updateOne(
            { wallet: request.wallet },
            { $set: { did_minted: true } }
        );

        // Call Casper contract to set verification (for L1: mints Master DID)
        tx_hash = await casperService.setVerification(
            request.wallet,
            request.tier,
            now,
            now,
            process.env.ISSUER_ID || 'CasperID-Demo',
            credential_hash,
            true
        );

        // Update with actual transaction hash
        await UserAccount.updateOne(
            { wallet: request.wallet },
            { $set: { onchain_did_tx: tx_hash } }
        );
    }

    // Generate human-friendly ID
    const { humanId } = walletToHuman(request.wallet);

    // For new L1 users, mint their free humanId.cid name on-chain
    let nameTxHash = null;
    const existingCredential = await Credential.findOne({
        wallet: request.wallet,
        revoked: false
    });

    if (!existingCredential && request.tier === 'layer_1') {
        try {
            // Construct free .cid name and bound DID
            const cidName = `${humanId}.cid`;
            const boundDid = `did:casper:${request.wallet}`;

            // Mint free name on-chain (isPremium = false)
            nameTxHash = await casperService.mintCidName(
                request.wallet,
                cidName,
                boundDid,
                false, // Free tier name
                0      // No expiry
            );
            console.log(`[Credential-Minter] ✅ Minted free name ${cidName}. Tx: ${nameTxHash}`);

            // Update UserAccount with the auto-assigned name
            await require('../database/models').UserAccount.findOneAndUpdate(
                { wallet: request.wallet },
                {
                    cns_name: cidName,
                    onchain_name_tx: nameTxHash
                }
            );
        } catch (nameError) {
            console.error('[Credential-Minter] ⚠️ Free name minting failed:', nameError.message);
            // Continue - name minting failure shouldn't block credential issuance
        }
    }

    let credential;
    if (existingCredential) {
        // This is an upgrade or re-verification - update existing credential
        credential = await Credential.findOneAndUpdate(
            { wallet: request.wallet, revoked: false },
            {
                tier: request.tier,
                last_kyc_at: now,
                last_liveness_at: (request.tier === 'layer_3' || request.tier === 'layer_3') ? now : null,
                credential_json,
                credential_hash,
                onchain_tx_hash: tx_hash,
                updated_at: new Date(),
                // Copy metadata
                ip: request.ip,
                userAgent: request.userAgent,
                location: request.location,
                coordinates: request.coordinates
            },
            { new: true }
        );
    } else {
        // This is a new credential - create new record
        credential = new Credential({
            wallet: request.wallet,
            human_id: humanId,
            tier: request.tier,
            last_kyc_at: now,
            last_liveness_at: (request.tier === 'layer_3' || request.tier === 'layer_3') ? now : null,
            issuer_id: process.env.ISSUER_ID || 'CasperID-Demo',
            credential_json,
            credential_hash,
            onchain_tx_hash: tx_hash,
            // Copy metadata
            ip: request.ip,
            userAgent: request.userAgent,
            location: request.location,
            coordinates: request.coordinates
        });

        await credential.save();
    }

    // Update request status (only if request is a Mongoose document)
    if (typeof request.save === 'function') {
        request.status = 'approved';
        await request.save();
    }

    // ========================================
    // SYNC VERIFIED DATA TO USER PROFILE
    // ========================================
    try {
        console.log(`Syncing verified data to user profile for wallet: ${request.wallet}`);

        // Prepare verified data from the verification request
        // Only include fields that have actual values to avoid overwriting existing data with null/undefined
        const verifiedProfileData = {
            // Set verification status (always set these)
            verification_status: 'verified',
            verification_tier: request.tier,
            verified_at: new Date()
        };

        // Only add fields that have actual values
        if (request.first_name) verifiedProfileData.first_name = request.first_name;
        if (request.last_name) verifiedProfileData.last_name = request.last_name;
        if (request.email) verifiedProfileData.email = request.email;
        if (request.phone_number) verifiedProfileData.phone_number = request.phone_number;
        if (request.date_of_birth) {
            verifiedProfileData.date_of_birth = request.date_of_birth;
            verifiedProfileData.date_of_birth_verified = true;
            verifiedProfileData.date_of_birth_source = request.document_type ? 'kyc_document' : 'verification_request';
            verifiedProfileData.date_of_birth_verified_at = new Date();
        }

        // Format address properly - store as string (as submitted from KYC)
        if (request.home_address) {
            verifiedProfileData.address = typeof request.home_address === 'string'
                ? request.home_address
                : (request.home_address.street || '') +
                (request.home_address.city ? ', ' + request.home_address.city : '') +
                (request.home_address.country ? ', ' + request.home_address.country : '');
        }

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


    // Sync tier to UserAccount using the centralized utility
    // This ensures tier is always consistent with credential tier
    try {
        const { syncTierToUserAccount } = require('./tier-sync');
        const syncResult = await syncTierToUserAccount(request.wallet);

        if (syncResult.success) {
            console.log(`[CREDENTIAL-MINTER] ✅ Synced tier for ${request.wallet}: ${syncResult.tier}`);
        } else {
            console.warn(`[CREDENTIAL-MINTER] Failed to sync tier for ${request.wallet}`);
        }
    } catch (syncError) {
        console.error('[CREDENTIAL-MINTER] Error syncing tier:', syncError);
        // Don't fail the credential creation if sync fails
    }

    // ========================================
    // SYNC DID ADDRESS TO USER ACCOUNT
    // This prevents duplicate mint_master_did calls
    // ========================================
    if (!existingCredential) {
        try {
            const realDID = `did:casper:${request.wallet}`;
            await UserAccount.findOneAndUpdate(
                { wallet: request.wallet },
                {
                    did_address: realDID,
                    did_tx_hash: tx_hash
                }
            );
            console.log(`[CREDENTIAL-MINTER] ✅ Synced did_address for ${request.wallet}: ${realDID}`);
        } catch (didSyncError) {
            console.error('[CREDENTIAL-MINTER] Error syncing did_address:', didSyncError);
            // Don't fail - the DID is already on-chain
        }
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
    if (tier !== 'layer_1') {
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
