#!/bin/bash

# Build script for Casper Identity Registry contract

set -e

echo "🔨 Building Identity Registry contract..."

# Build the contract
cargo +nightly-2024-09-10 build --release --target wasm32-unknown-unknown

# Create build directory if it doesn't exist
mkdir -p build

# Copy the WASM file to build directory
cp target/wasm32-unknown-unknown/release/identity_registry.wasm build/

# Optimize WASM (optional, requires wasm-opt from binaryen)
if command -v wasm-opt &> /dev/null; then
    echo "🔧 Optimizing WASM..."
    wasm-opt -Oz build/identity_registry.wasm -o build/identity_registry_optimized.wasm
    echo "✅ Optimized WASM created: build/identity_registry_optimized.wasm"
else
    echo "⚠️  wasm-opt not found, skipping optimization"
fi

echo "✅ Contract built successfully!"
echo "📦 Output: build/identity_registry.wasm"
ls -lh build/*.wasm
