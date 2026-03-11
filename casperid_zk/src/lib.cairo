/// Interface for the CasperID ZK Identity Verifier
/// Allows registration and verification of identities using ZK proofs
#[starknet::interface]
pub trait ICasperIDZK<TContractState> {
    /// Register a verified identity after proof validation
    /// Returns true if registration successful
    fn verify_and_register(
        ref self: TContractState,
        proof_hash: felt252,
        wallet_address: starknet::ContractAddress,
        biometric_nullifier: felt252
    ) -> bool;

    /// Check if a wallet address has been verified
    fn is_verified(self: @TContractState, wallet: starknet::ContractAddress) -> bool;

    /// Get the nullifier associated with a wallet (returns 0 if not verified)
    fn get_nullifier(self: @TContractState, wallet: starknet::ContractAddress) -> felt252;

    /// Check if a nullifier has already been used (Sybil detection)
    fn is_nullifier_used(self: @TContractState, nullifier: felt252) -> bool;

    /// Get total number of verified identities
    fn get_verified_count(self: @TContractState) -> u64;

    /// Add a valid proof hash (owner only - for testing/admin)
    fn add_valid_proof(ref self: TContractState, proof_hash: felt252);

    /// Check if a proof hash is valid
    fn is_proof_valid(self: @TContractState, proof_hash: felt252) -> bool;
}

/// CasperID ZK Identity Contract
/// Manages privacy-preserving identity verification on Starknet
#[starknet::contract]
mod CasperIDZK {
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Map, StoragePathEntry
    };
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        /// Contract owner (deployer)
        owner: ContractAddress,
        /// Maps nullifier -> bool (true if already used)
        verified_nullifiers: Map<felt252, bool>,
        /// Maps wallet address -> nullifier (0 if not verified)
        verified_addresses: Map<ContractAddress, felt252>,
        /// Maps proof_hash -> bool (simulating FactRegistry)
        valid_proofs: Map<felt252, bool>,
        /// Counter for total verified identities
        verified_count: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        IdentityVerified: IdentityVerified,
        ProofAdded: ProofAdded,
    }

    #[derive(Drop, starknet::Event)]
    pub struct IdentityVerified {
        #[key]
        pub wallet: ContractAddress,
        pub nullifier: felt252,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProofAdded {
        #[key]
        pub proof_hash: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.verified_count.write(0);
    }

    #[abi(embed_v0)]
    impl CasperIDZKImpl of super::ICasperIDZK<ContractState> {
        /// Register a verified identity after proof validation
        fn verify_and_register(
            ref self: ContractState,
            proof_hash: felt252,
            wallet_address: ContractAddress,
            biometric_nullifier: felt252
        ) -> bool {
            // 1. Validate proof hash exists in our registry
            assert(self.valid_proofs.entry(proof_hash).read(), 'Invalid proof');

            // 2. Validate nullifier is non-zero
            assert(biometric_nullifier != 0, 'Nullifier cannot be zero');

            // 3. Prevent Sybil attack: Check nullifier not already used
            assert(
                !self.verified_nullifiers.entry(biometric_nullifier).read(),
                'Nullifier already registered'
            );

            // 4. Check wallet not already verified
            let existing_nullifier = self.verified_addresses.entry(wallet_address).read();
            assert(existing_nullifier == 0, 'Wallet already verified');

            // 5. Register the identity
            self.verified_nullifiers.entry(biometric_nullifier).write(true);
            self.verified_addresses.entry(wallet_address).write(biometric_nullifier);

            // 6. Increment counter
            let current_count = self.verified_count.read();
            self.verified_count.write(current_count + 1);

            // 7. Emit event
            self.emit(IdentityVerified {
                wallet: wallet_address,
                nullifier: biometric_nullifier,
                timestamp: starknet::get_block_timestamp(),
            });

            true
        }

        /// Check if a wallet address has been verified
        fn is_verified(self: @ContractState, wallet: ContractAddress) -> bool {
            self.verified_addresses.entry(wallet).read() != 0
        }

        /// Get the nullifier associated with a wallet
        fn get_nullifier(self: @ContractState, wallet: ContractAddress) -> felt252 {
            self.verified_addresses.entry(wallet).read()
        }

        /// Check if a nullifier has already been used
        fn is_nullifier_used(self: @ContractState, nullifier: felt252) -> bool {
            self.verified_nullifiers.entry(nullifier).read()
        }

        /// Get total number of verified identities
        fn get_verified_count(self: @ContractState) -> u64 {
            self.verified_count.read()
        }

        /// Add a valid proof hash (owner only)
        fn add_valid_proof(ref self: ContractState, proof_hash: felt252) {
            // Only owner can add valid proofs
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner can add proofs');

            self.valid_proofs.entry(proof_hash).write(true);

            self.emit(ProofAdded { proof_hash });
        }

        /// Check if a proof hash is valid
        fn is_proof_valid(self: @ContractState, proof_hash: felt252) -> bool {
            self.valid_proofs.entry(proof_hash).read()
        }
    }
}
