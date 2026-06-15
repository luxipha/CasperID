# WebAuthn RP ID Migration

## Target Architecture

CasperID uses one permanent WebAuthn relying party ID:

```text
RP ID: casperid.com
Hosted authentication origin: https://account.casperid.com
```

`account.casperid.com` can create and use credentials scoped to `casperid.com`
because `casperid.com` is its registrable domain suffix.

Affiliate pages must not call WebAuthn directly. They redirect to the hosted
CasperID authorization page, which performs WebAuthn and returns a short-lived
authorization code to the affiliate callback.

## Production Configuration

```env
WEBAUTHN_RP_ID=casperid.com
WEBAUTHN_ORIGIN=https://account.casperid.com,https://casperid.com
ACCOUNT_FRONTEND_URL=https://account.casperid.com
FRONTEND_URL=https://casperid.com
```

Do not derive `rpId` from the HTTP `Origin` header. An affiliate-controlled
origin would create an affiliate-scoped credential that cannot authenticate on
CasperID or another affiliate.

## Delivery Phases

### Phase 1: Stabilize RP ID

- Always generate registration and authentication options with the configured
  `WEBAUTHN_RP_ID`.
- Store `rp_id` on new credential records.
- After a successful authentication, backfill missing `rp_id` values.
- Reject stored credentials explicitly associated with another RP ID.
- Capture authenticator transports using `getTransports()`.

### Phase 2: Hosted Authorization

- Add `GET https://account.casperid.com/authorize`.
- Validate `client_id`, exact `redirect_uri`, `state`, and PKCE parameters.
- Perform passkey authentication only on `account.casperid.com`.
- Issue a short-lived, single-use authorization code.
- Add a backend token exchange endpoint that returns a business token.

Server foundation implemented:

- `GET /api/oauth/authorize/validate`
- `POST /api/oauth/authorize/complete`
- `POST /api/oauth/token`
- Exact `BusinessApp.redirect_uris` registration

### Phase 3: SDK Migration

- Replace direct affiliate-domain WebAuthn with a hosted redirect.
- Prefer full-page redirects on mobile.
- Support popup plus exact-origin `postMessage` handling on desktop.
- Keep a redirect fallback when popups are blocked.

### Phase 4: Existing Credential Migration

- Credentials that successfully authenticate with `rpId: casperid.com` are
  backfilled automatically.
- Credentials created for affiliate RP IDs cannot be converted.
- Recover affected users with OTP, then register a new `casperid.com` passkey.
- Revoke affiliate-scoped credentials after replacement.

### Phase 5: Rollout

- Deploy `account.casperid.com` and verify TLS.
- Test mobile Safari, mobile Chrome, desktop Safari, Chrome, Edge, and Firefox.
- Monitor RP-ID mismatch and recovery rates.
- Remove direct WebAuthn calls from affiliate SDK integrations.
