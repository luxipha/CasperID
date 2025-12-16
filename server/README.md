# CasperID Backend API

Backend API service for CasperID - Decentralized Identity Verification on Casper blockchain.

## Features

- **Verification Requests**: Users can request identity verification
- **Credential Issuance**: Admins approve and issue credentials
- **Liveness Tracking**: Track KYC and liveness verification timestamps
- **MongoDB Storage**: Store verification requests and credentials
- **Casper Integration**: On-chain verification registry (contract integration pending)

## Setup

### Prerequisites

- Node.js v18 or higher
- MongoDB running locally or MongoDB Atlas account
- Casper wallet for issuer operations

### Installation

```bash
npm install
```

### Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- MongoDB connection string
- Admin password
- JWT secret
- Casper network settings

### Running the Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Public Endpoints

#### Request Verification
```http
POST /api/request-verification
Content-Type: application/json

{
  "wallet": "account-hash-xyz",
  "tier": "basic",
  "email": "user@example.com"
}
```

#### Get Identity Status
```http
GET /api/identity-status?wallet=account-hash-xyz
```

Response:
```json
{
  "wallet": "account-hash-xyz",
  "verified": true,
  "tier": "basic",
  "last_kyc_at": 1732442400,
  "last_liveness_at": 1732442400,
  "issuer": "CasperID-Demo"
}
```

#### Evaluate Requirements (Advanced)
```http
POST /api/evaluate-requirements
Content-Type: application/json

{
  "wallet": "account-hash-xyz",
  "requirements": {
    "kyc_full": true,
    "liveness_max_age_days": 30
  }
}
```

### Admin Endpoints

Require `Authorization: Bearer <admin_password>` header.

#### Get Verification Requests
```http
GET /api/admin/verification-requests?status=pending
Authorization: Bearer your-admin-password
```

#### Issue Credential
```http
POST /api/admin/issue-credential
Authorization: Bearer your-admin-password
Content-Type: application/json

{
  "request_id": "request-id-here",
  "approve": true
}
```

#### Revoke Credential
```http
POST /api/admin/revoke
Authorization: Bearer your-admin-password
Content-Type: application/json

{
  "wallet": "account-hash-xyz",
  "reason": "Fraud detected"
}
```

## Database Schema

### VerificationRequest
- `wallet`: String (indexed)
- `tier`: "basic" | "full_kyc"
- `status`: "pending" | "approved" | "rejected"
- `email`: String (optional)
- `metadata`: Object
- `created_at`, `updated_at`: Date

### Credential
- `wallet`: String (unique, indexed)
- `tier`: "basic" | "full_kyc"
- `last_kyc_at`: Number (Unix timestamp)
- `last_liveness_at`: Number (Unix timestamp)
- `issuer_id`: String
- `credential_json`: String (JWT)
- `credential_hash`: String
- `onchain_tx_hash`: String
- `revoked`: Boolean
- `revocation_reason`: String

### Issuer
- `public_key`: String (unique)
- `name`: String
- `created_at`: Date

## Casper Integration

The `/src/services/casper.js` module handles blockchain interaction:
- `getVerificationStatus(accountHash)` - Read from contract
- `setVerification(...)` - Write to contract
- `addIssuer(publicKey)` - Add authorized issuer
- `removeIssuer(publicKey)` - Remove issuer

**Note**: Casper contract integration is pending smart contract deployment. Current implementation uses placeholders.

## Testing

```bash
# Health check
curl http://localhost:3001/health

# Request verification
curl -X POST http://localhost:3001/api/request-verification \
  -H "Content-Type: application/json" \
  -d '{"wallet":"test-wallet","tier":"basic","email":"test@example.com"}'

# Check status
curl http://localhost:3001/api/identity-status?wallet=test-wallet
```

## Development Status

- ✅ Express server setup
- ✅ MongoDB schemas
- ✅ Authentication middleware
- ✅ Verification routes
- ✅ Admin routes
- ✅ Evaluate requirements endpoint
- ⏳ Casper smart contract integration (pending)
- ⏳ JWT credential verification
- ⏳ Unit tests

## Next Steps

1. Deploy Casper IdentityRegistry contract
2. Implement Casper JS SDK integration in `services/casper.js`
3. Add JWT credential verification logic
4. Write unit tests
5. Add rate limiting and security headers
