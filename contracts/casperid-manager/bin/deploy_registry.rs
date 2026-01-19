//! Deployment script for CasperID Identity Registry
//! Uses Odra livenet environment to deploy IdentityRegistry contract to Casper testnet

use odra::host::Deployer;
use odra::prelude::Addressable;
use casperid_manager::identity_registry::IdentityRegistry;

fn main() {
    // Initialize the Casper livenet environment
    // This reads configuration from .env file
    let env = odra_casper_livenet_env::env();

    println!("🚀 Deploying IdentityRegistry to Casper testnet...");
    println!("📍 Chain: {}", std::env::var("ODRA_CASPER_LIVENET_CHAIN_NAME").unwrap_or_default());
    println!("📍 Deployer: {:?}", env.caller());

    // IMPORTANT: Set gas before deployment
    // 400 CSPR = 400_000_000_000 motes
    env.set_gas(400_000_000_000u64);

    // Deploy IdentityRegistry contract (no arguments for init)
    let contract = IdentityRegistry::deploy(&env, odra::host::NoArgs);
    
    println!("✅ IdentityRegistry deployed successfully!");
    println!("📋 Contract address: {:?}", contract.address());
    
    // Test: Check initial status
    let admin = contract.admin();
    println!("📋 Admin address: {:?}", admin);
}
