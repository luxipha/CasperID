# CasperID Testing Guide

Complete testing guide for CasperID - backend API, frontend, and integration testing.

## Prerequisites

Before testing, ensure you have:
- [x] Node.js v18+ installed
- [x] MongoDB installed and running
- [x] Casper Signer browser extension installed
- [x] Git repository cloned
- [ ] All dependencies installed

## Quick Start Setup

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Start MongoDB

```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf

# Verify MongoDB is running
mongosh --eval "db.version()"
```

### Step 3: Configure Environment Variables

**Backend** (`/server/.env`):
```bash
cd server
cp .env.example .env

# Edit .env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/casperid
JWT_SECRET=test-secret-key-change-in-production
ADMIN_PASSWORD=admin123
ISSUER_ID=CasperID-Demo
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`/.env.local`):
```bash
cd ..
cp .env.local.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 4: Start Services

**Terminal 1 - Backend API**:
```bash
cd server
npm run dev
```

Expected output:
```
🚀 CasperID API server running on port 3001
📍 Environment: development
🌐 Frontend URL: http://localhost:3000
✅ MongoDB connected successfully
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```

Expected output:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

## Testing Checklist

### ✅ Phase 1: Backend API Testing

#### Test 1.1: Health Check
```bash
curl http://localhost:3001/health
```

**Expected**:
```json
{
  "status": "ok",
  "message": "CasperID API is running",
  "timestamp": "2025-11-24T10:50:00.000Z"
}
```

#### Test 1.2: Request Verification
```bash
curl -X POST http://localhost:3001/api/request-verification \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "account-hash-test123",
    "tier": "basic",
    "email": "test@example.com"
  }'
```

**Expected**:
```json
{
  "message": "Verification request submitted successfully",
  "request": {
    "id": "...",
    "wallet": "account-hash-test123",
    "tier": "basic",
    "status": "pending",
    "created_at": "..."
  }
}
```

#### Test 1.3: Get Identity Status (Unverified)
```bash
curl "http://localhost:3001/api/identity-status?wallet=account-hash-test123"
```

**Expected**:
```json
{
  "wallet": "account-hash-test123",
  "verified": false,
  "tier": null,
  "last_kyc_at": null,
  "last_liveness_at": null,
  "issuer": null
}
```

#### Test 1.4: Admin - Get Requests
```bash
curl -H "Authorization: Bearer admin123" \
  http://localhost:3001/api/admin/verification-requests
```

**Expected**:
```json
{
  "count": 1,
  "requests": [
    {
      "id": "...",
      "wallet": "account-hash-test123",
      "tier": "basic",
      "email": "test@example.com",
      "status": "pending",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

#### Test 1.5: Admin - Issue Credential
```bash
# Get the request_id from previous step
REQUEST_ID="paste-request-id-here"

curl -X POST http://localhost:3001/api/admin/issue-credential \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin123" \
  -d "{
    \"request_id\": \"$REQUEST_ID\",
    \"approve\": true
  }"
```

**Expected**:
```json
{
  "message": "Credential issued successfully",
  "credential": {
    "wallet": "account-hash-test123",
    "tier": "basic",
    "last_kyc_at": 1732442400,
    "last_liveness_at": 1732442400,
    "credential_hash": "...",
    "tx_hash": "placeholder-tx-..."
  }
}
```

#### Test 1.6: Get Identity Status (Verified)
```bash
curl "http://localhost:3001/api/identity-status?wallet=account-hash-test123"
```

**Expected**:
```json
{
  "wallet": "account-hash-test123",
  "verified": true,
  "tier": "basic",
  "last_kyc_at": 1732442400,
  "last_liveness_at": 1732442400,
  "issuer": "CasperID-Demo"
}
```

#### Test 1.7: Evaluate Requirements
```bash
curl -X POST http://localhost:3001/api/evaluate-requirements \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "account-hash-test123",
    "requirements": {
      "kyc_full": false,
      "liveness_max_age_days": 30
    }
  }'
```

**Expected**:
```json
{
  "meets_requirements": true,
  "needs_liveness_refresh": false,
  "credential": {
    "tier": "basic",
    "last_kyc_at": 1732442400,
    "last_liveness_at": 1732442400
  }
}
```

---

### ✅ Phase 2: Frontend UI Testing

#### Test 2.1: Landing Page
1. Open http://localhost:3000
2. Verify:
   - [ ] Page loads successfully
   - [ ] Navbar displays "CasperID"
   - [ ] Hero section visible
   - [ ] Three quick link cards visible (User Dashboard, Admin Console, Verify Identity)

#### Test 2.2: User Dashboard - Wallet Connection
1. Navigate to http://localhost:3000/me
2. Verify:
   - [ ] "Connect Casper Wallet" button displayed
   - [ ] Card with gradient background visible
3. Click "Connect Casper Wallet"
4. Verify:
   - [ ] Casper Signer popup appears OR alert shows install instructions
   - [ ] If Casper Signer installed, wallet connects successfully
   - [ ] Dashboard shows wallet address and DID

#### Test 2.3: User Dashboard - Verification Request
1. On `/me` page (wallet connected)
2. Verify initial state:
   - [ ] Shows "Not Verified" status
   - [ ] "Request Verification" button visible
3. Click "Request Verification"
4. Verify modal:
   - [ ] Modal opens with form
   - [ ] Tier selection (Basic/Full KYC) works
   - [ ] Email input field present
   - [ ] Submit button enabled
5. Fill form and submit
6. Verify:
   - [ ] Success message appears
   - [ ] Modal closes
   - [ ] Status updates (may need refresh)

#### Test 2.4: Admin Console
1. Navigate to http://localhost:3000/admin
2. Verify login:
   - [ ] Password input displayed
   - [ ] Enter "admin123"
   - [ ] Click "Login"
   - [ ] Dashboard loads
3. Verify admin dashboard:
   - [ ] Filter buttons visible (All, Pending, Approved, Rejected)
   - [ ] Request table displays
   - [ ] Test request visible in table
   - [ ] Wallet address shown
   - [ ] Approve/Reject buttons visible for pending requests
4. Click "Approve" on a request
5. Verify:
   - [ ] Success alert appears
   - [ ] Request status changes to "approved"
   - [ ] Buttons change to status badge

#### Test 2.5: Public Verify Page
1. Navigate to http://localhost:3000/verify
2. Verify initial state:
   - [ ] Input field for wallet address
   - [ ] "Check" button
   - [ ] API documentation section visible
3. Enter wallet address: `account-hash-test123`
4. Click "Check"
5. Verify results:
   - [ ] Green checkmark icon appears
   - [ ] "✓ Verified" badge shown
   - [ ] Tier displays correctly
   - [ ] Issuer name visible
   - [ ] Last KYC date shown
   - [ ] Last liveness date shown

---

### ✅ Phase 3: Manual User Journey (Test this now!)

Follow these exact steps to verify the entire system.

#### 👤 Role 1: The User (You)
**Goal:** Connect wallet and request verification.

1.  **Login**:
    *   Go to [http://localhost:3000](http://localhost:3000)
    *   Click **"Connect"** in top right.
    *   *Action*: Approve the connection in your Casper Wallet popup.
    *   *Verify*: Button changes to "Disconnect" and shows your address (e.g., `01ab...`).

2.  **Request Verification**:
    *   Navigate to **User Dashboard** (or `/me`).
    *   Click **"Request Verification"**.
    *   Select **"Basic Tier"**.
    *   Enter Email: `testuser@example.com`
    *   Click **Submit**.
    *   *Verify*: You see a success message "Verification requested!" and status is **"Pending"**.

— SWITCH ROLES —

#### 👮 Role 2: The Admin (Issuer)
**Goal:** Approve the request and write to blockchain.

1.  **Login**:
    *   Go to [http://localhost:3000/admin](http://localhost:3000/admin)
    *   Password: `admin123`
    *   Click **Login**.

2.  **Approve Request**:
    *   Find the request from your wallet address (it should be at the top).
    *   Click **"Approve"**.
    *   *Wait*: The system is now calling the Smart Contract on testnet...
    *   *Verify*: Status changes to **"Approved"** (Green Badge). You should see a `tx_hash` appear.

— SWITCH ROLES —

3.  **Final Verification**:
    *   Go back to **User Dashboard** (`/me`).
    *   Refresh the page.
    *   *Success*: Status card now shows **"Verified"** with a green checkmark!
    *   *Bonus*: Go to `/verify` and paste your address to see the public proof.

## Troubleshooting

### Backend Issues

**Error: "MongoDB connection error"**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Restart MongoDB
brew services restart mongodb-community

# Check logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

**Error: "Port 3001 already in use"**
```bash
# Find process using port 3001
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3001)
```

**Error: "Cannot find module"**
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Error: "Cannot find module 'react'"**
```bash
# Install dependencies
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

**Error: "Casper Signer not found"**
- Install Casper Signer extension from Chrome Web Store
- Restart browser
- Refresh page

### Database Issues

**Clear test data**:
```bash
# Connect to MongoDB
mongosh

# Switch to casperid database
use casperid

# Clear collections
db.verificationrequests.deleteMany({})
db.credentials.deleteMany({})
db.issuers.deleteMany({})

# Verify
db.verificationrequests.countDocuments()
db.credentials.countDocuments()
```

---

## Test Results Checklist

Mark each test as you complete it:

### Backend API Tests
- [ ] 1.1: Health check passes
- [ ] 1.2: Request verification works
- [ ] 1.3: Get status (unverified) works
- [ ] 1.4: Admin get requests works
- [ ] 1.5: Issue credential works
- [ ] 1.6: Get status (verified) works
- [ ] 1.7: Evaluate requirements works

### Frontend UI Tests
- [ ] 2.1: Landing page loads
- [ ] 2.2: Wallet connection works
- [ ] 2.3: Verification request works
- [ ] 2.4: Admin console works
- [ ] 2.5: Public verify works

### End-to-End Tests
- [ ] E2E 1: Complete flow works
- [ ] E2E 2: Rejection flow works

---

## Performance Testing

### API Response Times
```bash
# Test response times
time curl http://localhost:3001/health
time curl "http://localhost:3001/api/identity-status?wallet=test"
```

**Expected**: < 100ms for most endpoints

### Database Queries
```bash
# MongoDB query performance
mongosh casperid --eval "db.credentials.find({wallet: 'test'}).explain('executionStats')"
```

**Expected**: Queries use indexes, < 10ms execution time

---

## Next Steps After Testing

- [ ] All tests pass
- [ ] Document any bugs found
- [ ] Fix critical issues
- [ ] Deploy contract to Casper testnet
- [ ] Integrate real blockchain
- [ ] Retest with actual Casper network
- [ ] Security audit
- [ ] Production deployment

---

## Notes

- Backend API is fully functional without blockchain integration
- Placeholder tx_hash is generated until Casper contract is deployed
- Casper service functions will be activated after contract deployment
- TypeScript build warnings are expected until all dependencies installed
