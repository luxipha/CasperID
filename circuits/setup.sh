#!/bin/bash
# CasperID ZK Circuit Setup Script
# This script installs Noir/Nargo and compiles the liveness circuit

set -e

echo "=== CasperID ZK Circuit Setup ==="
echo ""

# Check if nargo is already installed
if command -v nargo &> /dev/null; then
    NARGO_VERSION=$(nargo --version 2>/dev/null | head -1)
    echo "Found nargo: $NARGO_VERSION"
else
    echo "Nargo not found. Installing..."

    # Install noirup
    curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash

    # Source the profile to get noirup in PATH
    export PATH="$HOME/.nargo/bin:$PATH"

    # Install specific version compatible with the circuit
    noirup -v 0.31.0

    echo "Nargo installed successfully!"
fi

echo ""
echo "=== Compiling Liveness Circuit ==="
cd "$(dirname "$0")/liveness"

# Clean previous build
rm -rf target/

# Compile the circuit
nargo compile

echo ""
echo "=== Circuit Compilation Complete ==="
echo "Output: circuits/liveness/target/circuit.json"
echo ""

# Verify the circuit was compiled
if [ -f "target/circuit.json" ]; then
    echo "Success! Circuit JSON generated."

    # Show basic circuit info
    echo ""
    echo "Circuit info:"
    echo "  Noir version: $(cat target/circuit.json | grep -o '"noir_version":"[^"]*"' | head -1 || echo 'N/A')"
else
    echo "Error: circuit.json not found after compilation"
    exit 1
fi
