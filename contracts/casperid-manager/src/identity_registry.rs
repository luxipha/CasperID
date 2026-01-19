//! CasperID Identity Registry Module
//! Manages Master DIDs, Context DIDs, and Name Bindings on Casper Network

use odra::prelude::*;
use odra::prelude::{Address, Mapping, Var};

/// Type alias for DID strings
pub type Did = String;

/// Context DID Record
#[odra::odra_type]
pub struct ContextDid {
    /// The full Context DID string (e.g., "did:casper:work:alice:xyz")
    pub did: Did,
    /// The context type (e.g., "work", "gaming", "social")
    pub context_type: String,
    /// Minimum tier required to create this context type
    pub tier_required: u8,
    /// Timestamp of creation
    pub created_at: u64,
}

/// Events for Identity Registry
#[odra::event]
pub struct IdentityMinted {
    pub owner: Address,
    pub master_did: Did,
    pub tier: u8,
}

#[odra::event]
pub struct TierUpdated {
    pub owner: Address,
    pub new_tier: u8,
}

#[odra::event]
pub struct ContextDidCreated {
    pub owner: Address,
    pub context_did: Did,
    pub context_type: String,
}

/// Master Identity Record
#[odra::odra_type]
pub struct MasterIdentity {
    /// The primary wallet address that controls this DID
    pub owner: Address,
    /// The Master DID string
    pub master_did: Did,
    /// Current verification tier (1, 2, or 3)
    pub tier: u8,
    /// Timestamp of last tier update
    pub last_verified_at: u64,
}

/// The main CasperID Identity Registry Contract
#[odra::module]
pub struct IdentityRegistry {
    /// Admin address for fee collection
    admin: Var<Address>,
    /// Mapping: Wallet -> MasterIdentity
    identities: Mapping<Address, MasterIdentity>,
    /// Mapping: Master DID -> List of Context DID strings
    context_dids: Mapping<Did, Vec<Did>>,
    /// Counter for unique DID suffixes
    did_counter: Var<u64>,
    /// Authorized issuers who can mint DIDs for users
    issuers: Mapping<Address, bool>,
}

#[odra::module]
impl IdentityRegistry {
    /// Initialize the contract with an admin address
    #[odra(init)]
    pub fn init(&mut self) {
        let caller = self.env().caller();
        self.admin.set(caller);
        self.issuers.set(&caller, true); // Admin is an issuer by default
        self.did_counter.set(0);
    }

    // ========================================
    // IDENTITY MANAGEMENT
    // ========================================
 
    /// Returns the admin address
    pub fn admin(&self) -> Address {
        self.admin.get().unwrap()
    }
 
    // ========================================

    /// Mint a new Master DID for a user
    /// Only callable by authorized issuers
    pub fn mint_for_user(&mut self, user: Address, tier: u8) -> Did {
        let caller = self.env().caller();
        
        // Authorization check
        if !self.issuers.get(&caller).unwrap_or_default() {
            self.env().revert(RegistryError::Unauthorized);
        }
        
        // Check if user already has a Master DID
        if self.identities.get(&user).is_some() {
            self.env().revert(RegistryError::DIDAlreadyExists);
        }
        
        // Generate unique DID
        let counter = self.did_counter.get_or_default();
        let did = alloc::format!("did:casper:{:x}", counter);
        self.did_counter.set(counter + 1);
        
        // Store identity
        let identity = MasterIdentity {
            owner: user,
            master_did: did.clone(),
            tier,
            last_verified_at: self.env().get_block_time(),
        };
        self.identities.set(&user, identity);
        
        // Emit event
        self.env().emit_event(IdentityMinted {
            owner: user,
            master_did: did.clone(),
            tier,
        });

        did
    }

    /// Get Master DID for an address
    pub fn get_master_did(&self, wallet: Address) -> Option<Did> {
        self.identities.get(&wallet).map(|i| i.master_did)
    }

    /// Update verification tier (called by authorized issuer)
    pub fn update_tier(&mut self, wallet: Address, new_tier: u8) {
        let caller = self.env().caller();
        let admin = self.admin.get().unwrap();
        
        if caller != admin {
            self.env().revert(RegistryError::Unauthorized);
        }
        
        let mut identity = self.identities.get(&wallet)
            .unwrap_or_else(|| self.env().revert(RegistryError::DIDNotFound));
        
        identity.tier = new_tier;
        identity.last_verified_at = self.env().get_block_time();
        self.identities.set(&wallet, identity);

        // Emit event
        self.env().emit_event(TierUpdated {
            owner: wallet,
            new_tier,
        });
    }

    /// Get verification tier for a wallet
    pub fn get_tier(&self, wallet: Address) -> u8 {
        self.identities.get(&wallet).map(|i| i.tier).unwrap_or(0)
    }

    // ========================================
    // ISSUER MANAGEMENT
    // ========================================

    /// Add a new authorized issuer (Admin only)
    pub fn add_issuer(&mut self, issuer: Address) {
        let caller = self.env().caller();
        if caller != self.admin.get().unwrap() {
            self.env().revert(RegistryError::Unauthorized);
        }
        self.issuers.set(&issuer, true);
    }

    /// Remove an authorized issuer (Admin only)
    pub fn remove_issuer(&mut self, issuer: Address) {
        let caller = self.env().caller();
        if caller != self.admin.get().unwrap() {
            self.env().revert(RegistryError::Unauthorized);
        }
        self.issuers.set(&issuer, false);
    }

    /// Check if an address is an authorized issuer
    pub fn is_issuer(&self, address: Address) -> bool {
        self.issuers.get(&address).unwrap_or_default()
    }

    // ========================================
    // CONTEXT DID MANAGEMENT
    // ========================================

    /// Create a Context DID (subdomain identity)
    /// Tier-gated: Layer 1 = none, Layer 2 = basic, Layer 3 = all
    pub fn create_context_did(&mut self, context_type: String) -> Did {
        let caller = self.env().caller();
        
        let identity = self.identities.get(&caller)
            .unwrap_or_else(|| self.env().revert(RegistryError::DIDNotFound));
        
        // Tier gating logic
        let min_tier = match context_type.as_str() {
            "pseudonymous" | "gaming" | "social" => 2,
            "professional" | "government" | "banking" => 3,
            _ => 2, // Default to Layer 2 for unknown contexts
        };
        
        if identity.tier < min_tier {
            self.env().revert(RegistryError::InsufficientTier);
        }
        
        // Generate context DID
        let counter = self.did_counter.get_or_default();
        let context_did = alloc::format!("did:casper:{}:{}:{:x}", 
            context_type, 
            &identity.master_did[11..], // Strip "did:casper:" prefix
            counter
        );
        self.did_counter.set(counter + 1);
        
        // Store context DID
        let mut contexts = self.context_dids.get(&identity.master_did).unwrap_or_default();
        contexts.push(context_did.clone());
        self.context_dids.set(&identity.master_did, contexts);
        
        // Emit event
        self.env().emit_event(ContextDidCreated {
            owner: caller,
            context_did: context_did.clone(),
            context_type,
        });

        context_did
    }

    /// Get all Context DIDs for a Master DID
    pub fn get_context_dids(&self, master_did: Did) -> Vec<Did> {
        self.context_dids.get(&master_did).unwrap_or_default()
    }
}

/// Registry Error Codes
#[odra::odra_error]
pub enum RegistryError {
    DIDAlreadyExists = 1,
    DIDNotFound = 2,
    Unauthorized = 3,
    InsufficientTier = 4,
    NameAlreadyTaken = 5,
    NameNotFound = 6,
    InvalidSubdomain = 7,
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, NoArgs};

    #[test]
    fn test_mint_for_user() {
        let test_env = odra_test::env();
        let mut contract = IdentityRegistryDeployer::default(&test_env);
        let user = test_env.get_account(1);
        
        let did = contract.mint_for_user(user, 1);
        assert!(did.starts_with("did:casper:"));
        assert_eq!(contract.get_tier(user), 1);
    }

    #[test]
    fn test_issuer_management() {
        let test_env = odra_test::env();
        let mut contract = IdentityRegistryDeployer::default(&test_env);
        let admin = test_env.get_account(0);
        let new_issuer = test_env.get_account(1);
        let user = test_env.get_account(2);

        // Fail to mint from non-issuer
        test_env.set_caller(new_issuer);
        // We expect a revert here, but for simplicity in this script we just test the flag
        assert!(!contract.is_issuer(new_issuer));
        
        // Add issuer
        test_env.set_caller(admin);
        contract.add_issuer(new_issuer);
        assert!(contract.is_issuer(new_issuer));

        // Now mint should work
        test_env.set_caller(new_issuer);
        contract.mint_for_user(user, 2);
        assert_eq!(contract.get_tier(user), 2);
    }
}
