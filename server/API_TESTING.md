# CasperID Authentication API Testing

## Prerequisites
Make sure the backend server is running and you have a verified user in the database.

## Test Workflow

### 1. Get Nonce
```bash
curl -X GET http://localhost:3001/api/casperid/nonce
```

**Expected Response:**
```json
{
  "nonce": "abc123...",
  "message": "Sign this nonce with your Casper wallet",
  "expiresIn": 300
}
```

---

### 2. Login (Get JWT Token)

Use a verified wallet address from your database.

```bash
curl -X POST http://localhost:3001/api/casperid/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "020255291b9352372dc996ca427d981ba6d4b452707cea0cf4b198155e591e78eab2",
    "signature": "dummy-signature-for-testing",
    "nonce": "NONCE_FROM_STEP_1",
    "platform": "test-platform.com",
    "requestedData": ["email", "name", "verified"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "wallet": "020255291b9352372dc996ca427d981ba6d4b452707cea0cf4b198155e591e78eab2",
    "humanId": "brave-lion-7x9k",
    "verified": true,
    "tier": "full_kyc",
    "sharedData": ["email", "name", "verified"]
  }
}
```

---

### 3. Verify Token

```bash
curl -X POST http://localhost:3001/api/casperid/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_STEP_2"
  }'
```

**Expected Response:**
```json
{
  "valid": true,
  "user": {
    "wallet": "020255291b9352372dc996ca427d981ba6d4b452707cea0cf4b198155e591e78eab2",
    "humanId": "brave-lion-7x9k",
    "verified": true,
    "tier": "full_kyc",
    "sharedData": ["email", "name", "verified"]
  },
  "platform": "test-platform.com",
  "expiresAt": "2024-12-09T13:00:00.000Z"
}
```

---

### 4. Get Session Info

```bash
curl -X GET http://localhost:3001/api/casperid/session \
  -H "Authorization: Bearer TOKEN_FROM_STEP_2"
```

**Expected Response:**
```json
{
  "active": true,
  "user": {
    "wallet": "020255291b9352372dc996ca427d981ba6d4b452707cea0cf4b198155e591e78eab2",
    "humanId": "brave-lion-7x9k",
    "verified": true,
    "tier": "full_kyc"
  },
  "platform": "test-platform.com",
  "createdAt": "2024-12-08T13:00:00.000Z",
  "expiresAt": "2024-12-09T13:00:00.000Z"
}
```

---

### 5. Refresh Token

```bash
curl -X POST http://localhost:3001/api/casperid/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_STEP_2"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "NEW_JWT_TOKEN",
  "expiresIn": 86400
}
```

---

### 6. Logout

```bash
curl -X POST http://localhost:3001/api/casperid/logout \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_STEP_2"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Testing Error Cases

### Invalid Token
```bash
curl -X POST http://localhost:3001/api/casperid/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalid-token"
  }'
```

**Expected Response:**
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

### Unverified User
```bash
curl -X POST http://localhost:3001/api/casperid/login \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "unverified-wallet-address",
    "signature": "dummy",
    "nonce": "VALID_NONCE"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "User not verified",
  "message": "Please complete verification at casperid.com/me before signing in"
}
```

---

## Integration Test Script

Save this as `test-auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001/api/casperid"
WALLET="020255291b9352372dc996ca427d981ba6d4b452707cea0cf4b198155e591e78eab2"

echo "1. Getting nonce..."
NONCE_RESPONSE=$(curl -s -X GET $BASE_URL/nonce)
NONCE=$(echo $NONCE_RESPONSE | jq -r '.nonce')
echo "Nonce: $NONCE"
echo ""

echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d "{
    \"wallet\": \"$WALLET\",
    \"signature\": \"test-signature\",
    \"nonce\": \"$NONCE\",
    \"platform\": \"test-platform.com\",
    \"requestedData\": [\"email\", \"name\"]
  }")
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"
echo ""

echo "3. Verifying token..."
curl -s -X POST $BASE_URL/verify-token \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq
echo ""

echo "4. Getting session..."
curl -s -X GET $BASE_URL/session \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo "5. Logging out..."
curl -s -X POST $BASE_URL/logout \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TOKEN\"}" | jq
```

Make executable:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## Environment Variables Required

Add to `server/.env`:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
TOKEN_EXPIRATION=24h
```

---

## Checklist

- [ ] Backend server running on port 3001
- [ ] MongoDB connected
- [ ] At least one verified user in database
- [ ] `JWT_SECRET` set in `.env`
- [ ] All auth routes registered in `index.js`
- [ ] Test nonce generation
- [ ] Test login flow
- [ ] Test token verification
- [ ] Test session management
- [ ] Test logout
