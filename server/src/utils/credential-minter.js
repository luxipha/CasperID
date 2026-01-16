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

    // Call Casper contract to set verification (for L1: mints Master DID)
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
        // This is an upgrade - update existing credential
        console.log(`[DEBUG] Upgrading existing credential for wallet: ${request.wallet}, from ${existingCredential.tier} to ${request.tier}`);

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

        console.log(`[DEBUG] Successfully upgraded credential for wallet: ${request.wallet}`);
    } else {
        // This is a new credential - create new record
        console.log(`[DEBUG] Creating new credential for wallet: ${request.wallet}, tier: ${request.tier}`);

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
        console.log(`[DEBUG] Successfully created new credential for wallet: ${request.wallet}`);
    }

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

            // Format address properly - store as string (as submitted from KYC)
            ...(request.home_address ? {
                address: typeof request.home_address === 'string'
                    ? request.home_address
                    : (request.home_address.street || '') +
                    (request.home_address.city ? ', ' + request.home_address.city : '') +
                    (request.home_address.country ? ', ' + request.home_address.country : '')
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
    console.log(`[DEBUG] canAutoMint - wallet: ${wallet}, tier: ${tier}`);

    // Only basic tier can be auto-minted
    if (tier !== 'layer_1') {
        console.log(`[DEBUG] canAutoMint - tier is not basic: ${tier}`);
        return false;
    }

    // Check if wallet already has a credential
    const existingCredential = await Credential.findOne({
        wallet,
        revoked: false
    });

    if (existingCredential) {
        console.log(`[DEBUG] canAutoMint - wallet already has credential: ${existingCredential._id}`);
        return false;
    }

    // Check if there's already a pending request
    const existingRequest = await VerificationRequest.findOne({
        wallet,
        status: 'pending'
    });

    if (existingRequest) {
        console.log(`[DEBUG] canAutoMint - wallet already has pending request: ${existingRequest._id}`);
        return false;
    }

    console.log(`[DEBUG] canAutoMint - returning true, can auto-mint`);
    return true;
}

module.exports = {
    mintCredential,
    canAutoMint
};