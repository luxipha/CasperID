<div align="center">
  <br />
    <a href="https://www.youtube.com/watch?v=OpL5Q7Zc7qk" target="_blank">
      <img src="https://i.postimg.cc/26LnpVqZ/test1-copy.jpg" alt="Project Banner">
    </a>
  
  <br />

  <div>
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
  </div>

  <h3 align="center">CasperID</h3>

   <div align="center">
     A decentralized identity and verification dApp built on the Casper blockchain.
    </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🕸️ [Smart Contract Overview](#smart-contract-overview)
6. 🚀 [More](#more)

## <a name="introduction">🤖 Introduction</a>

**CasperID** is a decentralized identity and verification platform built on the Casper blockchain. It enables users to obtain verified digital identities, allows trusted issuers to verify and issue credentials, and provides developers with simple APIs to check verification status on-chain or via REST API.

### Three Roles:
- **Users/Holders**: Request and manage verified identities
- **Issuers/Verifiers**: Trusted parties that confirm and verify identities
- **Developers/dApps**: Query verification status for compliance and access control

## <a name="tech-stack">⚙️ Tech Stack</a>

- **Frontend**: Next.js 14 + TypeScript
- **Blockchain**: Casper Network
- **Smart Contracts**: Rust (Casper contract development)
- **Backend API**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: Casper Signer/Wallet
- **Styling**: Tailwind CSS

## <a name="features">🔋 Features</a>

- **Decentralized Identity (DID)**: Create and manage unique DIDs on Casper blockchain
- **Identity Verification**: Submit verification requests (Basic or Full KYC)
- **Liveness Tracking**: Track when KYC and liveness checks were last performed
- **Time-Based Requirements**: Support for periodic re-verification policies
- **Credential Issuance**: Trusted issuers approve and issue verifiable credentials
- **On-Chain Registry**: Immutable verification status stored on Casper
- **Public API**: Developers can query verification status via REST API or on-chain
- **Admin Console**: Issuers can review and approve verification requests
- **Credential Revocation**: Ability to revoke credentials when needed
- **Privacy-First**: Off-chain credential storage with on-chain hash verification

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally.

**Prerequisites**

- [Git](https://git.scm.com/)
- [Node.js](https://nodejs.org/en) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Rust](https://www.rust-lang.org/) (for smart contract development)
- [Casper CLI](https://docs.casper.network/developers/prerequisites/)
- Casper Signer wallet extension

**Cloning the Repository**

```bash
git clone https://github.com/yourusername/casperId.git
cd casperId
```

**Installation**

Install frontend dependencies:

```bash
npm install
```

**Set Up Backend API** (see `/server` directory)

```bash
cd server
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

**Deploy Smart Contract** (see [contracts/casper/README.md](file:///Users/abisoye/Projects/casperId/contracts/casper/README.md))

**Prerequisites**: Rust, WASM target, Casper CLI

```bash
cd contracts/casper

# Build the contract
./build.sh

# Deploy to testnet (see DEPLOYMENT.md for detailed instructions)
# The contract will be compiled to build/identity_registry.wasm
```

For full deployment instructions, see [contracts/casper/DEPLOYMENT.md](file:///Users/abisoye/Projects/casperId/contracts/casper/DEPLOYMENT.md).

**Run the Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view CasperID.

## <a name="smart-contract-overview">🕸️ Smart Contract Overview</a>

The **IdentityRegistry** contract manages on-chain verification records on Casper blockchain.

### Contract State

**IdentityRecord Structure**:
```rust
struct IdentityRecord {
    verified: bool,
    tier: String,           // "basic" | "full_kyc"
    last_kyc_at: u64,       // Unix timestamp
    last_liveness_at: u64,  // Unix timestamp
    issuer_id: String,
    credential_hash: String,
}
```

### Entry Points

- **add_issuer(pub_key)**: Add an authorized issuer (admin only)
- **remove_issuer(pub_key)**: Remove issuer authorization
- **set_verification(...)**: Set identity verification status (issuers only)
  - Parameters: account_hash, tier, last_kyc_at, last_liveness_at, issuer_id, credential_hash, verified
- **get_verification(account_hash)**: Public read of verification status

### Key Features

- Tracks when KYC and liveness checks were performed
- Enables time-based verification requirements
- Only authorized issuers can update verification status
- Immutable audit trail on Casper blockchain

## <a name="more">🚀 More</a>

### API Documentation

Once the backend is running, API documentation is available at:
- `/api/identity-status?wallet=<address>` - Check verification status
- `/api/verify-credential` - Verify a credential
- Full API docs: See `/server/README.md`

### Contributing

We welcome contributions to CasperID! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### Support

For questions and support:
- Open an issue on GitHub
- Check the documentation in `/docs`
