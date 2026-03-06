# CasperID ZK - Starknet Setup Guide

## Step 1: Create Starknet Account

### Option A: Using Argent X or Braavos Wallet (Recommended)

1. Install [Argent X](https://www.argent.xyz/argent-x/) or [Braavos](https://braavos.app/) browser extension
2. Create a new wallet
3. Switch network to **Starknet Sepolia**
4. Copy your wallet address

### Option B: Using sncast CLI

```bash
# Create a new account
sncast account create --name casperid_deployer --add-profile

# This will output your account address
# Fund this address with the faucet before deploying
```

## Step 2: Get Test Tokens

Visit any of these faucets:

| Faucet | URL |
|--------|-----|
| Starknet Foundation | https://starknet-faucet.vercel.app/ |
| LearnWeb3 | https://learnweb3.io/faucets/starknet_sepolia/ |
| Alchemy | https://www.alchemy.com/faucets/starknet-sepolia |

Enter your Starknet Sepolia address and request tokens.

**Wait for transaction confirmation** (~1-2 minutes)

## Step 3: Export Account for Deployment

### If using Argent X / Braavos:

Export your private key from the wallet settings, then:

```bash
# Create keystore
sncast account import \
    --name casperid_deployer \
    --address YOUR_WALLET_ADDRESS \
    --private-key YOUR_PRIVATE_KEY \
    --add-profile

# Set environment variables
export STARKNET_ACCOUNT=YOUR_WALLET_ADDRESS
export STARKNET_KEYSTORE=~/.starknet_accounts/casperid_deployer.json
```

### If using sncast account:

```bash
# Deploy the account first (requires gas)
sncast account deploy --name casperid_deployer

# Then set env vars
export STARKNET_ACCOUNT=$(sncast account list | grep casperid_deployer | awk '{print $2}')
export STARKNET_KEYSTORE=~/.starknet_accounts/casperid_deployer.json
```

## Step 4: Deploy Contract

```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

## Step 5: Verify Deployment

After deployment, you'll get output like:

```
=== Deployment Successful ===
Class Hash:       0x...
Contract Address: 0x...
Owner:            0x...

Explorer: https://sepolia.voyager.online/contract/0x...
```

Visit the explorer link to verify your contract.

## Environment Variables Summary

Add these to your `.env` or shell profile:

```bash
# Starknet Sepolia
export STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_7
export STARKNET_ACCOUNT=0x...
export STARKNET_KEYSTORE=~/.starknet_accounts/casperid_deployer.json
export CASPERID_ZK_CONTRACT=0x...  # After deployment
```

## Troubleshooting

### "Account not deployed"
You need to deploy your account first:
```bash
sncast account deploy --name casperid_deployer
```

### "Insufficient balance"
Get more tokens from the faucet. Deployment costs ~0.0001-0.001 ETH.

### "Class already declared"
The contract class is already on-chain. You can skip to deployment:
```bash
sncast deploy --class-hash CLASS_HASH --constructor-calldata OWNER_ADDRESS
```
