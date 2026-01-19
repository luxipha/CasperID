//! Deployment script for CasperID Name Registry
//! Uses Odra livenet environment to deploy CidNameNFT contract to Casper testnet

use odra::host::Deployer;
use odra::prelude::Addressable;
use casperid_manager::cid_name_nft::{CidNameNFT, CidNameNFTInitArgs};

fn main() {
    // Initialize the Casper livenet environment
    // This reads configuration from .env file
    let env = odra_casper_livenet_env::env();

    println!("🚀 Deploying CidNameNFT to Casper testnet...");
    println!("📍 Chain: {}", std::env::var("ODRA_CASPER_LIVENET_CHAIN_NAME").unwrap_or_default());
    println!("📍 Deployer: {:?}", env.caller());

    // IMPORTANT: Set gas before deployment (required for Casper 2.0 transactions)
    // 450 CSPR = 450_000_000_000 motes for complex NFT contract deployment
    env.set_gas(450_000_000_000u64);

    // Deploy CidNameNFT contract with constructor arguments
    let init_args = CidNameNFTInitArgs {
        name: "CasperID Names".to_string(),
        symbol: "CID".to_string(),
    };

    // New pattern for Odra v2.4+
    let contract = CidNameNFT::deploy(&env, init_args);
    
    println!("✅ CidNameNFT deployed successfully!");
    println!("📋 Contract address: {:?}", contract.address());
    
    // Test: Check total supply
    let supply = contract.total_supply();
    println!("📊 Initial total supply: {}", supply);
    
    // Test: Check name and symbol
    println!("📋 Collection name: {}", contract.name());
    println!("📋 Symbol: {}", contract.symbol());
}

