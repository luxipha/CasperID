# Business Platform Issues Tracker

> Audit Date: 2026-02-26
> Status: 85% Feature Complete (9/11 issues resolved)

Use this file to track and resolve issues one at a time. Mark items with `[x]` when completed.

---

## Critical Issues

### 1. Frontend Pages Using Mock Data
- [x] **Analytics.tsx** - Connected to `/api/business/stats`, shows real data with "coming soon" for time-series
- [x] **Billing.tsx** - Connected to stats API, shows real usage metrics, billing marked as "coming soon"
- [x] **Settings.tsx** - Removed mock team data, shows "coming soon" state for team management
- [x] **IntegrationDetail.tsx** - Fetches real app data via `/api/business/apps/:app_id`, saves via PATCH

**Files:** `pages/Analytics.tsx`, `pages/Billing.tsx`, `pages/Settings.tsx`, `pages/IntegrationDetail.tsx`

**Status:** RESOLVED (2026-02-26)

---

### 2. Missing Analytics API
- [ ] Implement `GET /api/business/usage/chart` endpoint
- [ ] Add time-range filtering (7d, 30d, 90d)
- [x] Connect Analytics.tsx to real API data (using existing `/api/business/stats`)

**Backend File:** `server/src/routes/business.js`
**Frontend File:** `frontend/business/pages/Analytics.tsx`

**Note:** Basic stats connected. Time-series charts show "Coming Soon" placeholder until chart API is implemented.

---

### 3. No Webhook Delivery Logs
- [x] Create `WebhookLog` schema in models.js (with 30-day TTL auto-expiry)
- [x] Implement `GET /api/business/webhooks/:id/logs` endpoint (with pagination and stats)
- [x] Implement `GET /api/business/webhooks/logs/:log_id` endpoint for detail view
- [x] Add webhook log UI in Webhooks.tsx (modal with stats, table view)
- [x] Update webhook dispatcher to log all deliveries

**Files:**
- `server/src/database/models.js`
- `server/src/routes/business.js`
- `server/src/utils/webhook-dispatcher.js`
- `frontend/business/pages/Webhooks.tsx`

**Status:** RESOLVED (2026-02-26)

---

### 4. No Team/Organization Management
- [ ] Create `Organization` schema
- [ ] Create `TeamMember` schema
- [ ] Create `Invite` schema
- [ ] Implement team API endpoints
- [ ] Connect Settings.tsx to real APIs

**Files:**
- `server/src/database/models.js`
- `server/src/routes/business.js` (new routes needed)
- `frontend/business/pages/Settings.tsx`

---

## Code Quality Issues

### 5. Magic Strings for Event Types
- [x] Create `server/src/constants/webhook-events.js` with WEBHOOK_EVENTS, SUBSCRIBABLE_EVENTS, ALL_EVENTS
- [x] Create `frontend/business/constants/webhook-events.ts` with types and labels
- [x] Update `Webhooks.tsx` to use constants
- [x] Update `models.js` to use ALL_EVENTS constant
- [x] Update `passkey-auth.js` to use WEBHOOK_EVENTS
- [x] Update `business.js` to use WEBHOOK_EVENTS
- [x] Update `webhook-dispatcher.js` to use WEBHOOK_EVENTS

**Files updated:**
- `server/src/constants/webhook-events.js` (new)
- `frontend/business/constants/webhook-events.ts` (new)
- `server/src/database/models.js`
- `server/src/routes/passkey-auth.js`
- `server/src/routes/business.js`
- `server/src/utils/webhook-dispatcher.js`
- `frontend/business/pages/Webhooks.tsx`

**Status:** RESOLVED (2026-02-26)

---

### 6. Inconsistent Error Handling
- [x] Review all endpoints in `business.js`
- [x] Remove redundant `res.headersSent` checks (line 152-154)
- [x] Standardize error response format (all endpoints use `{ success: false, error: '...' }`)

**File:** `server/src/routes/business.js`

**Status:** RESOLVED (2026-02-26)

---

### 7. Hardcoded Salt Rounds
- [x] Move `SALT_ROUNDS = 12` to environment variable
- [x] Update `business.js` to read from `process.env.BCRYPT_SALT_ROUNDS` with fallback to 12

**File:** `server/src/routes/business.js`

**Status:** RESOLVED (2026-02-26)

---

### 8. Redundant Model Definitions
- [x] Determine if `DappIntegration` (lines 1116-1172) is still needed
- [x] **Conclusion:** NOT redundant - `DappIntegration` is for MetaMask ERC-7715 permissions, `BusinessApp` is for Business Platform API
- [x] Both schemas serve different features and should be kept

**File:** `server/src/database/models.js`

**Status:** RESOLVED (2026-02-26) - Investigation complete, models serve different purposes

---

### 9. Duplicated Webhook Signature Logic
- [x] Refactor test webhook endpoint to use shared function
- [x] Export `sendTestWebhook()` from `webhook-dispatcher.js`
- [x] Update test endpoint to use `sendTestWebhook()` instead of duplicating logic

**Files:**
- `server/src/routes/business.js`
- `server/src/utils/webhook-dispatcher.js`

**Status:** RESOLVED (2026-02-26)

---

## Security Issues

### 10. No Rate Limiting on Business Routes
- [x] Add rate limiting middleware for `/api/business` routes
- [x] Configure limits per endpoint:
  - `business_api`: 60 req/min (general)
  - `business_webhook_test`: 5 req/min (test webhooks)
  - `business_api_key_create`: 10 req/hour (app creation, key rotation)

**Files:**
- `server/src/utils/rate-limiter.js` (added business rate limits)
- `server/src/routes/business.js` (applied middleware)

**Status:** RESOLVED (2026-02-26)

---

### 11. Fire-and-Forget Webhooks (No Retry)
- [x] Implement in-memory retry queue
- [x] Add exponential backoff retry logic (5 retries: 1s, 5s, 30s, 2min, 5min)
- [x] Added `retry_count` field to WebhookLog schema
- [x] Added `X-CasperID-Retry` header for retry tracking

**Files:**
- `server/src/utils/webhook-dispatcher.js` (retry logic)
- `server/src/database/models.js` (retry_count field)

**Note:** Using in-memory queue for simplicity. Consider Bull/BullMQ for production scale with Redis persistence.

**Status:** RESOLVED (2026-02-26)

---

## Future Enhancements

These are not bugs but features to consider:

- [ ] Billing/Stripe integration
- [ ] SDK packaging for NPM/CDN distribution
- [ ] Custom domain support for webhook URLs
- [ ] IP whitelisting for webhook endpoints
- [ ] Advanced analytics (retention, cohort analysis)
- [ ] Webhook signature algorithm options (HMAC-SHA512)

---

## 

---

## Notes

- All business routes registered at `server/src/index.js:179`
- Tests available at `server/test-business-api.js`
- Roadmap document at `/business.md`

## To be updated:

Dashboard Update: We add a "Default Verification Tier" setting in the Business Dashboard (Integrations/Settings page).
SDK sync: When the SDK initializes, it fetches this configuration along with the theme.
Automatic Step-up: If the developer doesn't pass a requiredTier prop, the SDK would default to the tier set in the dashboard.




// 1. Send OTP
  POST https://apis.casperid.com/api/auth/send-otp
  Headers: { "X-App-Id": "app_xyz123" }
  Body: { "email": "user@example.com" }
  Response: { "verificationId": "uuid-123" }

  // 2. Verify OTP
  POST https://apis.casperid.com/api/auth/verify-otp
  Headers: { "X-App-Id": "app_xyz123" }
  Body: { "verificationId": "uuid-123", "otp": "123456" }
  Response: { "sessionToken": "...", "business_token": "..." }

  // 3. Start KYC Verification (Layer 2 - Liveness)
  POST https://apis.casperid.com/api/v2/verification/layer2/start
  Headers: { "Authorization": "Bearer <sessionToken>" }
  Response: { "requestId": "req-789" }

  // 4. Upload Liveness Frames
  POST https://apis.casperid.com/api/v2/verification/liveness
  Body: FormData with video/images + requestId

  // 5. Verify Token on Your Backend
  POST https://apis.casperid.com/api/casperid/verify-token
  Body: { "token": "<business_token>" }
  Response: { "valid": true, "user": { "wallet": "...", "tier": "L2", ... }}

  ---
  Your Current API Endpoints (Already Built!)

  Based on your codebase, here are the key endpoints for headless integration:

  Authentication APIs
  Endpoint: /api/auth/send-otp
  Method: POST
  Purpose: Send verification code to email
  ────────────────────────────────────────
  Endpoint: /api/auth/verify-otp
  Method: POST
  Purpose: Verify OTP and create session
  ────────────────────────────────────────
  Endpoint: /api/passkey-auth/register/init
  Method: POST
  Purpose: Start passkey registration
  ────────────────────────────────────────
  Endpoint: /api/passkey-auth/auth/init
  Method: POST
  Purpose: Start passkey authentication
  Verification APIs (KYC)
  Endpoint: /api/v2/verification/layer2/start
  Method: POST
  Purpose: Start Layer 2 (liveness)
    verification
  ────────────────────────────────────────
  Endpoint: /api/v2/verification/liveness
  Method: POST
  Purpose: Submit liveness check (video/images)
  ────────────────────────────────────────
  Endpoint: /api/v2/verification/layer3/start
  Method: POST
  Purpose: Start Layer 3 (full KYC)
  ────────────────────────────────────────
  Endpoint: /api/v2/verification/layer3/documents/upload
  Method: POST
  Purpose: Upload ID documents
  ────────────────────────────────────────
  Endpoint: /api/v2/verification/:requestId/status
  Method: GET
  Purpose: Check verification status
  Business Integration APIs
  Endpoint: /api/casperid/verify-token
  Method: POST
  Purpose: Verify business_token server-side
  ────────────────────────────────────────
  Endpoint: /api/business/app-metadata/:app_id
  Method: GET
  Purpose: Get app branding/config
  ---
  How Competitors Do It

  You're right - many verification companies offer both SDK and API options:

  Onfido

  - SDK: React/iOS/Android SDKs with pre-built UI
  - API-Only: "Studio" - developers build custom UI, call REST APIs

  Persona

  - SDK: Embedded iframe/modal
  - API-Only: Custom flows via API endpoints

  Stripe Identity

  - SDK: VerificationSession component
  - API-Only: Direct API integration with custom UI

  ---
  Why Offer Both SDK + API?
  Approach: SDK
  Best For: Fast integration, trust the
    pre-built UI
  Developer Effort: Low (plug-and-play)
  UX Control: Low (pre-styled)
  ────────────────────────────────────────
  Approach: API-Only
  Best For: Custom branding, mobile apps,
    unique flows
  Developer Effort: High (build UI from
    scratch)
  UX Control: High (total control)
  ---
  What You Should Do

  Your backend APIs are already ready for headless integration! You just need to:

  1. Create API Documentation

  Document the endpoints for developers who want API-only integration:
  - Authentication flow
  - Verification flow (Layer 2, Layer 3)
  - Token verification
  - Error codes
  - Rate limits

  2. Add to Your Business Dashboard

  In your business portal, add a section:
  Integration Options:
  ○ React SDK (Recommended) - Pre-built UI components
  ○ REST API - Build your own UI

  3. Provide Code Examples

  // Example: Custom Login Flow
  async function customLogin(email) {
    const { verificationId } = await casperID.sendOTP(email);
    const otp = await showCustomOTPInput(); // Your UI
    const { business_token } = await casperID.verifyOTP(verificationId, otp);
    return business_token;
  }

  4. Consider API Libraries (Optional, Later)

  Make it even easier with helper libraries:
  // @casperid/api-client (future)
  import CasperIDClient from '@casperid/api-client';

  const client = new CasperIDClient({ apiKey: 'app_xyz' });
  await client.auth.sendOTP('user@example.com');

  ---
  Summary

  ✅ Yes, API-only integration is ALREADY possible with your current backend
  ✅ Your SDK just calls these same APIs under the hood
  ✅ You just need to document the APIs publicly
  ✅ This unlocks:
  - Mobile apps (React Native, Flutter, Swift, Kotlin)
  - Backend-only flows (server-side verification)
  - Custom UIs (developers with specific branding needs)

  Would you like me to help you create API documentation for headless integration?

✻ Cooked for 1m 32s
