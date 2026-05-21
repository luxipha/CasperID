//! CEP-95 Compliant NFT Contract for CasperID .cid Names
//! Implements the Casper NFT Standard (CEP-95) for premium root names

use odra::prelude::*;
use odra::prelude::{Address, Mapping, Var, vec, Vec, String};
use odra::casper_types::U256;

/// CEP-95 Events
#[odra::event]
pub struct Mint {
    pub to: Address,
    pub token_id: U256,
}

#[odra::event]
pub struct Transfer {
    pub from: Address,
    pub to: Address,
    pub token_id: U256,
}

#[odra::event]
pub struct Burn {
    pub from: Address,
    pub token_id: U256,
}

#[odra::event]
pub struct Approval {
    pub owner: Address,
    pub spender: Address,
    pub token_id: U256,
}

#[odra::event]
pub struct ApprovalForAll {
    pub owner: Address,
    pub operator: Address,
}

#[odra::event]
pub struct MetadataUpdate {
    pub token_id: U256,
}

/// Token Metadata structure for .cid names
#[odra::odra_type]
pub struct CidNameMetadata {
    /// The .cid name (e.g., "alice.cid")
    pub name: String,
    /// Description
    pub description: String,
    /// URI to the profile/DID resolver
    pub asset_uri: String,
    /// URI to token metadata JSON
    pub token_uri: String,
    /// The bound Master DID
    pub bound_did: String,
    /// Is this a premium (paid) name?
    pub is_premium: bool,
    /// Registration timestamp
    pub registered_at: u64,
    /// Expiry timestamp (0 = never expires for Markov names)
    pub expires_at: u64,
}

/// CEP-95 Compliant NFT Contract for .cid Names
#[odra::module]
pub struct CidNameNFT {
    /// Token name
    name: Var<String>,
    /// Token symbol
    symbol: Var<String>,
    /// Admin address
    admin: Var<Address>,
    /// Total supply counter
    total_supply: Var<U256>,
    /// Token ID counter
    next_token_id: Var<U256>,
    
    /// Mapping: token_id -> owner
    owners: Mapping<U256, Address>,
    /// Mapping: owner -> balance count
    balances: Mapping<Address, U256>,
    /// Mapping: token_id -> approved spender (Address)
    token_approvals: Mapping<U256, Address>,
    /// Mapping: token_id -> has_approval (bool)
    has_approval: Mapping<U256, bool>,
    /// Mapping: owner -> operator -> approved
    operator_approvals: Mapping<(Address, Address), bool>,
    /// Mapping: token_id -> metadata
    token_metadata: Mapping<U256, CidNameMetadata>,
    /// Mapping: name string -> token_id (for lookup)
    name_to_token: Mapping<String, U256>,
}

#[odra::module]
impl CidNameNFT {
    /// Initialize the NFT contract
    #[odra(init)]
    pub fn init(&mut self, name: String, symbol: String) {
        self.name.set(name);
        self.symbol.set(symbol);
        self.admin.set(self.env().caller());
        self.total_supply.set(U256::zero());
        self.next_token_id.set(U256::one());
    }

    // ========================================
    // CEP-95 REQUIRED: View Functions
    // ========================================

    /// Returns the token collection name
    pub fn name(&self) -> String {
        self.name.get_or_default()
    }

    /// Returns the token symbol
    pub fn symbol(&self) -> String {
        self.symbol.get_or_default()
    }

    /// Returns the balance of an owner
    pub fn balance_of(&self, owner: Address) -> U256 {
        self.balances.get(&owner).unwrap_or(U256::zero())
    }

    /// Returns the owner of a token
    pub fn owner_of(&self, token_id: U256) -> Option<Address> {
        self.owners.get(&token_id)
    }

    /// Returns the approved spender for a token
    pub fn approved_for(&self, token_id: U256) -> Option<Address> {
        if self.has_approval.get(&token_id).unwrap_or(false) {
            self.token_approvals.get(&token_id)
        } else {
            None
        }
    }

    /// Checks if an operator is approved for all tokens of an owner
    pub fn is_approved_for_all(&self, owner: Address, operator: Address) -> bool {
        self.operator_approvals.get(&(owner, operator)).unwrap_or(false)
    }

    /// Returns token metadata as key-value pairs
    pub fn token_metadata(&self, token_id: U256) -> Vec<(String, String)> {
        match self.token_metadata.get(&token_id) {
            Some(meta) => vec![
                ("name".into(), meta.name),
                ("description".into(), meta.description),
                ("asset_uri".into(), meta.asset_uri),
                ("token_uri".into(), meta.token_uri),
                ("bound_did".into(), meta.bound_did),
                ("is_premium".into(), if meta.is_premium { "true".into() } else { "false".into() }),
                ("registered_at".into(), meta.registered_at.to_string()),
                ("expires_at".into(), meta.expires_at.to_string()),
            ],
            None => vec![],
        }
    }

    // ========================================
    // CEP-95 REQUIRED: Transfer Functions
    // ========================================

    /// Transfer ownership of an NFT (without receiver check)
    pub fn transfer_from(&mut self, from: Address, to: Address, token_id: U256) {
        self.do_transfer(from, to, token_id);
    }

    /// Safe transfer with receiver check
    pub fn safe_transfer_from(&mut self, from: Address, to: Address, token_id: U256, _data: Option<Vec<u8>>) {
        self.do_transfer(from, to, token_id);
        // Note: Receiver callback (on_cep95_received) would be called here
        // For contracts that implement CEP95Receiver
    }

    /// Internal transfer logic
    fn do_transfer(&mut self, from: Address, to: Address, token_id: U256) {
        let caller = self.env().caller();
        
        // Verify ownership
        let owner = self.owners.get(&token_id)
            .unwrap_or_else(|| self.env().revert(NftError::TokenNotFound));
        
        if owner != from {
            self.env().revert(NftError::NotOwner);
        }
        
        // Check authorization
        let approved_spender = if self.has_approval.get(&token_id).unwrap_or(false) {
            self.token_approvals.get(&token_id)
        } else {
            None
        };
        let is_approved = approved_spender == Some(caller);
        let is_operator = self.operator_approvals.get(&(owner, caller)).unwrap_or(false);
        
        if caller != owner && !is_approved && !is_operator {
            self.env().revert(NftError::Unauthorized);
        }
        
        // Clear approval
        self.has_approval.set(&token_id, false);
        
        // Update balances
        let from_balance = self.balances.get(&from).unwrap_or(U256::zero());
        let to_balance = self.balances.get(&to).unwrap_or(U256::zero());
        
        self.balances.set(&from, from_balance - 1);
        self.balances.set(&to, to_balance + 1);
        
        // Transfer ownership
        self.owners.set(&token_id, to);
        
        // Emit event
        self.env().emit_event(Transfer { from, to, token_id });
    }

    // ========================================
    // CEP-95 REQUIRED: Approval Functions
    // ========================================

    /// Approve a spender for a specific token
    pub fn approve(&mut self, spender: Address, token_id: U256) {
        let caller = self.env().caller();
        let owner = self.owners.get(&token_id)
            .unwrap_or_else(|| self.env().revert(NftError::TokenNotFound));
        
        if caller != owner {
            self.env().revert(NftError::NotOwner);
        }
        
        self.token_approvals.set(&token_id, spender);
        self.has_approval.set(&token_id, true);
        self.env().emit_event(Approval { owner, spender, token_id });
    }

    /// Revoke approval for a specific token
    pub fn revoke_approval(&mut self, token_id: U256) {
        let caller = self.env().caller();
        let owner = self.owners.get(&token_id)
            .unwrap_or_else(|| self.env().revert(NftError::TokenNotFound));
        
        if caller != owner {
            self.env().revert(NftError::NotOwner);
        }
        
        self.has_approval.set(&token_id, false);
    }

    /// Approve an operator for all tokens
    pub fn approve_for_all(&mut self, operator: Address) {
        let owner = self.env().caller();
        self.operator_approvals.set(&(owner, operator), true);
        self.env().emit_event(ApprovalForAll { owner, operator });
    }

    /// Revoke operator approval
    pub fn revoke_approval_for_all(&mut self, operator: Address) {
        let owner = self.env().caller();
        self.operator_approvals.set(&(owner, operator), false);
    }

    // ========================================
    // CID NAME SPECIFIC: Minting Functions
    // ========================================

    /// Mint a new .cid name NFT
    /// Only callable by admin (the IdentityRegistry contract)
    pub fn mint_cid_name(
        &mut self,
        to: Address,
        name: String,
        bound_did: String,
        is_premium: bool,
        expires_at: u64,
    ) -> U256 {
        let caller = self.env().caller();
        let admin = self.admin.get().unwrap();
        
        // Only admin can mint
        if caller != admin {
            self.env().revert(NftError::Unauthorized);
        }
        
        // Check name not already taken
        if self.name_to_token.get(&name).is_some() {
            self.env().revert(NftError::NameAlreadyTaken);
        }
        
        // Get next token ID
        let token_id = self.next_token_id.get_or_default();
        self.next_token_id.set(token_id + 1);
        
        // Create metadata
        let metadata = CidNameMetadata {
            name: name.clone(),
            description: alloc::format!("CasperID Name: {}", name),
            asset_uri: alloc::format!("https://CasperID.com/resolve/{}", name),
            token_uri: alloc::format!("https://CasperID.com/api/metadata/{}", name),
            bound_did,
            is_premium,
            registered_at: self.env().get_block_time(),
            expires_at,
        };
        
        // Store mappings
        self.owners.set(&token_id, to);
        self.token_metadata.set(&token_id, metadata);
        self.name_to_token.set(&name, token_id);
        
        // Update balances
        let balance = self.balances.get(&to).unwrap_or(U256::zero());
        self.balances.set(&to, balance + 1);
        
        // Update total supply
        let supply = self.total_supply.get_or_default();
        self.total_supply.set(supply + 1);
        
        // Emit events
        self.env().emit_event(Mint { to, token_id });
        self.env().emit_event(MetadataUpdate { token_id });
        
        token_id
    }

    /// Lookup token ID by name
    pub fn get_token_by_name(&self, name: String) -> Option<U256> {
        self.name_to_token.get(&name)
    }

    /// Get total supply
    pub fn total_supply(&self) -> U256 {
        self.total_supply.get_or_default()
    }

    /// Update the bound DID for a name (owner only)
    pub fn update_bound_did(&mut self, token_id: U256, new_did: String) {
        let caller = self.env().caller();
        let owner = self.owners.get(&token_id)
            .unwrap_or_else(|| self.env().revert(NftError::TokenNotFound));
        
        if caller != owner {
            self.env().revert(NftError::NotOwner);
        }
        
        let mut metadata = self.token_metadata.get(&token_id)
            .unwrap_or_else(|| self.env().revert(NftError::TokenNotFound));
        
        metadata.bound_did = new_did;
        self.token_metadata.set(&token_id, metadata);
        
        self.env().emit_event(MetadataUpdate { token_id });
    }
}

/// NFT Error Codes
#[odra::odra_error]
pub enum NftError {
    TokenNotFound = 1,
    NotOwner = 2,
    Unauthorized = 3,
    NameAlreadyTaken = 4,
    InvalidRecipient = 5,
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, NoArgs};

    #[test]
    fn test_mint_cid_name() {
        let test_env = odra_test::env();
        let admin = test_env.get_account(0);
        
        let mut contract = CidNameNFTDeployer::init(
            &test_env,
            "CasperID Names".to_string(),
            "CID".to_string(),
        );
        
        let token_id = contract.mint_cid_name(
            admin,
            "alice.cid".to_string(),
            "did:casper:123".to_string(),
            true,
            0,
        );
        
        assert_eq!(contract.owner_of(token_id), Some(admin));
        assert_eq!(contract.balance_of(admin), U256::one());
    }
}
