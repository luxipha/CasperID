#![no_std]
#![no_main]

extern crate alloc;

use alloc::{string::{String, ToString}, vec, vec::Vec};
use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    contracts::{EntryPoint, EntryPoints, NamedKeys},
    EntryPointAccess, EntryPointType, Parameter,
    runtime_args, CLType, CLValue, Key, RuntimeArgs, URef,
};

// Constants for dictionary keys
const ISSUERS_DICT: &str = "issuers";
const IDENTITIES_DICT: &str = "identities";
const CONTRACT_VERSION: &str = "contract_version";
const ACCESS_UREF: &str = "access_uref";

// Entry point names
const ENTRY_POINT_INIT: &str = "init";
const ENTRY_POINT_ADD_ISSUER: &str = "add_issuer";
const ENTRY_POINT_REMOVE_ISSUER: &str = "remove_issuer";
const ENTRY_POINT_SET_VERIFICATION: &str = "set_verification";
const ENTRY_POINT_GET_VERIFICATION: &str = "get_verification";

/// Identity record structure
#[derive(Clone)]
pub struct IdentityRecord {
    pub verified: bool,
    pub tier: String,
    pub last_kyc_at: u64,
    pub last_liveness_at: u64,
    pub issuer_id: String,
    pub credential_hash: String,
}

impl IdentityRecord {
    pub fn to_tuple(&self) -> ((bool, String, u64), (u64, String, String)) {
        (
            (self.verified, self.tier.clone(), self.last_kyc_at),
            (self.last_liveness_at, self.issuer_id.clone(), self.credential_hash.clone())
        )
    }

    pub fn from_tuple(value: ((bool, String, u64), (u64, String, String))) -> Self {
        let ((verified, tier, last_kyc_at), (last_liveness_at, issuer_id, credential_hash)) = value;
        IdentityRecord {
            verified,
            tier,
            last_kyc_at,
            last_liveness_at,
            issuer_id,
            credential_hash,
        }
    }
}

/// Get the issuers dictionary URef
fn get_issuers_dict() -> URef {
    runtime::get_key(ISSUERS_DICT)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert()
}

/// Get the identities dictionary URef
fn get_identities_dict() -> URef {
    runtime::get_key(IDENTITIES_DICT)
        .unwrap_or_revert()
        .into_uref()
        .unwrap_or_revert()
}

/// Check if caller is an authorized issuer
fn is_authorized_issuer() -> bool {
    let caller = runtime::get_caller();
    let issuers_dict = get_issuers_dict();
    
    match storage::dictionary_get::<bool>(issuers_dict, &caller.to_string()) {
        Ok(Some(authorized)) => authorized,
        _ => false,
    }
}

/// Initialize the contract
#[no_mangle]
pub extern "C" fn init() {
    // Create dictionaries for issuers and identities
    let issuers_dict = storage::new_dictionary(ISSUERS_DICT).unwrap_or_revert();
    let identities_dict = storage::new_dictionary(IDENTITIES_DICT).unwrap_or_revert();

    // Add the contract deployer as the first issuer
    let deployer = runtime::get_caller();
    storage::dictionary_put(issuers_dict, &deployer.to_string(), true);

    runtime::put_key(ISSUERS_DICT, issuers_dict.into());
    runtime::put_key(IDENTITIES_DICT, identities_dict.into());
}

/// Add an authorized issuer (only callable by existing issuers)
#[no_mangle]
pub extern "C" fn add_issuer() {
    if !is_authorized_issuer() {
        runtime::revert(casper_types::ApiError::PermissionDenied);
    }

    let pub_key: String = runtime::get_named_arg("pub_key");
    let issuers_dict = get_issuers_dict();

    storage::dictionary_put(issuers_dict, &pub_key, true);
}

/// Remove an issuer (only callable by existing issuers)
#[no_mangle]
pub extern "C" fn remove_issuer() {
    if !is_authorized_issuer() {
        runtime::revert(casper_types::ApiError::PermissionDenied);
    }

    let pub_key: String = runtime::get_named_arg("pub_key");
    let issuers_dict = get_issuers_dict();

    storage::dictionary_put(issuers_dict, &pub_key, false);
}

/// Set verification status for an account (only callable by issuers)
#[no_mangle]
pub extern "C" fn set_verification() {
    if !is_authorized_issuer() {
        runtime::revert(casper_types::ApiError::PermissionDenied);
    }

    let account_hash: String = runtime::get_named_arg("account_hash");
    let tier: String = runtime::get_named_arg("tier");
    let last_kyc_at: u64 = runtime::get_named_arg("last_kyc_at");
    let last_liveness_at: u64 = runtime::get_named_arg("last_liveness_at");
    let issuer_id: String = runtime::get_named_arg("issuer_id");
    let credential_hash: String = runtime::get_named_arg("credential_hash");
    let verified: bool = runtime::get_named_arg("verified");

    let record = IdentityRecord {
        verified,
        tier,
        last_kyc_at,
        last_liveness_at,
        issuer_id,
        credential_hash,
    };

    let identities_dict = get_identities_dict();
    storage::dictionary_put(identities_dict, &account_hash, record.to_tuple());
}

/// Get verification status for an account (public read)
#[no_mangle]
pub extern "C" fn get_verification() {
    let account_hash: String = runtime::get_named_arg("account_hash");
    let identities_dict = get_identities_dict();

    let record = match storage::dictionary_get::<((bool, String, u64), (u64, String, String))>(identities_dict, &account_hash) {
        Ok(Some(value)) => IdentityRecord::from_tuple(value),
        _ => {
            // Return empty/unverified record if not found
            IdentityRecord {
                verified: false,
                tier: String::new(),
                last_kyc_at: 0,
                last_liveness_at: 0,
                issuer_id: String::new(),
                credential_hash: String::new(),
            }
        }
    };

    // Return the record as CLValue
    runtime::ret(CLValue::from_t(record.to_tuple()).unwrap_or_revert());
}

/// Install the contract
#[no_mangle]
pub extern "C" fn call() {
    let mut entry_points = EntryPoints::new();

    // Init entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_INIT,
        Vec::new(),
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ));

    // Add issuer entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_ADD_ISSUER,
        vec![Parameter::new("pub_key", CLType::String)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ));

    // Remove issuer entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_REMOVE_ISSUER,
        vec![Parameter::new("pub_key", CLType::String)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ));

    // Set verification entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_SET_VERIFICATION,
        vec![
            Parameter::new("account_hash", CLType::String),
            Parameter::new("tier", CLType::String),
            Parameter::new("last_kyc_at", CLType::U64),
            Parameter::new("last_liveness_at", CLType::U64),
            Parameter::new("issuer_id", CLType::String),
            Parameter::new("credential_hash", CLType::String),
            Parameter::new("verified", CLType::Bool),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ));

    // Get verification entry point
    entry_points.add_entry_point(EntryPoint::new(
        ENTRY_POINT_GET_VERIFICATION,
        vec![Parameter::new("account_hash", CLType::String)],
        CLType::Any,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ));

    let named_keys = NamedKeys::new();

    let (contract_hash, _version) = storage::new_contract(
        entry_points.into(),
        Some(named_keys),
        Some("identity_registry_contract_hash".to_string()),
        Some("identity_registry_access_uref".to_string()),
        None,
    );

    // Store contract hash for easy access
    runtime::put_key("identity_registry", contract_hash.into());

    // Call init to set up dictionaries
    runtime::call_contract::<()>(contract_hash, ENTRY_POINT_INIT, runtime_args! {});
}
