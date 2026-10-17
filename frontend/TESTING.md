# Manual Testing Guide

This section documents **manual test cases** for the CasperID frontend, business portal, admin dashboard, and SDK. Each test case describes the steps to perform, the expected result, and which states to verify.

---

## Prerequisites

| Item | Details |
|------|---------|
| **Browser** | Chrome 120+, Safari 17+, Firefox 120+ |
| **Dev server** | `cd frontend && npm run dev` (port 3000) |
| **Backend** | Local backend on port 3001 (or configured API) |
| **Test accounts** | Admin credentials, test user email, business account |
| **Mobile device** | For cross-device flows (QR code, passkey handoff) |
| **WebAuthn** | Device with biometric sensor (Face ID, Touch ID, Windows Hello) |
| **Camera** | For liveness checks and document scanning |
| **Browser extension** | CasperID extension installed for extension flows |

---

## 1. AUTHENTICATION FLOW

### 1.1 AuthEntry — Landing & Email Entry

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-AUTH-01: Initial render** | 1. Navigate to `/dashboard` <br>2. Observe the auth entry screen | CasperID branding shown. Email input field visible. "Continue with Email" button visible and disabled. Google and Apple SSO buttons visible and disabled. |
| **TC-AUTH-02: Branded variant** | 1. Navigate to an app's auth page (with `appLogo` and `appName` params) | Header shows "Authorize **AppName**" with the app's logo alongside CasperID branding. |
| **TC-AUTH-03: Email validation** | 1. Type an invalid email like "abc" <br>2. Click "Continue with Email" | Email input remains focused. Button doesn't trigger API call. |
| **TC-AUTH-04: Successful OTP send (new user)** | 1. Enter a valid email not previously registered <br>2. Click "Continue with Email" | Button shows loading spinner and "Sending..." text. After success, transitions to OTP verification screen. |
| **TC-AUTH-05: OTP send error** | 1. Enter a valid email <br>2. Mock the API to return an error <br>3. Click "Continue with Email" | Error banner appears below the form with the error message. User can retry. |
| **TC-AUTH-06: Returning user with passkey** | 1. Enter an email that has a passkey registered <br>2. Click "Continue with Email" | System detects returning user. Triggers biometric prompt (Face ID / Touch ID). |
| **TC-AUTH-07: Network failure handling** | 1. Disconnect network <br>2. Enter email and submit | Error banner with connection error message. |

---

### 1.2 OTPVerify — Code Verification

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-OTP-01: Initial render** | 1. After AuthEntry with valid email <br>2. Observe OTP screen | 6 digit input boxes displayed. User's email shown (masked partially). "Verify & Continue" button disabled. Resend timer at 59s. "Change Email" link visible. |
| **TC-OTP-02: Digit entry** | 1. Type "1" in first box | Focus auto-advances to next input. Each input accepts one digit. |
| **TC-OTP-03: Backspace navigation** | 1. Fill first 2 digits <br>2. Press Backspace on second input | Focus moves back to first input. First input value cleared. |
| **TC-OTP-04: All digits entered** | 1. Enter all 6 digits | "Verify & Continue" button becomes enabled. |
| **TC-OTP-05: Successful verification** | 1. Enter correct 6-digit code <br>2. Click "Verify & Continue" | Loading state shown. On success, transitions to onboarding or dashboard. |
| **TC-OTP-06: Invalid code** | 1. Enter incorrect 6-digit code <br>2. Click "Verify & Continue" | Error banner: "Invalid code. X attempts remaining." |
| **TC-OTP-07: Resend timer** | 1. Wait 59 seconds | Timer counts down. After reaching 0, "Resend code now" link appears. |
| **TC-OTP-08: Resend code** | 1. Wait for timer to expire <br>2. Click "Resend code now" | API call to resend OTP. Timer resets to 59s. OTP inputs cleared. |
| **TC-OTP-09: Change email** | 1. Click "Change Email" link | Returns to AuthEntry screen. Email input retains the previously entered email. |

---

### 1.3 OnboardingStart — Passkey Registration

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-ONB-01: Initial render** | 1. After OTP verification <br>2. Observe onboarding screen | Email display shown. "Create Passkey" button. "Use my phone instead" option visible. |
| **TC-ONB-02: Biometrics available** | 1. On a device with Face ID / Touch ID <br>2. Observe the screen | Messaging indicates biometric authentication is available. |
| **TC-ONB-03: Biometrics unavailable** | 1. On a device without biometrics <br>2. Observe the screen | "Use my phone instead" option is prominent. |
| **TC-ONB-04: Successful passkey creation** | 1. Click "Create Passkey" <br>2. Complete the biometric prompt | Loading state. On success, transitions to dashboard. |
| **TC-ONB-05: Passkey creation failure** | 1. Click "Create Passkey" <br>2. Cancel the biometric prompt | Error message shown. User can retry or choose mobile handoff. |
| **TC-ONB-06: Mobile handoff** | 1. Click "Use my phone instead" <br>2. QR code appears <br>3. Scan with phone | Transitions to cross-device pairing flow. |

---

### 1.4 CrossDevicePairing — QR Code Pairing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-CDP-01: Initializing** | 1. Select mobile handoff <br>2. Observe loading state | "Initializing..." message with spinner. |
| **TC-CDP-02: QR code display** | 1. After initialization | QR code image displayed. Countdown timer shown (5 min). |
| **TC-CDP-03: QR code expiry** | 1. Wait for 5 minutes | QR code auto-refreshes. Timer resets. |
| **TC-CDP-04: Successful pairing** | 1. Scan QR code with mobile device <br>2. Complete registration on mobile | Polling detects completion. Transitions to success state. |
| **TC-CDP-05: Pairing failure** | 1. Let QR code expire without scanning | Error state with retry option. |

---

## 2. DASHBOARD SCREENS

### 2.1 Dashboard Home

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-DSH-01: Dashboard render** | 1. Log in successfully <br>2. Observe dashboard | IdentityStatusCard, TrustScoreCard, KYC card, ConnectedPlatforms, RecentActivity, Tools all render. |
| **TC-DSH-02: Verification level banner** | 1. User with L1 tier | Banner shows current tier and upgrade prompt. |
| **TC-DSH-03: Trust score** | 1. Observe trust score card | Score displayed with breakdown. |
| **TC-DSH-04: Recent activity** | 1. Observe activity section | Most recent activity items displayed with timestamps. |

---

### 2.2 Profile

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-PRF-01: Profile loading** | 1. Navigate to profile <br>2. Observe | Profile data loads. Sections appear for experience, education, skills, certifications, projects, awards, volunteer, language. |
| **TC-PRF-02: Empty profile** | 1. User with no profile data | All sections show empty states or "Add" prompts. |
| **TC-PRF-03: Add experience** | 1. Click "Add Experience" <br>2. Fill in form fields <br>3. Submit | New experience entry appears in the list. |
| **TC-PRF-04: Edit experience** | 1. Click edit on existing experience <br>2. Modify fields <br>3. Save | Updated information reflected. |
| **TC-PRF-05: Delete experience** | 1. Click delete on existing experience <br>2. Confirm deletion | Entry removed from list. |
| **TC-PRF-06: Resume parsing** | 1. Upload a resume file <br>2. Wait for parsing | Profile fields auto-populated from resume. |
| **TC-PRF-07: ATS score** | 1. Ensure profile has data <br>2. Navigate to ATS score | Score displayed with breakdown and feedback. |
| **TC-PRF-08: Profile preview** | 1. Click "Preview" | Modal shows public-facing profile view. |
| **TC-PRF-09: Open to Work toggle** | 1. Toggle "Open to Work" | Profile marked as open to opportunities. |
| **TC-PRF-10: Tab switching** | 1. Switch between "Profile" and "About" tabs | Different content sections displayed. |

---

### 2.3 KYC Flow

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-KYC-01: KYC home** | 1. Navigate to KYC section <br>2. Observe dashboard | Current KYC level displayed. Available upgrade options shown. |
| **TC-KYC-02: L2 liveness check** | 1. Start L2 verification <br>2. Position face in camera <br>3. Follow prompts (blink, turn head) | Camera activates. Face detection overlay. Liveness check processes. On success, L2 tier confirmed. |
| **TC-KYC-03: L2 success** | 1. Complete liveness check | Success screen with tier upgrade message. |
| **TC-KYC-04: L3 method selection** | 1. Start L3 upgrade <br>2. Choose NIMC or Document method | Selected method flow begins. |
| **TC-KYC-05: NIMC number entry** | 1. Select NIMC method <br>2. Enter NIMC number | Validation. If valid, proceed to OTP. |
| **TC-KYC-06: NIMC OTP** | 1. Enter NIMC number <br>2. Receive OTP on phone <br>3. Enter OTP | Verification in progress. |
| **TC-KYC-07: Document selection** | 1. Select Document method <br>2. Choose passport/driver's license/national ID | Document type highlighted. Proceed to upload. |
| **TC-KYC-08: Document upload** | 1. Choose document type <br>2. Upload front image <br>3. Upload back image | Upload progress shown. Preview of uploaded images. |
| **TC-KYC-09: Data review** | 1. After document processing <br>2. Review extracted data | First name, last name, DOB, document number displayed. |
| **TC-KYC-10: Edit extracted data** | 1. Click edit on incorrect field <br>2. Enter correct value | Data updated. |
| **TC-KYC-11: Submit for review** | 1. Confirm all data correct <br>2. Submit | Processing screen. On success, "Verification Submitted" screen. |
| **TC-KYC-12: KYC processing** | 1. Submit verification <br>2. Wait for processing | Spinner with status messages (validating docs, broadcasting transaction). |
| **TC-KYC-13: KYC full success** | 1. Verification approved | Celebration animation. Tier upgrade message. Continue button. |
| **TC-KYC-14: L3 pending check** | 1. User with pending L3 upgrade <br>2. Navigate to KYC | System detects pending status. Shows "in review" state. |

---

### 2.4 DID Management

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-DID-01: DID list** | 1. Navigate to DID management | User DID address displayed. Context DIDs listed with alias, context, routing type. |
| **TC-DID-02: No DID yet** | 1. New user without DID | Empty state with "Create DID" prompt. |
| **TC-DID-03: Mint DID** | 1. Click "Create DID" | API call to mint DID. On success, DID appears in list. |
| **TC-DID-04: Manage context DID** | 1. Click on existing context DID | Detail view with configuration options. |
| **TC-DID-05: Export keys** | 1. Click "Export Keys" | Key download or copy to clipboard. |

---

### 2.5 CNS Name Registration (RegisterCID)

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-CNS-01: Name search** | 1. Navigate to CNS registration <br>2. Enter a name <br>3. Check availability | "Searching..." state while checking. Available: green indicator. Taken: red indicator. |
| **TC-CNS-02: Available name** | 1. Search for an available name | Proceed to payment screen. Year selection (1-5 years). |
| **TC-CNS-03: Name taken** | 1. Search for a taken name | "Name taken" message. Suggestions for alternatives. |
| **TC-CNS-04: Registration flow** | 1. Available name <br>2. Select years <br>3. Select payment method (crypto/fiat) <br>4. Apply promo code (optional) <br>5. Complete registration | Processing state. Transaction hash shown. Success screen with registered name. |
| **TC-CNS-05: Promo code** | 1. Click "Apply Promo Code" <br>2. Enter valid code | Discount applied to pricing. |
| **TC-CNS-06: Invalid promo code** | 1. Enter invalid code | Error message shown. |
| **TC-CNS-07: Explanation modal** | 1. Click info icon next to CID name | Modal explains what CNS/CID is. |

---

### 2.6 Credential Vault

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-CRV-01: Credentials tab** | 1. Navigate to Credential Vault <br>2. Select "Credentials" tab | List of verified credentials with issuer, status, date. |
| **TC-CRV-02: Identities tab** | 1. Select "Identities" tab | Master and persona identities displayed with DIDs. |
| **TC-CRV-03: ZK verified badge** | 1. Observe a ZK-verified credential | Badge/icon indicates zero-knowledge verification status. |
| **TC-CRV-04: Share credential** | 1. Click share on a credential | QR code modal opens for sharing. |
| **TC-CRV-05: Empty state** | 1. User with no credentials | Appropriate empty state message. |

---

### 2.7 Settings

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SET-01: General tab** | 1. Navigate to Settings <br>2. Observe General tab | Display name, email, DOB fields populated from profile. |
| **TC-SET-02: Edit profile** | 1. Modify display name <br>2. Save | API call to update. Success feedback. |
| **TC-SET-03: Wallets tab** | 1. Switch to Wallets tab | Connected wallet addresses displayed. Connect/disconnect options. |
| **TC-SET-04: Security tab** | 1. Switch to Security tab | Passkey management. 2FA toggle (if available). |
| **TC-SET-05: Notifications tab** | 1. Switch to Notifications | Preference toggles for different notification types. |
| **TC-SET-06: Permissions tab** | 1. Switch to Permissions | Connected apps with granted permissions list. |

---

### 2.8 Data Controls

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-DCT-01: Connected apps** | 1. Navigate to Data Controls | List of apps with access. Permissions displayed per app. |
| **TC-DCT-02: Revoke access** | 1. Click revoke on an app <br>2. Confirm | App removed from list. API call to revoke permissions. |
| **TC-DCT-03: Privacy score** | 1. Observe privacy score | Score calculated and displayed. |
| **TC-DCT-04: Audit log** | 1. Scroll to audit log section | History of permission grants and revocations. |

---

### 2.9 Activity Log

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-ACT-01: Activity list** | 1. Navigate to Activity Log | Paginated list of activities with timestamps. |
| **TC-ACT-02: Empty state** | 1. User with no activity | "No activity yet" message. |
| **TC-ACT-03: Search** | 1. Type in search box | List filters to matching items in real-time. |
| **TC-ACT-04: Status filter** | 1. Select a status filter | List filters to selected status (success, pending, failed). |
| **TC-ACT-05: Event type filter** | 1. Select an event type | List filters to matching event types. |
| **TC-ACT-06: Pagination** | 1. Click "Next Page" | Next page of activities loads. |

---

## 3. BUSINESS PORTAL

### 3.1 Layout & Navigation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-BIZ-01: Sidebar navigation** | 1. Navigate to `/business` | Sidebar displays: Overview, Integrations, SDK Design, API Management, Webhooks, Analytics, Billing, Docs, Settings. |
| **TC-BIZ-02: Active nav highlight** | 1. Click "API Management" in sidebar | API Management nav item highlighted. |
| **TC-BIZ-03: Mobile sidebar** | 1. Resize browser to mobile width <br>2. Click hamburger menu | Sidebar slides in. Overlay backdrop. Click overlay closes sidebar. |
| **TC-BIZ-04: Notification panel** | 1. Click bell icon | Notification panel opens. List of mock notifications. "Mark all as read" link. |
| **TC-BIZ-05: User profile** | 1. Observe sidebar bottom | User display name and email shown. |
| **TC-BIZ-06: Search** | 1. Type in search bar | Search input accepts text (visual only, no results yet). |
| **TC-BIZ-07: Create New button** | 1. Click "Create New" in header | Navigates to API Management with create modal open. |

---

### 3.2 Overview Dashboard

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-OVR-01: Stats cards** | 1. Navigate to Overview | Total Verifications, Active Apps, System Status cards displayed with data. |
| **TC-OVR-02: Activity heatmap** | 1. Observe heatmap section | GitHub-style contribution grid. Colored cells based on activity. Month and day labels. Legend. |
| **TC-OVR-03: No activity** | 1. New business with no activity | "No activity yet" message in recent activity feed. Heatmap shows empty grid. |
| **TC-OVR-04: Recent activity feed** | 1. Observe activity section | Mock activity items with timestamp and status. |
| **TC-OVR-05: Quick actions** | 1. Observe right sidebar | "Integration Guide" dark card. "Read Documentation" link. Quick links to API Management, Webhooks, Settings. |

---

### 3.3 Integrations (App List)

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-INT-01: App cards** | 1. Navigate to Integrations | Cards for each app showing name, environment badge (Production/Sandbox), status (Active/Inactive), origins. |
| **TC-INT-02: Empty state** | 1. Business with no apps | "No Apps Found" with link to API Management. |
| **TC-INT-03: Click app card** | 1. Click on an app card | Navigates to Integration Detail for that app. |
| **TC-INT-04: Create New button** | 1. Click "Create New" | Navigates to API Management with `?create=true`. |

---

### 3.4 Integration Detail

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-INTD-01: App configuration** | 1. Navigate to an integration detail | App name, website fields populated. Environment toggle (Sandbox/Production). Listing status toggle. Logo upload. |
| **TC-INTD-02: Edit app name** | 1. Change app name <br>2. Click "Save Changes" | API call to save. Success toast notification. |
| **TC-INTD-03: Environment toggle** | 1. Toggle Production mode | Switch changes from sandbox to production. |
| **TC-INTD-04: Verification tier** | 1. Click L1/L2/L3 button | Selected tier highlighted with primary color. |
| **TC-INTD-05: Proof toggles** | 1. Toggle Liveness, Age, Email proofs | Each proof can be independently enabled/disabled. |
| **TC-INTD-06: Logo upload** | 1. Click "Upload new logo" <br>2. Select an image file | Upload progress. Preview of uploaded logo. |
| **TC-INTD-07: Redirect URLs** | 1. Click "Add URL" in Redirect Configuration <br>2. Enter a URL <br>3. Click "Add URL" | URL added to allowed origins list. |
| **TC-INTD-08: Invalid redirect URL** | 1. Open add URL modal <br>2. Enter invalid URL <br>3. Click Add | Error toast: "Invalid URL format". |
| **TC-INTD-09: Remove redirect URL** | 1. Click delete icon on an origin | URL removed from list. |
| **TC-INTD-10: Android configuration** | 1. Click "Add Android App" <br>2. Enter package name and fingerprints | Android app added to list. |
| **TC-INTD-11: Back navigation** | 1. Click "Back to Integrations" | Returns to integrations list. |
| **TC-INTD-12: App not found** | 1. Navigate to invalid app ID | "App not found" error with back link. |
| **TC-INTD-13: Activity heatmap** | 1. Scroll to activity section | Heatmap for this specific app. |

---

### 3.5 API Management

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-API-01: App selector** | 1. Navigate to API Management <br>2. Select an app from dropdown | Credentials for selected app displayed. |
| **TC-API-02: Empty state** | 1. No apps created | "No apps yet" with "Create First App" button. |
| **TC-API-03: Create app** | 1. Click "New App" <br>2. Enter app name <br>3. Select environment <br>4. Add allowed origins <br>5. Click "Create App" | Loading state. On success, secret reveal modal appears. |
| **TC-API-04: Secret reveal** | 1. Create a new app | Modal: "Save your API Secret" with the secret displayed. Copy button works. |
| **TC-API-05: Copy app ID** | 1. Click copy icon next to App ID | Text copied to clipboard. "Copied" indicator briefly shown. |
| **TC-API-06: Rotate secret** | 1. Click "Rotate Secret" <br>2. Confirm in dialog | Loading state. New secret revealed in modal. |
| **TC-API-07: Delete app** | 1. Click "Delete" in danger zone <br>2. Confirm | App deleted. List refreshes. |
| **TC-API-08: Usage stats** | 1. Observe right panel | Monthly usage bar. Request count / 1000. Upgrade Plan button. |
| **TC-API-09: Upgrade plan modal** | 1. Click "Upgrade Plan" | Modal with 3 plans: Standard ($0), Developer ($45/mo), Enterprise (Custom). |
| **TC-API-10: All apps list** | 1. Scroll to "All Applications" | Sidebar list of all apps. Click to select. |

---

### 3.6 Webhooks

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-WHK-01: App selector** | 1. Navigate to Webhooks <br>2. Select an app | Webhook list for selected app displayed. |
| **TC-WHK-02: No apps** | 1. Business with no apps | "No Apps Found" message. |
| **TC-WHK-03: Create webhook** | 1. Enter payload URL <br>2. Select events <br>3. Click "Save Endpoint" | Loading state. Signing secret revealed. |
| **TC-WHK-04: Signing secret** | 1. Create webhook | "Signing Secret (Save Now)" box with secret. Warning that it won't be shown again. |
| **TC-WHK-05: Empty webhooks** | 1. App with no webhooks | "No Data" empty state. |
| **TC-WHK-06: Delete webhook** | 1. Click delete icon on a webhook | Confirm dialog. On confirm, webhook removed from list. |
| **TC-WHK-07: Test webhook** | 1. Click play/test button on a webhook | Loading state. Test result displayed with JSON payload. |
| **TC-WHK-08: View delivery logs** | 1. Click logs icon on a webhook | Logs modal opens. Stats summary: successful, failed, avg duration. Log entries table. |
| **TC-WHK-09: Log details** | 1. Open logs modal <br>2. Observe a log entry | Status badge (Success/Failed/Pending), event type, status code, duration, timestamp. |

---

### 3.7 Analytics

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-ANL-01: Key metrics** | 1. Navigate to Analytics | Total API Requests, Active Apps, Total Apps, System Status cards. |
| **TC-ANL-02: Bar chart** | 1. Business with app usage data | Horizontal bar chart showing top apps by API usage. |
| **TC-ANL-03: Empty chart** | 1. No app usage data | "No app usage data yet" placeholder. |
| **TC-ANL-04: Time-series** | 1. Observe time-series section | "Coming Soon" placeholder. |
| **TC-ANL-05: App breakdown table** | 1. Business with multiple apps | Table: app name, total requests, % of total. |
| **TC-ANL-06: Error state** | 1. API fails to load | Error banner with message. |

---

### 3.8 SDK Design Playground

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SDK-01: App selector** | 1. Navigate to SDK Design | App selector dropdown populated with apps. |
| **TC-SDK-02: No apps** | 1. Business with no apps | "No apps yet — create one in API Management" message. |
| **TC-SDK-03: Load saved config** | 1. Select an app with saved SDK config | Controls populate with saved values. Preview updates. |
| **TC-SDK-04: Color picker** | 1. Click color picker <br>2. Select a new color <br>3. Also type hex value | Both inputs sync. Preview updates in real-time. |
| **TC-SDK-05: Border radius slider** | 1. Drag border radius slider | Preview's button radii change. |
| **TC-SDK-06: Font family** | 1. Select different font | Preview updates with new font. |
| **TC-SDK-07: Language** | 1. Select ES/FR/DE | Preview text changes to selected language. |
| **TC-SDK-08: Layout mode** | 1. Toggle between Auto, Modal, Fullscreen | Preview layout changes accordingly. |
| **TC-SDK-09: Platform toggle** | 1. Switch between Desktop and Mobile | Desktop: shows extension + OTP buttons. Mobile: OTP only. |
| **TC-SDK-10: Dark mode** | 1. Toggle dark mode | Preview switches to dark theme. |
| **TC-SDK-11: Error state preview** | 1. Toggle "Preview Error State" | Preview shows error state. |
| **TC-SDK-12: Save config** | 1. Modify settings <br>2. Click "Save Config" | PATCH API call. Button shows "Saved!" in green. |
| **TC-SDK-13: Config code** | 1. Observe code block | JSON with all current settings displayed. |
| **TC-SDK-14: Copy config** | 1. Click "Copy" on code block | JSON copied to clipboard. |

---

### 3.9 SDKPreview Component

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SDKP-01: Default render** | 1. SDK Preview with default theme | "Welcome back" heading. Fingerprint icon. Extension + OTP buttons. Feature badges. |
| **TC-SDKP-02: Dark mode** | 1. Set isDark=true | Dark background. Light text. Adjusted button styles. |
| **TC-SDKP-03: Custom logo** | 1. Provide logoUrl | Logo image displayed instead of fingerprint icon. |
| **TC-SDKP-04: Mobile platform** | 1. Set platform="mobile" | Extension sign-in button hidden. Only OTP shown. |
| **TC-SDKP-05: Language variants** | 1. Set language to ES, FR, DE | All text translated accordingly. |

---

### 3.10 Billing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-BIL-01: Current plan** | 1. Navigate to Billing | "Free Beta" badge. "Developer Access" plan. $0/month. |
| **TC-BIL-02: Usage metrics** | 1. Observe metrics section | API Requests, Active Apps, Total Apps metrics. |
| **TC-BIL-03: Limits bar** | 1. Observe apps limit | Apps count / 10 progress bar. |
| **TC-BIL-04: Upgrade button** | 1. Click "Upgrade Coming Soon" | Button is disabled. |
| **TC-BIL-05: Upcoming plans** | 1. Scroll to upcoming plans | Starter ($29), Pro ($99), Enterprise (Custom) preview cards. |

---

### 3.11 Docs

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-DOC-01: Documentation sections** | 1. Navigate to Docs | Sidebar with all 18+ documentation sections. |
| **TC-DOC-02: Section navigation** | 1. Click "React SDK Installation" | Content updates to show installation instructions. |
| **TC-DOC-03: Code examples** | 1. Navigate to a section with code | Syntax highlighted code blocks. |

---

### 3.12 Settings (Business)

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-BST-01: Organization profile** | 1. Navigate to Settings | Email and display name fields (disabled). "Coming Soon" tags. |
| **TC-BST-02: Team management** | 1. Observe team section | "Team Collaboration Coming Soon" with planned features preview. |
| **TC-BST-03: Security settings** | 1. Observe security section | 2FA, SSO, Domain Verification, IP Allowlisting — all disabled with "Coming Soon" tags. |

---

## 4. ADMIN DASHBOARD

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-ADM-01: Login form** | 1. Navigate to `/admin` | Login form with username and password fields. "Login" button. |
| **TC-ADM-02: Successful login** | 1. Enter valid admin credentials <br>2. Click "Login" | Authenticated. Redirected to admin console. Request list displayed. |
| **TC-ADM-03: Failed login** | 1. Enter invalid credentials | Error message displayed. |
| **TC-ADM-04: Request list** | 1. After login | Table of verification requests with wallet, email, tier, status. |
| **TC-ADM-05: Filter tabs** | 1. Click "Pending", "Approved", "Rejected", "All" | List filters accordingly. |
| **TC-ADM-06: Empty requests** | 1. No pending requests | "No requests found" message. |
| **TC-ADM-07: Request details** | 1. Click "Details" on a request | Modal with full request details. |
| **TC-ADM-08: Approve request** | 1. Open request details <br>2. Click "Approve" | API call. Success alert. Request removed from pending list. |
| **TC-ADM-09: Reject with reason** | 1. Open request details <br>2. Click "Reject" <br>3. Enter reason | API call. Success alert. |
| **TC-ADM-10: Logout** | 1. Click "Logout" | Returns to login form. |

---

## 5. SDK (Embeddable Modal)

### 5.1 Login Screen

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SLOG-01: Initial render** | 1. Open SDK modal | "Welcome back" heading. Email input. "Continue" button. Security notice. |
| **TC-SLOG-02: Email validation** | 1. Type invalid email <br>2. Click Continue | "Please enter a valid email address" error. |
| **TC-SLOG-03: Empty email** | 1. Click Continue without email | "Please enter your email" error. |
| **TC-SLOG-04: Successful OTP send** | 1. Type valid email <br>2. Click Continue | "Sending Code..." loading state. On success, transitions to PinVerification. |
| **TC-SLOG-05: API error** | 1. Type valid email <br>2. Mock API error | Error message displayed. |
| **TC-SLOG-06: Returning user** | 1. Email with existing passkey | Triggers passkey auth flow. |

---

### 5.2 OTP / PinVerification

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SPIN-01: Initial render** | 1. After sending OTP | 6-digit input. "Enter the 6-digit code" instruction. Email displayed. Timer countdown. |
| **TC-SPIN-02: Complete OTP entry** | 1. Enter all 6 digits | "Verify" button becomes enabled. |
| **TC-SPIN-03: Successful verify** | 1. Enter correct code <br>2. Click Verify | New user → PasskeyRegister. Returning user → PasskeyAuth. |
| **TC-SPIN-04: Invalid code** | 1. Enter wrong code | Error message with attempts remaining. |
| **TC-SPIN-05: Resend** | 1. Wait for timer <br>2. Click "Resend Code" | OTP resent. Timer resets. |

---

### 5.3 Passkey Authentication

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SPAS-01: Passkey prompt** | 1. Trigger passkey auth | System shows "Use Your Passkey" prompt. |
| **TC-SPAS-02: Successful auth** | 1. Complete biometric prompt | Authenticated. Transitions to next screen. |
| **TC-SPAS-03: Auth cancelled** | 1. Cancel biometric prompt | "Authentication cancelled" message. Retry option. |
| **TC-SPAS-04: WebAuthn unavailable** | 1. Browser without WebAuthn | "Your browser doesn't support passkeys" fallback. |

---

### 5.4 Passkey Registration

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SREG-01: Registration prompt** | 1. Trigger passkey registration | "Create Your Passkey" screen. Benefits listed. |
| **TC-SREG-02: Successful registration** | 1. Complete biometric prompt | Passkey created. Transitions to next screen. |
| **TC-SREG-03: Registration cancelled** | 1. Cancel prompt | Error message. Retry option. |

---

### 5.5 FaceScan (Liveness)

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SFAC-01: Camera prompt** | 1. Start face scan | Camera permission request. "Position your face in the frame" instruction. |
| **TC-SFAC-02: Liveness check** | 1. Grant camera permission <br>2. Follow prompts (blink, turn head) | "Analyzing Liveness" processing. On success, proceeds. |
| **TC-SFAC-03: Camera denied** | 1. Deny camera permission | "Camera permission denied" error. |
| **TC-SFAC-04: Liveness failure** | 1. Fail liveness check | Retry option. |

---

### 5.6 Permissions Request

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-SPER-01: Permission list** | 1. Reach permissions screen | List of requested permissions with descriptions. App branding (logo, name). |
| **TC-SPER-02: Approve** | 1. Click "Approve & Verify" | onSuccess callback with session token. |
| **TC-SPER-03: Deny** | 1. Click "Deny" | onClose callback. Modal closes. |

---

## 6. LANDING PAGES

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-LND-01: Landing page** | 1. Navigate to `/` | Cinematic hero section. How It Works. Identity Web. MCI Algorithm. Roadmap. Context-aware sections. |
| **TC-LND-02: Scroll effects** | 1. Scroll down the landing page | Header gains blur background. Animations trigger on scroll. |
| **TC-LND-03: Mobile menu** | 1. Resize to mobile width <br>2. Click hamburger menu | Menu opens. Links navigable. |
| **TC-LND-04: Careers page** | 1. Navigate to `/careers` | Job listings displayed. Click to see detail. |
| **TC-LND-05: Career detail** | 1. Click a job listing | Full job description. Apply CTA. |
| **TC-LND-06: Affiliate page** | 1. Navigate to `/affiliate` | Relationship Manager job description. Apply button. |
| **TC-LND-07: Affiliate apply** | 1. Click "Apply" on affiliate page | Application submitted. Success feedback. |

---

## 7. CROSS-CUTTING CONCERNS

### 7.1 Responsive Design

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-RSP-01: Desktop (1440px)** | 1. Set viewport to 1440px | Full layout with sidebar. Multi-column grids. |
| **TC-RSP-02: Tablet (768px)** | 1. Set viewport to 768px | Sidebar collapses. Content stacks vertically. |
| **TC-RSP-03: Mobile (375px)** | 1. Set viewport to 375px | Mobile navigation. Single column. Touch-friendly targets. |

### 7.2 Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-ERR-01: API 500 error** | 1. Trigger a backend 500 error | User-friendly error message. No crash. |
| **TC-ERR-02: Network offline** | 1. Disconnect network <br>2. Interact with page | Error states shown. User can retry. |
| **TC-ERR-03: Invalid route** | 1. Navigate to `/nonexistent` | 404 page or redirect. |

### 7.3 Light Mode Visibility

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-LGT-01: Text contrast** | 1. Use light mode <br>2. Check all text | All text readable on white/light backgrounds. |
| **TC-LGT-02: Input borders** | 1. Check form inputs | Borders visible. Focus states clear. |
| **TC-LGT-03: Cards & sections** | 1. Check card components | Card borders/shadow visible on light background. |

### 7.4 Loading States

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **TC-LOD-01: Slow API** | 1. Simulate slow API response | Spinner/skeleton shown. UI remains interactive. |
| **TC-LOD-02: Multiple loads** | 1. Navigate between pages | Each section shows appropriate loading state. |

---

## 8. TEST MATRIX SUMMARY

| Area | Total Test Cases | Critical Path |
|------|-----------------|---------------|
| Authentication | 15 | TC-AUTH-04, TC-OTP-05, TC-ONB-04 |
| Dashboard | 20 | TC-DSH-01, TC-KYC-02, TC-KYC-11 |
| DID & CNS | 12 | TC-DID-01, TC-CNS-01, TC-CNS-04 |
| Credentials | 5 | TC-CRV-01, TC-CRV-04 |
| Business Portal | 55 | TC-BIZ-01, TC-API-03, TC-WHK-03, TC-SDK-12 |
| Admin Dashboard | 10 | TC-ADM-02, TC-ADM-08 |
| SDK | 18 | TC-SLOG-04, TC-SPIN-03, TC-SPAS-02, TC-SREG-02 |
| Landing Pages | 7 | TC-LND-01, TC-LND-04 |
| Cross-cutting | 8 | TC-RSP-01, TC-ERR-01, TC-LGT-01 |
| **Total** | **150** | |

---

## 9. BUG REPORT TEMPLATE

When reporting a bug found during manual testing, include:

```markdown
## Title: [Area] Brief description

**Test Case Reference:** TC-XXX-XX

**Environment:**
- Browser: [Chrome/Safari/Firefox vXX]
- OS: [macOS/Windows/iOS/Android]
- Viewport: [Desktop/Tablet/Mobile]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshots/Videos:**

**Additional Context:**
- API response (if applicable):
- Console errors (if applicable):
```
