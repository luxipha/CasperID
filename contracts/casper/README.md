# Casper Identity Registry Smart Contract

Decentralized identity verification registry on the Casper blockchain.

## Overview

The **IdentityRegistry** contract stores on-chain verification records for wallet addresses, including:
- Verification status (verified/not verified)
- Verification tier (basic or full_kyc)
- Last KYC timestamp
- Last liveness check timestamp  
- Issuer ID
- Credential hash (for off-chain verification)

## Contract Structure

### IdentityRecord

```rust
pub struct IdentityRecord {
    pub verified: bool,
    pub tier: String,              // "basic" | "full_kyc"
    pub last_kyc_at: u64,          // Unix timestamp
    pub last_liveness_at: u64,     // Unix timestamp
    pub issuer_id: String,
    pub credential_hash: String,
}
```

### Entry Points

#### 1. `init()`
- **Access**: Called automatically during contract installation
- **Purpose**: Initializes dictionaries and adds deployer as first issuer
- **Parameters**: None

#### 2. `add_issuer(pub_key: String)`
- **Access**: Authorized issuers only
- **Purpose**: Add a new authorized issuer
- **Parameters**:
  - `pub_key`: Public key of the new issuer

#### 3. `remove_issuer(pub_key: String)`
- **Access**: Authorized issuers only
- **Purpose**: Remove an issuer's authorization
- **Parameters**:
  - `pub_key`: Public key of the issuer to remove

#### 4. `set_verification(...)`
- **Access**: Authorized issuers only
- **Purpose**: Set or update verification status for an account
- **Parameters**:
  - `account_hash`: Account hash to verify
  - `tier`: "basic" or "full_kyc"
  - `last_kyc_at`: Unix timestamp of KYC  
  - `last_liveness_at`: Unix timestamp of liveness check
  - `issuer_id`: Identifier of the issuer
  - `credential_hash`: Hash of the off-chain credential
  - `verified`: Boolean verification status

#### 5. `get_verification(account_hash: String)`
- **Access**: Public (anyone can call)
- **Purpose**: Retrieve verification record for an account
- **Parameters**:
  - `account_hash`: Account hash to query
- **Returns**: IdentityRecord tuple (verified, tier, last_kyc_at, last_liveness_at, issuer_id, credential_hash)

## Build Instructions

### Prerequisites

1. Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Add WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

3. Install Casper CLI (optional, for deployment):
```bash
cargo install casper-client
```

### Building

```bash
# Make build script executable
chmod +x build.sh

# Build the contract
./build.sh
```

The compiled WASM will be in `build/identity_registry.wasm`.

### Testing

```bash
cargo test
```

## Deployment

### Deploy to Casper Testnet

1. **Prepare your keys**: Ensure you have a funded account on Casper testnet.

2. **Install the contract**:

```bash
casper-client put-deploy \
    --node-address http://rpc.testnet.casperlabs.io \
    --chain-name casper-test \
    --secret-key /path/to/secret_key.pem \
    --payment-amount 100000000000 \
    --session-path build/identity_registry.wasm
```

3. **Get the contract hash**: After deployment, query your account to find the contract hash.

### Interacting with the Contract

#### Add an Issuer

```bash
casper-client put-deploy \
    --node-address http://rpc.testnet.casperlabs.io \
    --chain-name casper-test \
    --secret-key /path/to/secret_key.pem \
    --payment-amount 2500000000 \
    --session-hash <contract-hash> \
    --session-entry-point add_issuer \
    --session-arg "pub_key:string='<issuer-public-key>'"
```

#### Set Verification

```bash
casper-client put-deploy \
    --node-address http://rpc.testnet.casperlabs.io \
    --chain-name casper-test \
    --secret-key /path/to/issuer_key.pem \
    --payment-amount 2500000000 \
    --session-hash <contract-hash> \
    --session-entry-point set_verification \
    --session-arg "account_hash:string='account-hash-xxx'" \
    --session-arg "tier:string='basic'" \
    --session-arg "last_kyc_at:u64='1732442400'" \
    --session-arg "last_liveness_at:u64='1732442400'" \
    --session-arg "issuer_id:string='CasperID-Demo'" \
    --session-arg "credential_hash:string='abc123...'" \
    --session-arg "verified:bool='true'"
```

#### Query Verification

```bash
casper-client query-global-state \
    --node-address http://rpc.testnet.casperlabs.io \
    --state-root-hash <state-root-hash> \
    --key <contract-hash> \
    -q "identities/<account-hash>"
```

## Security Considerations

1. **Authorization**: Only authorized issuers can call `add_issuer`, `remove_issuer`, and `set_verification`
2. **Immutability**: Contract deployer is automatically the first issuer
3. **Public Reads**: Anyone can query verification status via `get_verification`
4. **Dictionary Storage**: Efficient storage using Casper dictionaries

## Integration with Backend

The backend API (`/server/src/services/casper.js`) will interact with this contract using the Casper JS SDK:

```javascript
const { CasperClient, DeployUtil, CLPublicKey } = require('casper-js-sdk');

// Set verification example
const setVerificationDeploy = DeployUtil.makeDeploy(
    deployParams,
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        contractHash,
        'set_verification',
        runtimeArgs
    ),
    standardPayment
);
```

## Development Status

- ✅ Contract structure implemented
- ✅ All entry points defined
- ✅ Authorization logic
- ✅ IdentityRecord serialization
- ⏳ Unit tests (pending)
- ⏳ Integration tests (pending)
- ⏳ Testnet deployment (pending)

## Next Steps

1. Write comprehensive unit tests
2. Deploy to Casper testnet
3. Integrate with backend API
4. Test end-to-end flows
5. Deploy to mainnet after testing
