#!/bin/bash
# CasperID ZK Contract Deployment Script
# Usage: ./scripts/deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== CasperID ZK Contract Deployment ===${NC}"

# Check if environment variables are set
if [ -z "$STARKNET_ACCOUNT" ]; then
    echo -e "${RED}Error: STARKNET_ACCOUNT not set${NC}"
    echo "Export your account address: export STARKNET_ACCOUNT=0x..."
    exit 1
fi

if [ -z "$STARKNET_KEYSTORE" ]; then
    echo -e "${RED}Error: STARKNET_KEYSTORE not set${NC}"
    echo "Export your keystore path: export STARKNET_KEYSTORE=~/.starknet/keystore.json"
    exit 1
fi

# Default to Sepolia
RPC_URL=${STARKNET_RPC_URL:-"https://starknet-sepolia.public.blastapi.io/rpc/v0_7"}

echo -e "${GREEN}Network: Starknet Sepolia${NC}"
echo -e "${GREEN}Account: $STARKNET_ACCOUNT${NC}"

# Build the contract
echo -e "\n${YELLOW}Building contract...${NC}"
scarb build

# Declare the contract class
echo -e "\n${YELLOW}Declaring contract class...${NC}"
DECLARE_OUTPUT=$(sncast --account $STARKNET_ACCOUNT \
    --keystore $STARKNET_KEYSTORE \
    --url $RPC_URL \
    declare \
    --contract-name CasperIDZK \
    2>&1)

echo "$DECLARE_OUTPUT"

# Extract class hash from output
CLASS_HASH=$(echo "$DECLARE_OUTPUT" | grep -oE "class_hash: 0x[a-fA-F0-9]+" | cut -d' ' -f2)

if [ -z "$CLASS_HASH" ]; then
    echo -e "${RED}Failed to extract class hash${NC}"
    exit 1
fi

echo -e "${GREEN}Class Hash: $CLASS_HASH${NC}"

# Deploy the contract with owner = deployer
echo -e "\n${YELLOW}Deploying contract...${NC}"
DEPLOY_OUTPUT=$(sncast --account $STARKNET_ACCOUNT \
    --keystore $STARKNET_KEYSTORE \
    --url $RPC_URL \
    deploy \
    --class-hash $CLASS_HASH \
    --constructor-calldata $STARKNET_ACCOUNT \
    2>&1)

echo "$DEPLOY_OUTPUT"

# Extract contract address
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oE "contract_address: 0x[a-fA-F0-9]+" | cut -d' ' -f2)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}Failed to extract contract address${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Deployment Successful ===${NC}"
echo -e "Class Hash:       $CLASS_HASH"
echo -e "Contract Address: $CONTRACT_ADDRESS"
echo -e "Owner:            $STARKNET_ACCOUNT"
echo -e "\nExplorer: https://sepolia.voyager.online/contract/$CONTRACT_ADDRESS"

# Save deployment info
DEPLOY_FILE="deployments/sepolia.json"
mkdir -p deployments
cat > $DEPLOY_FILE << EOF
{
  "network": "starknet-sepolia",
  "classHash": "$CLASS_HASH",
  "contractAddress": "$CONTRACT_ADDRESS",
  "owner": "$STARKNET_ACCOUNT",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "explorerUrl": "https://sepolia.voyager.online/contract/$CONTRACT_ADDRESS"
}
EOF

echo -e "\n${GREEN}Deployment info saved to $DEPLOY_FILE${NC}"
