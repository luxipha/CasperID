use starknet::ContractAddress;
use starknet::contract_address_const;

use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait,
    start_cheat_caller_address, stop_cheat_caller_address
};

use casperid_zk::ICasperIDZKSafeDispatcher;
use casperid_zk::ICasperIDZKSafeDispatcherTrait;
use casperid_zk::ICasperIDZKDispatcher;
use casperid_zk::ICasperIDZKDispatcherTrait;

/// Test constants
const PROOF_HASH_1: felt252 = 0x111222333;
const PROOF_HASH_2: felt252 = 0x444555666;
const NULLIFIER_1: felt252 = 0xABCDEF123;
const NULLIFIER_2: felt252 = 0xFEDCBA456;

fn OWNER() -> ContractAddress {
    contract_address_const::<0x1>()
}

fn WALLET_1() -> ContractAddress {
    contract_address_const::<0x100>()
}

fn WALLET_2() -> ContractAddress {
    contract_address_const::<0x200>()
}

fn WALLET_3() -> ContractAddress {
    contract_address_const::<0x300>()
}

/// Deploy the CasperID ZK contract with owner
fn deploy_contract() -> ContractAddress {
    let contract = declare("CasperIDZK").unwrap().contract_class();
    let constructor_args = array![OWNER().into()];
    let (contract_address, _) = contract.deploy(@constructor_args).unwrap();
    contract_address
}

/// Helper: Deploy and setup contract with a valid proof
fn deploy_with_valid_proof(proof_hash: felt252) -> ContractAddress {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Add valid proof as owner
    start_cheat_caller_address(contract_address, OWNER());
    dispatcher.add_valid_proof(proof_hash);
    stop_cheat_caller_address(contract_address);

    contract_address
}

// ============================================
// BASIC FUNCTIONALITY TESTS
// ============================================

#[test]
fn test_initial_state() {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // No wallets should be verified initially
    assert(!dispatcher.is_verified(WALLET_1()), 'Should not be verified');
    assert(!dispatcher.is_verified(WALLET_2()), 'Should not be verified');

    // No nullifiers should be used
    assert(!dispatcher.is_nullifier_used(NULLIFIER_1), 'Nullifier should be unused');

    // Count should be zero
    assert(dispatcher.get_verified_count() == 0, 'Count should be 0');
}

#[test]
fn test_add_valid_proof_as_owner() {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Proof should not be valid initially
    assert(!dispatcher.is_proof_valid(PROOF_HASH_1), 'Proof should be invalid');

    // Add proof as owner
    start_cheat_caller_address(contract_address, OWNER());
    dispatcher.add_valid_proof(PROOF_HASH_1);
    stop_cheat_caller_address(contract_address);

    // Proof should now be valid
    assert(dispatcher.is_proof_valid(PROOF_HASH_1), 'Proof should be valid');
}

#[test]
#[feature("safe_dispatcher")]
fn test_add_proof_non_owner_fails() {
    let contract_address = deploy_contract();
    let safe_dispatcher = ICasperIDZKSafeDispatcher { contract_address };

    // Try to add proof as non-owner
    start_cheat_caller_address(contract_address, WALLET_1());

    match safe_dispatcher.add_valid_proof(PROOF_HASH_1) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'Only owner can add proofs', 'Wrong error message');
        }
    };

    stop_cheat_caller_address(contract_address);
}

// ============================================
// VERIFY AND REGISTER TESTS
// ============================================

#[test]
fn test_verify_and_register_success() {
    let contract_address = deploy_with_valid_proof(PROOF_HASH_1);
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Register identity
    let result = dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1);

    assert(result == true, 'Should return true');
    assert(dispatcher.is_verified(WALLET_1()), 'Wallet should be verified');
    assert(dispatcher.is_nullifier_used(NULLIFIER_1), 'Nullifier should be used');
    assert(dispatcher.get_nullifier(WALLET_1()) == NULLIFIER_1, 'Wrong nullifier');
    assert(dispatcher.get_verified_count() == 1, 'Count should be 1');
}

#[test]
fn test_multiple_registrations() {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Add two valid proofs
    start_cheat_caller_address(contract_address, OWNER());
    dispatcher.add_valid_proof(PROOF_HASH_1);
    dispatcher.add_valid_proof(PROOF_HASH_2);
    stop_cheat_caller_address(contract_address);

    // Register two different identities
    dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1);
    dispatcher.verify_and_register(PROOF_HASH_2, WALLET_2(), NULLIFIER_2);

    // Both should be verified
    assert(dispatcher.is_verified(WALLET_1()), 'Wallet 1 should be verified');
    assert(dispatcher.is_verified(WALLET_2()), 'Wallet 2 should be verified');
    assert(dispatcher.get_verified_count() == 2, 'Count should be 2');
}

// ============================================
// NULLIFIER / SYBIL PREVENTION TESTS
// ============================================

#[test]
#[feature("safe_dispatcher")]
fn test_sybil_prevention_same_nullifier() {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };
    let safe_dispatcher = ICasperIDZKSafeDispatcher { contract_address };

    // Add two valid proofs
    start_cheat_caller_address(contract_address, OWNER());
    dispatcher.add_valid_proof(PROOF_HASH_1);
    dispatcher.add_valid_proof(PROOF_HASH_2);
    stop_cheat_caller_address(contract_address);

    // First registration succeeds
    dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1);

    // Second registration with SAME nullifier but different wallet should FAIL
    match safe_dispatcher.verify_and_register(PROOF_HASH_2, WALLET_2(), NULLIFIER_1) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'Nullifier already registered', 'Wrong error');
        }
    };

    // Verify state: only first wallet verified, count is 1
    assert(dispatcher.is_verified(WALLET_1()), 'Wallet 1 should be verified');
    assert(!dispatcher.is_verified(WALLET_2()), 'Wallet 2 should NOT be verified');
    assert(dispatcher.get_verified_count() == 1, 'Count should be 1');
}

#[test]
#[feature("safe_dispatcher")]
fn test_wallet_cannot_register_twice() {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };
    let safe_dispatcher = ICasperIDZKSafeDispatcher { contract_address };

    // Add two valid proofs
    start_cheat_caller_address(contract_address, OWNER());
    dispatcher.add_valid_proof(PROOF_HASH_1);
    dispatcher.add_valid_proof(PROOF_HASH_2);
    stop_cheat_caller_address(contract_address);

    // First registration succeeds
    dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1);

    // Same wallet trying to register again with different nullifier should FAIL
    match safe_dispatcher.verify_and_register(PROOF_HASH_2, WALLET_1(), NULLIFIER_2) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'Wallet already verified', 'Wrong error');
        }
    };
}

#[test]
#[feature("safe_dispatcher")]
fn test_zero_nullifier_rejected() {
    let contract_address = deploy_with_valid_proof(PROOF_HASH_1);
    let safe_dispatcher = ICasperIDZKSafeDispatcher { contract_address };

    // Try to register with zero nullifier
    match safe_dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), 0) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'Nullifier cannot be zero', 'Wrong error');
        }
    };
}

// ============================================
// PROOF VALIDATION TESTS
// ============================================

#[test]
#[feature("safe_dispatcher")]
fn test_invalid_proof_rejected() {
    let contract_address = deploy_contract();
    let safe_dispatcher = ICasperIDZKSafeDispatcher { contract_address };

    // Try to register without adding valid proof first
    match safe_dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1) {
        Result::Ok(_) => core::panic_with_felt252('Should have panicked'),
        Result::Err(panic_data) => {
            assert(*panic_data.at(0) == 'Invalid proof', 'Wrong error');
        }
    };
}

// ============================================
// QUERY FUNCTION TESTS
// ============================================

#[test]
fn test_get_nullifier_unverified_wallet() {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Unverified wallet should return 0
    let nullifier = dispatcher.get_nullifier(WALLET_1());
    assert(nullifier == 0, 'Should return 0');
}

#[test]
fn test_is_nullifier_used_comprehensive() {
    let contract_address = deploy_with_valid_proof(PROOF_HASH_1);
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Before registration
    assert(!dispatcher.is_nullifier_used(NULLIFIER_1), 'Should be unused');
    assert(!dispatcher.is_nullifier_used(NULLIFIER_2), 'Should be unused');

    // Register with NULLIFIER_1
    dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1);

    // After registration
    assert(dispatcher.is_nullifier_used(NULLIFIER_1), 'Should be used');
    assert(!dispatcher.is_nullifier_used(NULLIFIER_2), 'Should still be unused');
}

// ============================================
// EDGE CASE TESTS
// ============================================

#[test]
fn test_same_proof_reusable_for_different_identities() {
    let contract_address = deploy_with_valid_proof(PROOF_HASH_1);
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Same proof hash can be used by different wallets with different nullifiers
    // (In production, proof hashes would be unique per submission)
    dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1);
    dispatcher.verify_and_register(PROOF_HASH_1, WALLET_2(), NULLIFIER_2);

    assert(dispatcher.get_verified_count() == 2, 'Both should be verified');
}

#[test]
fn test_verified_count_increments() {
    let contract_address = deploy_contract();
    let dispatcher = ICasperIDZKDispatcher { contract_address };

    // Add valid proofs
    start_cheat_caller_address(contract_address, OWNER());
    dispatcher.add_valid_proof(PROOF_HASH_1);
    dispatcher.add_valid_proof(PROOF_HASH_2);
    stop_cheat_caller_address(contract_address);

    assert(dispatcher.get_verified_count() == 0, 'Initial count 0');

    dispatcher.verify_and_register(PROOF_HASH_1, WALLET_1(), NULLIFIER_1);
    assert(dispatcher.get_verified_count() == 1, 'Count should be 1');

    dispatcher.verify_and_register(PROOF_HASH_2, WALLET_2(), NULLIFIER_2);
    assert(dispatcher.get_verified_count() == 2, 'Count should be 2');
}
