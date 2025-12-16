# Casper Identity Registry - Deployment Guide

This guide walks you through deploying the IdentityRegistry smart contract to Casper testnet or mainnet.

## Prerequisites

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
```

### 2. Install Casper Client
```bash
cargo install casper-client
```

Verify installation:
```bash
casper-client --version
```

### 3. Create Wallet Keys

If you don't have Casper keys yet:

```bash
# Create keys directory
mkdir -p ~/casper-keys

# Generate new key pair
casper-client keygen ~/casper-keys
```

This creates:
- `~/casper-keys/secret_key.pem` - Your private key (keep safe!)
- `~/casper-keys/public_key.pem` - Your public key
- `~/casper-keys/public_key_hex` - Public key in hex format

### 4. Fund Your Account

**For Testnet:**
- Visit the [Casper testnet faucet](https://testnet.cspr.live/tools/faucet)
- Enter your public key hex
- Request test CSPR tokens

**For Mainnet:**
- Transfer CSPR to your account from an exchange or another wallet

## Building the Contract

### Step 1: Build WASM

From the `/contracts/casper` directory:

```bash
./build.sh
```

This compiles the contract to `build/identity_registry.wasm`.

### Step 2: Verify Build

```bash
ls -lh build/
# Should show identity_registry.wasm (and _optimized.wasm if wasm-opt is installed)
```

## Deploying to Testnet

### Step 1: Set Environment Variables

```bash
# Testnet node
export NODE_URL=http://rpc.testnet.casperlabs.io

# Chain name
export CHAIN_NAME=casper-test

# Your secret key path
export SECRET_KEY=~/casper-keys/secret_key.pem

# Contract WASM path
export CONTRACT_WASM=./build/identity_registry.wasm
```

### Step 2: Deploy the Contract

```bash
casper-client put-deploy \
  --node-address $NODE_URL \
  --chain-name $CHAIN_NAME \
  --secret-key $SECRET_KEY \
  --payment-amount 150000000000 \
  --session-path $CONTRACT_WASM
```

**Payment amount**: 150 CSPR (150000000000 motes) for deployment.

### Step 3: Get Deploy Hash

The command returns a deploy hash. Save it:

```bash
export DEPLOY_HASH=<hash-from-previous-command>
```

### Step 4: Check Deploy Status

```bash
casper-client get-deploy \
  --node-address $NODE_URL \
  $DEPLOY_HASH
```

Wait for `"execution_results"` to show `"Success"`.

### Step 5: Get Contract Hash

Query your account to find the contract hash:

```bash
# Get your account hash from public key
casper-client account-address --public-key ~/casper-keys/public_key.pem

# Query account named keys
casper-client query-global-state \
  --node-address $NODE_URL \
  --state-root-hash <latest-state-root-hash> \
  --key account-hash-<your-account-hash>
```

Look for `"identity_registry"` in the named keys. The value is your contract hash.

Save it:
```bash
export CONTRACT_HASH=hash-xxxx...
```

## Interacting with the Contract

### Add an Issuer

```bash
casper-client put-deploy \
  --node-address $NODE_URL \
  --chain-name $CHAIN_NAME \
  --secret-key $SECRET_KEY \
  --payment-amount 2500000000 \
  --session-hash $CONTRACT_HASH \
  --session-entry-point add_issuer \
  --session-arg "pub_key:string='<new-issuer-public-key-hex>'"
```

### Set Verification Status

```bash
casper-client put-deploy \
  --node-address $NODE_URL \
  --chain-name $CHAIN_NAME \
  --secret-key $SECRET_KEY \
  --payment-amount 3000000000 \
  --session-hash $CONTRACT_HASH \
  --session-entry-point set_verification \
  --session-arg "account_hash:string='account-hash-xxx'" \
  --session-arg "tier:string='basic'" \
  --session-arg "last_kyc_at:u64='$(date +%s)'" \
  --session-arg "last_liveness_at:u64='$(date +%s)'" \
  --session-arg "issuer_id:string='CasperID-Demo'" \
  --session-arg "credential_hash:string='sha256-hash-of-credential'" \
  --session-arg "verified:bool='true'"
```

### Query Verification Status

```bash
# Get current state root hash
casper-client get-state-root-hash --node-address $NODE_URL

# Query verification
casper-client query-global-state \
  --node-address $NODE_URL \
  --state-root-hash <state-root-hash> \
  --key $CONTRACT_HASH \
  -q "identities/<account-hash-to-query>"
```

## Mainnet Deployment

For mainnet deployment, change the environment variables:

```bash
export NODE_URL=http://rpc.mainnet.casperlabs.io
export CHAIN_NAME=casper
```

**Important**: Mainnet deployment costs real CSPR. Ensure you have sufficient funds.

## Update Backend Configuration

After deployment, update your backend `.env`:

```bash
# In /server/.env
CASPER_NETWORK=casper-test
CASPER_NODE_URL=http://rpc.testnet.casperlabs.io/rpc
CONTRACT_HASH=hash-xxxx...
ISSUER_PRIVATE_KEY=<your-secret-key-hex>
ISSUER_PUBLIC_KEY=<your-public-key-hex>
```

## Troubleshooting

### "Out of gas" Error
Increase the payment amount. Contract deployment typically needs 100-200 CSPR.

### "Invalid deploy" Error
Check that:
- Your account is funded
- Secret key path is correct
- Contract WASM exists at specified path

### "Permission denied" Error
Ensure you're using an authorized issuer key when calling `add_issuer`, `remove_issuer`, or `set_verification`.

### Can't Find Contract Hash
Query your account's named keys directly or check the deploy's execution results for the contract hash.

## Verifying the Deployment

Once deployed, verify:

1. **Contract exists**:
   ```bash
   casper-client query-global-state \
     --node-address $NODE_URL \
     --state-root-hash <latest> \
     --key $CONTRACT_HASH
   ```

2. **Entry points available**:
   Check the contract metadata shows all 5 entry points: init, add_issuer, remove_issuer, set_verification, get_verification.

3. **Test basic flow**:
   - Add yourself as issuer
   - Set verification for a test account
   - Query that account's verification

## Next Steps

After deployment:
1. Update backend Casper service to use the contract hash
2. Test end-to-end flow from frontend → backend → blockchain
3. Monitor gas costs and optimize if needed
4. Set up monitoring for contract calls

## Resources

- [Casper Documentation](https://docs.casper.network/)
- [Casper Client CLI](https://docs.casper.network/developers/cli/installing-casper-client/)
- [Testnet Explorer](https://testnet.cspr.live/)
- [Mainnet Explorer](https://cspr.live/)
