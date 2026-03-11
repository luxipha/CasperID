/**
 * CasperID Name Service (CNS) Resolver
 * Resolves .cid names to DIDs and profiles
 * 
 * Resolution Priority:
 * 1. Premium .cid names (on-chain NFT)
 * 2. Free Markov names (database)
 * 3. Raw wallet address (fallback)
 */

const {
    UserAccount,
    UserProfile,
    Credential,
    Experience,
    Education,
    Certification,
    Skill
} = require('../database/models');
const { walletToHuman } = require('../utils/wallet-to-human');
const casperService = require('./casper');

/**
 * Name resolution result structure
 */
class ResolvedName {
    constructor({
        name,
        did,
        wallet,
        tier,
        isPremium,
        contextType,
        profileData,
        verified
    }) {
        this.name = name;
        this.did = did;
        this.wallet = wallet;
        this.tier = tier || 'layer_0';
        this.isPremium = isPremium || false;
        this.contextType = contextType || 'master';
        this.profileData = profileData || null;
        this.verified = verified || false;
        this.resolvedAt = new Date().toISOString();
    }
}

/**
 * Parse a .cid name into components
 * Examples:
 * - "alice.cid" -> { root: "alice", subdomain: null, extension: "cid" }
 * - "work.alice.cid" -> { root: "alice", subdomain: "work", extension: "cid" }
 * - "gaming.balana-mona.cid" -> { root: "balana-mona", subdomain: "gaming", extension: "cid" }
 */
function parseCidName(name) {
    if (!name || typeof name !== 'string') {
        return null;
    }

    // Remove trailing .cid if present
    const cleanName = name.toLowerCase().trim();

    // Check if it ends with .cid
    if (!cleanName.endsWith('.cid')) {
        // Check if it's a raw name without extension
        if (cleanName.includes('.')) {
            return null; // Invalid format
        }
        // Treat as root name without extension
        return {
            root: cleanName,
            subdomain: null,
            extension: 'cid',
            fullName: `${cleanName}.cid`
        };
    }

    // Remove .cid extension
    const withoutExtension = cleanName.slice(0, -4);
    const parts = withoutExtension.split('.');

    if (parts.length === 1) {
        // Root name only: "alice.cid"
        return {
            root: parts[0],
            subdomain: null,
            extension: 'cid',
            fullName: cleanName
        };
    } else if (parts.length === 2) {
        // Subdomain: "work.alice.cid"
        return {
            root: parts[1],
            subdomain: parts[0],
            extension: 'cid',
            fullName: cleanName
        };
    } else {
        // Invalid format (too many parts)
        return null;
    }
}

/**
 * Check if a name looks like a Markov-generated ID
 * Markov IDs are lowercase, hyphenated words (e.g., "balana-mona")
 */
function isMarkovName(name) {
    if (!name) return false;
    // Markov names are lowercase with hyphens, no special chars
    return /^[a-z]+(-[a-z]+)+$/.test(name);
}

/**
 * Resolve a .cid name to its identity data
 * @param {string} nameOrIdentifier - The .cid name, Markov ID, or wallet address
 * @returns {Promise<ResolvedName|null>}
 */
async function resolve(nameOrIdentifier) {
    if (!nameOrIdentifier) {
        return null;
    }

    const identifier = nameOrIdentifier.toLowerCase().trim();

    // 1. Try to parse as .cid name
    const parsed = parseCidName(identifier);

    if (parsed) {
        // Resolve .cid name
        return await resolveCidName(parsed);
    }

    // 2. Check if it's a Markov ID (free name)
    if (isMarkovName(identifier)) {
        return await resolveMarkovName(identifier);
    }

    // 3. Check if it's a wallet address
    if (identifier.length >= 64 || identifier.startsWith('account-hash-')) {
        return await resolveWallet(identifier);
    }

    // 4. Try as a raw root name
    return await resolveRootName(identifier);
}

/**
 * Resolve a parsed .cid name
 */
async function resolveCidName(parsed) {
    const { root, subdomain, fullName } = parsed;

    // First, try to find the root name owner
    const rootOwner = await findNameOwner(root);

    if (!rootOwner) {
        return null;
    }

    // 1. Check for Explicit User Routing Preferences (The "Switchboard")
    const explicitRoute = rootOwner.cns_routing?.find(r => r.name === fullName && r.active);

    if (explicitRoute) {
        switch (explicitRoute.target_type) {
            case 'wallet_only':
                return new ResolvedName({
                    name: fullName,
                    did: rootOwner.did_address,
                    wallet: rootOwner.wallet,
                    tier: rootOwner.tier,
                    isPremium: !isMarkovName(root),
                    contextType: 'wallet_only',
                    profileData: {
                        wallet: rootOwner.wallet,
                        human_id: rootOwner.cns_name || root,
                        is_wallet_only: true
                    },
                    verified: rootOwner.tier !== 'layer_0'
                });

            case 'context_did':
                const contextDid = rootOwner.context_dids?.find(c =>
                    c.context === explicitRoute.target_id || c.did === explicitRoute.target_id
                );
                if (contextDid) {
                    return new ResolvedName({
                        name: fullName,
                        did: contextDid.did,
                        wallet: rootOwner.wallet,
                        tier: rootOwner.tier,
                        isPremium: !isMarkovName(root),
                        contextType: contextDid.context,
                        profileData: await getContextProfileData(rootOwner.wallet, contextDid.context),
                        verified: true
                    });
                }
                break;

            case 'master_profile':
                // Continue to default logic
                break;

            case 'redirect':
                return {
                    name: fullName,
                    redirect: explicitRoute.redirect_url
                };
        }
    }

    // 2. Default Logic (Fallback or Master)
    // If no subdomain, return root owner
    if (!subdomain) {
        return new ResolvedName({
            name: fullName,
            did: rootOwner.did_address,
            wallet: rootOwner.wallet,
            tier: rootOwner.tier,
            isPremium: !isMarkovName(root),
            contextType: 'master',
            profileData: await getProfileData(rootOwner.wallet),
            verified: rootOwner.tier !== 'layer_0'
        });
    }

    // Resolve subdomain (implicit context mapping)
    const contextDid = rootOwner.context_dids?.find(c =>
        c.context === subdomain || c.did.includes(subdomain)
    );

    if (contextDid) {
        return new ResolvedName({
            name: fullName,
            did: contextDid.did,
            wallet: rootOwner.wallet,
            tier: rootOwner.tier,
            isPremium: !isMarkovName(root),
            contextType: subdomain,
            profileData: await getContextProfileData(rootOwner.wallet, subdomain),
            verified: true
        });
    }

    // Subdomain not found, but root exists
    return null;
}

/**
 * Resolve a Markov-generated name
 */
async function resolveMarkovName(markovId) {
    // Find user by human_id in profile or credential
    const profile = await UserProfile.findOne({ human_id: markovId });

    if (profile) {
        const userAccount = await UserAccount.findOne({ wallet: profile.wallet });

        // Check if user has a premium cns_name - if so, use that instead
        const displayName = userAccount?.cns_name || markovId;
        const isPremium = !!userAccount?.cns_name;

        return new ResolvedName({
            name: `${displayName}.cid`,
            did: userAccount?.did_address,
            wallet: profile.wallet,
            tier: userAccount?.tier || 'layer_0',
            isPremium: isPremium,
            contextType: 'master',
            profileData: profile,
            verified: userAccount?.tier && userAccount.tier !== 'layer_0'
        });
    }

    // Try credential table
    const credential = await Credential.findOne({ human_id: markovId, revoked: false });
    if (credential) {
        const userAccount = await UserAccount.findOne({ wallet: credential.wallet });

        // Check if user has a premium cns_name - if so, use that instead
        const displayName = userAccount?.cns_name || markovId;
        const isPremium = !!userAccount?.cns_name;

        return new ResolvedName({
            name: `${displayName}.cid`,
            did: userAccount?.did_address,
            wallet: credential.wallet,
            tier: credential.tier,
            isPremium: isPremium,
            contextType: 'master',
            profileData: await getProfileData(credential.wallet),
            verified: true
        });
    }

    return null;
}

/**
 * Resolve a wallet address directly
 */
async function resolveWallet(wallet) {
    const userAccount = await UserAccount.findOne({ wallet });

    if (!userAccount) {
        return null;
    }

    // Generate or get the Markov name for this wallet
    const { humanId } = walletToHuman(wallet);

    return new ResolvedName({
        name: `${humanId}.cid`,
        did: userAccount.did_address,
        wallet: wallet,
        tier: userAccount.tier,
        isPremium: false,
        contextType: 'master',
        profileData: await getProfileData(wallet),
        verified: userAccount.tier && userAccount.tier !== 'layer_0'
    });
}

/**
 * Resolve a root name (without .cid extension)
 */
async function resolveRootName(rootName) {
    const owner = await findNameOwner(rootName);

    if (!owner) {
        return null;
    }

    return new ResolvedName({
        name: `${rootName}.cid`,
        did: owner.did_address,
        wallet: owner.wallet,
        tier: owner.tier,
        isPremium: !isMarkovName(rootName),
        contextType: 'master',
        profileData: await getProfileData(owner.wallet),
        verified: owner.tier && owner.tier !== 'layer_0'
    });
}

/**
 * Find the owner of a root name
 */
async function findNameOwner(rootName) {
    // First check if it's a premium name (stored in cns_name field)
    const premiumAccount = await UserAccount.findOne({ cns_name: rootName });
    if (premiumAccount) return premiumAccount;

    // Always fall back to human_id lookup — works for any format (single-word or hyphenated)
    const profile = await UserProfile.findOne({ human_id: rootName });
    if (profile) {
        return await UserAccount.findOne({ wallet: profile.wallet });
    }

    const credential = await Credential.findOne({ human_id: rootName, revoked: false });
    if (credential) {
        return await UserAccount.findOne({ wallet: credential.wallet });
    }

    return null;
}

/**
 * Get profile data for a wallet
 */
async function getProfileData(wallet) {
    return await UserProfile.findOne({ wallet });
}

/**
 * Get context-specific profile data
 */
async function getContextProfileData(wallet, contextType) {
    const [profile, userAccount] = await Promise.all([
        UserProfile.findOne({ wallet }),
        UserAccount.findOne({ wallet })
    ]);

    if (!profile) {
        return null;
    }

    // Selective Disclosure (The "Professional" vs "Gaming" split)
    const baseProfile = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        profile_image_url: profile.profile_image_url,
        headline: profile.headline,
        city: profile.city,
        country: profile.country,
        tier: userAccount?.tier || 'layer_1'
    };

    if (contextType === 'professional' || contextType === 'work') {
        const [experiences, education, certifications] = await Promise.all([
            Experience.find({ wallet }).sort({ 'start_date.year': -1 }),
            Education.find({ wallet }).sort({ 'start_date.year': -1 }),
            Certification.find({ wallet }).sort({ 'issue_date.year': -1 })
        ]);

        return {
            ...baseProfile,
            context: 'Professional',
            experiences,
            education,
            certifications,
            socials: {
                linkedin: profile.socials?.linkedin,
                github: profile.socials?.github,
                website: profile.website
            }
        };
    }

    if (contextType === 'gaming' || contextType === 'social') {
        const skills = await Skill.find({ wallet, is_top_skill: true });
        return {
            ...baseProfile,
            context: 'Social/Gaming',
            skills,
            socials: {
                twitter: profile.socials?.twitter,
                instagram: profile.socials?.instagram,
                tiktok: profile.socials?.tiktok
            }
        };
    }

    // Fallback: limited public view
    return baseProfile;
}

/**
 * Check if a name is available for registration
 */
async function isNameAvailable(name) {
    const parsed = parseCidName(name);
    if (!parsed) {
        return { available: false, reason: 'Invalid name format' };
    }

    const owner = await findNameOwner(parsed.root);

    if (owner) {
        return { available: false, reason: 'Name already taken' };
    }

    // Check if it's a reserved name
    const reservedNames = ['admin', 'casperid', 'support', 'help', 'api', 'www'];
    if (reservedNames.includes(parsed.root)) {
        return { available: false, reason: 'Name is reserved' };
    }

    return { available: true };
}

/**
 * Register a premium .cid name for a user
 */
async function registerPremiumName(wallet, name) {
    const parsed = parseCidName(name);
    if (!parsed || parsed.subdomain) {
        throw new Error('Invalid name format. Only root names can be registered.');
    }

    const availability = await isNameAvailable(name);
    if (!availability.available) {
        throw new Error(availability.reason);
    }

    const userAccount = await UserAccount.findOne({ wallet });
    if (!userAccount) {
        throw new Error('User account not found');
    }

    // 1. Mint Name as NFT On-Chain
    let onchainTxHash = null;
    try {
        onchainTxHash = await casperService.mintCidName(
            wallet,
            parsed.fullName,
            userAccount.did_address || 'did:casper:placeholder',
            true, // isPremium
            0     // expiresAt (permanent for now)
        );
        console.log(`[CNS] Minted ${parsed.fullName} on-chain: ${onchainTxHash}`);
    } catch (error) {
        console.error(`[CNS] On-chain minting failed for ${parsed.fullName}:`, error.message);
        // We continue with DB update even if on-chain fails (lazy synchronization)
        // In production, we'd handle this as a retryable task
    }

    // 2. Update user account with premium name in DB
    await UserAccount.updateOne(
        { wallet },
        {
            $set: {
                cns_name: parsed.root,
                onchain_name_tx: onchainTxHash
            }
        }
    );

    // 3. Sync premium name to UserProfile and Credential for consistency
    // This ensures the new name appears everywhere in the system
    const newHumanId = parsed.root; // Premium name becomes the new human_id

    await UserProfile.updateOne(
        { wallet },
        {
            $set: {
                human_id: newHumanId,
                cns_name: parsed.root
            }
        }
    );

    await Credential.updateMany(
        { wallet, revoked: false },
        {
            $set: {
                human_id: newHumanId
            }
        }
    );

    console.log(`[CNS] Synced premium name "${parsed.root}" to UserProfile and Credential for wallet ${wallet}`);

    return {
        success: true,
        name: parsed.fullName,
        txHash: onchainTxHash
    };
}

module.exports = {
    resolve,
    parseCidName,
    isMarkovName,
    isNameAvailable,
    registerPremiumName,
    ResolvedName
};
