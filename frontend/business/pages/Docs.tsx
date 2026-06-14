import React, { useState } from 'react';

type DocSection =
  | 'Quickstart'
  | 'React SDK Installation'
  | 'SDK Configuration'
  | 'OAuth Token Exchange'
  | 'REST API (Headless)'
  | 'OTP Authentication'
  | 'Session Management'
  | 'Identity Verification'
  | 'Layer 1 Verification'
  | 'Layer 2 Verification'
  | 'Layer 3 Verification'
  | 'Verification Status'
  | 'Registration Flow'
  | 'Authentication Flow'
  | 'User Profile'
  | 'Token Verification'
  | 'Webhooks'
  | 'Android Setup'
  | 'React Native Integration';

const Docs: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<DocSection>('Quickstart');

  const docContent: Record<DocSection, { 
    title: string; 
    description: string; 
    steps?: Array<{ title: string; desc: string; code?: string; filename?: string }>;
    code?: string; 
    filename?: string; 
    endpoints?: Array<{ method: string; path: string; desc: string }> 
  }> = {
    'Quickstart': {
      title: 'Quickstart Guide',
      description: 'Use the lightweight SDK to start hosted authorization. Authentication, onboarding, passkeys, and verification happen securely on account.casperid.com.',
      filename: 'quickstart.md',
      code: `// Option 1: React SDK (Recommended for web apps)
npm install @casperid/react

// Option 2: REST API (advanced backend and native integrations)
// Do not embed CasperID passkey or identity UI on an unrelated web domain.
const APP_ID = 'app_...';

// All API calls to: https://apis.casperid.com
// Include X-App-Id header in all requests`
    },

    'React SDK Installation': {
      title: 'React SDK Installation',
      description: 'The fastest way to integrate the secure CasperID hosted authorization flow.',
      steps: [
        {
          title: '1. Install the package',
          desc: 'Add the CasperID React SDK to your project using npm or yarn.',
          code: 'npm install @casperid/react',
          filename: 'terminal'
        },
        {
          title: '2. Register your callback',
          desc: 'Add the exact callback URL in API Management.',
          code: 'https://your-app.example/auth/callback',
          filename: 'dashboard'
        },
        {
          title: '3. Add the hosted authorization button',
          desc: 'Desktop opens a popup; mobile redirects to account.casperid.com. Long signup and verification flows default to a 30-minute SDK timeout.',
          code: `import { CasperIDButton, useHostedAuthorizationCallback } from '@casperid/react';

function MyAuthComponent() {
  const handleSuccess = (result) => sendCodeToMyBackend(result);
  useHostedAuthorizationCallback(handleSuccess, console.error);

  return (
      <CasperIDButton
        clientId="app_xyz123"
        redirectUri={\`\${window.location.origin}/auth/callback\`}
        mode="auto"
        timeoutMs={30 * 60 * 1000}
        onSuccess={handleSuccess}
        onError={console.error}
      >
        Continue with CasperID
      </CasperIDButton>
  );
}`,
          filename: 'Auth.jsx'
        }
      ]
    },

    'SDK Configuration': {
      title: 'Hosted Authorization Options',
      description: 'Control popup or redirect transport. Branding and required tier are configured in the business dashboard.',
      filename: 'sdk-config.jsx',
      code: `<CasperIDButton
  clientId="app_xyz123"
  redirectUri={\`\${window.location.origin}/auth/callback\`}
  mode="auto" // 'auto' | 'popup' | 'redirect'
  timeoutMs={30 * 60 * 1000} // Set 0 to disable client-side timeout
  onSuccess={handleSuccess}
  onError={console.error}
/>`
    },

    'OAuth Token Exchange': {
      title: 'OAuth Code Exchange (Backend)',
      description: 'The browser receives a short-lived authorization code and PKCE verifier. Exchange them on your backend using the API secret. Never expose the API secret in frontend code.',
      filename: 'server.js',
      code: `// result is returned by CasperIDButton / authorizeWithCasperID()
// Send result.code, result.codeVerifier, and result.redirectUri to your backend.

const tokenResponse = await fetch('https://apis.casperid.com/api/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Secret': process.env.CASPERID_API_SECRET
  },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: result.code,
    client_id: process.env.CASPERID_CLIENT_ID,
    redirect_uri: result.redirectUri,
    code_verifier: result.codeVerifier
  })
});

const authorization = await tokenResponse.json();
// authorization.access_token
// authorization.authorization_status: 'complete' | 'provisional'
// authorization.verification_status: 'approved' | 'pending'
// authorization.granted_tier: the user's actual tier
// authorization.required_tier: your application's required tier`
    },

    'REST API (Headless)': {
      title: 'REST API (Headless)',
      description: 'Advanced APIs for trusted backend and native integrations. Web applications should use hosted authorization so CasperID passkeys remain on the CasperID relying-party domain.',
      code: `// All API calls to: https://apis.casperid.com
// Required headers:
// X-App-Id: YOUR_APP_ID`,
      filename: 'config.js'
    },

    'OTP Authentication': {
      title: 'OTP Authentication (Email)',
      description: 'Authenticate users via email verification code. This is the recommended flow for headless/API-only integrations.',
      filename: 'otp-auth.js',
      code: `// Step 1: Send OTP to user's email
const sendOTPResponse = await fetch('https://apis.casperid.com/api/auth/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123' // Your App ID from dashboard
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const { success, verificationId, expiresIn } = await sendOTPResponse.json();
// verificationId: Required for verification step
// expiresIn: OTP validity period (10 minutes)

// Step 2: User enters the 6-digit OTP code
// Show input field in your UI

// Step 3: Verify the OTP
const verifyResponse = await fetch('https://apis.casperid.com/api/auth/verify-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123'
  },
  body: JSON.stringify({
    verificationId: verificationId,
    otp: '123456' // User input
  })
});

const {
  success,
  sessionToken,    // Store for API calls
  business_token,  // Send to your backend
  expiresAt,
  userAccount
} = await verifyResponse.json();

// Store sessionToken for subsequent API calls
localStorage.setItem('casperid_session', sessionToken);

// Send business_token to your backend for verification
await fetch('https://yourbackend.com/api/auth', {
  method: 'POST',
  body: JSON.stringify({ token: business_token })
});`
    },

    'Session Management': {
      title: 'Session Management',
      description: 'Manage user sessions and validate authentication tokens.',
      filename: 'session.js',
      code: `// Check if user has an active session
const sessionToken = localStorage.getItem('casperid_session');

if (sessionToken) {
  // Validate session
  const response = await fetch('https://apis.casperid.com/api/casperid/session', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${sessionToken}\`
    }
  });

  const { active, user } = await response.json();

  if (active) {
    console.log('User is authenticated:', user);
  } else {
    // Session expired, redirect to login
    localStorage.removeItem('casperid_session');
  }
}

// Logout (revoke session)
await fetch('https://apis.casperid.com/api/casperid/logout', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${sessionToken}\`
  }
});

localStorage.removeItem('casperid_session');`
    },

    'Identity Verification': {
      title: 'Identity Verification Layers',
      description: 'CasperID provides progressive verification layers from basic email verification to full government ID checks.',
      code: `// Verification Levels:
// layer_1: Basic (Email OTP or Passkey)
// layer_2: Liveness (Face verification)
// layer_3: KYC (Document ID scanning)`,
      filename: 'tiers.js'
    },

    'Layer 1 Verification': {
      title: 'Layer 1: Basic Identity (Onboarding)',
      description: 'The hosted CasperID account flow handles email verification, passkey registration, wallet creation, and DID minting. The endpoint sequence below documents what CasperID runs on its own account domain; partner web apps should not reproduce it.',
      steps: [
        {
          title: '1. Email & OTP Verification',
          desc: 'First, the user verifies their email address using a 6-digit one-time password.',
          code: `// Send OTP to email
await fetch('https://apis.casperid.com/api/auth/send-otp', {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com' })
});

// Verify OTP
const { sessionToken } = await fetch('https://apis.casperid.com/api/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify({ verificationId, otp: '123456' })
}).then(r => r.json());`,
          filename: 'step-1-otp.js'
        },
        {
          title: '2. Passkey Registration',
          desc: 'On the CasperID account domain, the user registers a biometric passkey for secure, passwordless access.',
          code: `// Initialize passkey registration
const { options } = await fetch('https://apis.casperid.com/api/passkey/register/begin', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${sessionToken}\` },
  body: JSON.stringify({ email })
}).then(r => r.json());

// Create credential via browser
const credential = await navigator.credentials.create({ publicKey: options });

// Finalize registration
await fetch('https://apis.casperid.com/api/passkey/register/finish', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${sessionToken}\` },
  body: JSON.stringify({ credential })
});`,
          filename: 'step-2-passkey.js'
        },
        {
          title: '3. Wallet & DID Creation',
          desc: 'Finally, a persistent wallet and Decentralized Identity (DID) are created and linked to the user account.',
          code: `// Generate secure wallet
const { wallet } = await fetch('https://apis.casperid.com/api/passkey/wallet/generate', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${sessionToken}\` }
}).then(r => r.json());

// Mint Decentralized Identity (DID)
await fetch('https://apis.casperid.com/api/passkey/did/mint', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${sessionToken}\` }
});`,
          filename: 'step-3-wallet.js'
        }
      ]
    },

    'Layer 2 Verification': {
      title: 'Layer 2: Liveness Verification',
      description: 'Hosted authorization uses a phone-first liveness flow. Desktop users scan a scoped QR code; mobile users continue directly. The QR authorizes one verification and does not permanently register the phone as a trusted passkey device.',
      filename: 'layer2.js',
      code: `// Step 1: Start Layer 2 verification
const sessionToken = localStorage.getItem('casperid_session');

const startResponse = await fetch('https://apis.casperid.com/api/v2/verification/layer2/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${sessionToken}\`,
    'X-App-Id': 'app_xyz123'
  },
  body: JSON.stringify({
    linkWallet: true, // Optional: link to Casper wallet
    purpose: 'identity_verification'
  })
});

const { verification } = await startResponse.json();
const requestId = verification.requestId;
const qrCode = verification.qrCode.dataUrl;
const mobileUrl = verification.qrCode.mobileUrl;

// Step 2: Desktop displays qrCode. The phone opens mobileUrl and acknowledges
// the scoped pairing. Poll status to show "Verification in progress".
const status = await fetch(
  \`https://apis.casperid.com/api/v2/verification/\${requestId}/status\`,
  { headers: { Authorization: \`Bearer \${sessionToken}\` } }
).then(r => r.json());

// Step 3: The CasperID-hosted mobile page captures and submits liveness frames.
// Native/headless clients may submit the scoped pairing token themselves:
const formData = new FormData();
formData.append('requestId', requestId);
formData.append('pairingId', verification.pairingId);
formData.append('pairingToken', verification.pairingToken);

// Add captured frames
imageFrames.forEach((frame, index) => {
  formData.append('imageFrames', frame, \`frame-\${index}.jpg\`);
});

// Add metadata
formData.append('metadata', JSON.stringify({
  captureDevice: 'web_camera',
  timestamp: Date.now(),
  framesCount: imageFrames.length
}));

// Never set Content-Type manually; the browser must add the multipart boundary.
const livenessResponse = await fetch('https://apis.casperid.com/api/v2/verification/liveness', {
  method: 'POST',
  body: formData // Note: No Content-Type header, browser sets it automatically
});

const { success, liveness } = await livenessResponse.json();

if (success && liveness.livenessVerified) {
  console.log('Liveness verified! Score:', liveness.score);
  // User is now Layer 2 verified
} else {
  console.log('Liveness check failed');
}

// Step 4: The initiating desktop polls until status is completed.
const statusResponse = await fetch(\`https://apis.casperid.com/api/v2/verification/\${requestId}/status\`);
const { verification: finalStatus } = await statusResponse.json();

console.log('Verification tier:', finalStatus.status);`
    },

    'Layer 3 Verification': {
      title: 'Layer 3: Full KYC Verification',
      description: 'The hosted flow collects government ID documents and liveness evidence. If review remains pending, OAuth may return a 24-hour provisional authorization while preserving the user’s actual L2 tier.',
      filename: 'layer3.js',
      code: `// Step 1: Start Layer 3 verification
const sessionToken = localStorage.getItem('casperid_session');

const startResponse = await fetch('https://apis.casperid.com/api/v2/verification/layer3/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${sessionToken}\`,
    'X-App-Id': 'app_xyz123'
  },
  body: JSON.stringify({
    verificationMethod: 'document', // 'document' or 'nimc' (Nigeria)
    purpose: 'kyc_verification'
  })
});

const { verification } = await startResponse.json();
const requestId = verification.requestId;

// Step 2: Upload document images
// (Note: Document upload must happen before liveness check)
const formData = new FormData();
formData.append('front_image', frontImageBlob, 'id-front.jpg');
formData.append('back_image', backImageBlob, 'id-back.jpg'); 

const uploadResponse = await fetch('https://apis.casperid.com/api/v2/verification/layer3/documents/upload', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${sessionToken}\` },
  body: formData
});

const { extracted_data } = await uploadResponse.json();

// Step 3: Complete liveness check 
// (See Layer 2 Verification for implementation details)
// Once document is uploaded, proceed to facial verification

// Step 4: Submit for final verification
const submitResponse = await fetch('https://apis.casperid.com/api/v2/verification/layer3/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${sessionToken}\`
  },
  body: JSON.stringify({
    requestId: requestId,
    extractedData: extracted_data,
    documentType: 'passport'
  })
});

const { success: submitted } = await submitResponse.json();`
    },

    'Verification Status': {
      title: 'Check Verification Status',
      description: 'Check the current status of any verification request. Useful for polling long-running verifications.',
      filename: 'check-status.js',
      code: `// Get status of a specific verification request
const requestId = 'req_abc123...';

const response = await fetch(\`https://apis.casperid.com/api/v2/verification/\${requestId}/status\`, {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${sessionToken}\`
  }
});

const { success, verification } = await response.json();

console.log('Status:', verification.status);
// Possible values:
// - 'pending': Verification started
// - 'in_progress': Processing
// - 'completed': Successfully verified
// - 'failed': Verification failed
// - 'cancelled': User cancelled

console.log('Progress:', verification.progress);
// {
//   livenessCompleted: true,
//   documentCompleted: true,
//   livenessScore: 0.95
// }

// Get user's verification history
const historyResponse = await fetch('https://apis.casperid.com/api/v2/verification/history', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${sessionToken}\`
  }
});

const { verifications } = await historyResponse.json();

verifications.forEach(v => {
  console.log(\`\${v.verificationType}: \${v.status}\`);
});`
    },

    'Registration Flow': {
      title: 'Passkey Registration (Advanced)',
      description: 'Advanced CasperID account-domain flow. Partner web applications must use hosted authorization because WebAuthn credentials are scoped to the CasperID relying-party domain.',
      filename: 'register.js',
      code: `// Step 1: Start Registration
const beginRes = await fetch('https://apis.casperid.com/api/passkey/register/begin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe'
  })
});
const { options, userId } = await beginRes.json();

// Step 2: Create Credential (client-side WebAuthn)
// Requires browser WebAuthn support
const credential = await navigator.credentials.create({
  publicKey: options
});

// Step 3: Finish Registration
// This request and navigator.credentials.create() must run on the configured
// CasperID account relying-party domain. Browsers set Origin automatically.
const finishRes = await fetch('https://apis.casperid.com/api/passkey/register/finish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123',
  },
  body: JSON.stringify({
    userId: userId, // From Step 1 response
    credential: {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      type: credential.type,
      response: {
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
        attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject)))
      }
    },
    deviceInfo: {
      deviceType: 'desktop',
      os: 'mac',
      userAgent: navigator.userAgent
    }
  })
});

const { business_token, sessionToken } = await finishRes.json();
// Store business_token for future requests!

// Do not attempt this from a partner domain. Use CasperIDButton instead.`
    },

    'Authentication Flow': {
      title: 'Passkey Authentication (Advanced)',
      description: 'Advanced CasperID account-domain flow. Partner web applications should use hosted authorization; a CasperID passkey cannot be used directly from an unrelated relying-party domain.',
      filename: 'login.js',
      code: `// Step 1: Start Auth
const beginRes = await fetch('https://apis.casperid.com/api/passkey/auth/begin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123'
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});
const { options, challengeId } = await beginRes.json();

// Step 2: Get Assertion (client-side WebAuthn)
const credential = await navigator.credentials.get({
  publicKey: options
});

// Step 3: Finish Auth
// Must execute on the CasperID account relying-party domain.
const finishRes = await fetch('https://apis.casperid.com/api/passkey/auth/finish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123',
  },
  body: JSON.stringify({
    challengeId, // From Step 1 response
    credential: {
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      type: credential.type,
      response: {
        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
        authenticatorData: btoa(String.fromCharCode(...new Uint8Array(credential.response.authenticatorData))),
        signature: btoa(String.fromCharCode(...new Uint8Array(credential.response.signature))),
        userHandle: credential.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(credential.response.userHandle))) : null
      }
    },
    deviceInfo: {
      deviceType: 'desktop',
      userAgent: navigator.userAgent
    }
  })
});

const { business_token, sessionToken } = await finishRes.json();

// Do not attempt this from a partner domain. Use CasperIDButton instead.`
    },

    'User Profile': {
      title: 'Get User Profile',
      description: 'Retrieve the authenticated user\'s profile using the business_token obtained during login.',
      filename: 'get-profile.sh',
      code: `curl -X GET https://apis.casperid.com/api/passkey/me \\
  -H "Authorization: Bearer <business_token>"

# Response:
# {
#   "success": true,
#   "profile": {
#     "user_id": "user_...",
#     "verified": true,
#     "tier": "layer_1",
#     "email": "user@example.com",
#     "wallet": "0x...",
#     "humanId": "alice.casper"
#   },
#   "scoped_to_app": "app_...",
#   "token_type": "business"
# }

# In JavaScript:
const response = await fetch('https://apis.casperid.com/api/passkey/me', {
  headers: {
    'Authorization': \`Bearer \${business_token}\`
  }
});

const { profile } = await response.json();
console.log('User tier:', profile.tier);
console.log('Human ID:', profile.humanId);`
    },

    'Token Verification': {
      title: 'Verify Tokens (Backend)',
      description: 'Verify business tokens on your backend using our verify-token endpoint or JWKS for RS256 verification.',
      filename: 'verify-token.js',
      code: `// Option 1: Use the verify-token endpoint (simpler)
const response = await fetch('https://apis.casperid.com/api/casperid/verify-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: business_token
  })
});

const { valid, user, platform, expiresAt } = await response.json();

if (valid) {
  console.log('User verified:', user);
  // {
  //   wallet: "0x...",
  //   humanId: "alice.casper",
  //   name: "Alice",
  //   verified: true,
  //   tier: "layer_2",
  //   sharedData: ["email", "wallet"]
  // }
}

// Option 2: Verify JWT locally with JWKS (advanced)
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://apis.casperid.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

jwt.verify(business_token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
  if (err) {
    console.error('Token invalid:', err);
  } else {
    console.log('User ID:', decoded.sub);
    console.log('App ID:', decoded.aud);
    console.log('Tier:', decoded.tier);
  }
});`
    },

    'Webhooks': {
      title: 'Real-time Webhooks',
      description: 'Subscribe to events like user.verified and kyc.completed to trigger workflows in your app. We sign every request so you can verify its authenticity.',
      filename: 'verify-webhook.js',
      code: `const crypto = require('crypto');
const express = require('express');
const app = express();

// 1. Get your Signing Secret from the Dashboard
const SIGNING_SECRET = 'whsec_...';

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-casperid-signature'];
  const timestamp = signature.split(',')[0].split('=')[1];
  const hash = signature.split(',')[1].split('=')[1];

  // 2. Reconstruct the payload string
  const payload = \`\${timestamp}.\${req.body.toString()}\`;

  // 3. Calculate expected signature
  const expected = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(payload)
    .digest('hex');

  // 4. Compare (constant-time)
  if (hash !== expected) {
    return res.status(400).send('Invalid signature');
  }

  // 5. Process event
  const event = JSON.parse(req.body);
  console.log('Received event:', event.type);

  switch (event.type) {
    case 'user.verified':
      // User completed email verification
      console.log('User verified:', event.data.user_id);
      break;

    case 'kyc.layer2.completed':
      // Liveness check passed
      console.log('Layer 2 complete:', event.data.user_id);
      break;

    case 'kyc.layer3.completed':
      // Full KYC verification complete
      console.log('Layer 3 complete:', event.data.user_id);
      break;

    case 'kyc.failed':
      // Verification failed
      console.log('Verification failed:', event.data.reason);
      break;
  }

  res.send('Received');
});

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});`
    },

    'Android Setup': {
      title: 'Android Passkey Configuration',
      description: 'Configure Android Digital Asset Links to enable passkey authentication in your React Native or native Android app. This is required for WebAuthn/Passkey support on Android.',
      steps: [
        {
          title: '1. Get Your Certificate Fingerprints',
          desc: 'Extract SHA256 fingerprints from your debug and release keystores. You need both for development and production.',
          code: `# Debug keystore (for local development)
keytool -list -v -keystore ~/.android/debug.keystore \\
  -alias androiddebugkey \\
  -storepass android \\
  -keypass android | grep "SHA256:"

# Release keystore (for production)
keytool -list -v -keystore /path/to/your-release.keystore \\
  -alias your-key-alias | grep "SHA256:"

# Output format: SHA256: AA:BB:CC:DD:EE:FF:...`,
          filename: 'terminal'
        },
        {
          title: '2. Configure in Business Dashboard',
          desc: 'Add your Android app configuration in the Integrations page.',
          code: `1. Go to Business Dashboard → Integrations
2. Select your app
3. Scroll to "Android Configuration"
4. Click "Add Android App"
5. Enter your package name (e.g., com.orb.app)
6. Paste SHA256 fingerprints (comma-separated)
7. Click "Add App"
8. Click "Save Changes" at the top`,
          filename: 'steps.txt'
        },
        {
          title: '3. Verify Configuration',
          desc: 'Check that your assetlinks.json is publicly accessible and includes your app.',
          code: `# Visit this URL (replace with your domain)
curl https://casperid.com/.well-known/assetlinks.json

# Should return JSON with your package name:
{
  "relation": [
    "delegate_permission/common.handle_all_urls",
    "delegate_permission/common.get_login_creds"
  ],
  "target": {
    "namespace": "android_app",
    "package_name": "com.orb.app",
    "sha256_cert_fingerprints": ["AA:BB:CC:..."]
  }
}`,
          filename: 'terminal'
        },
        {
          title: '4. Test with Google Tool',
          desc: 'Use Google\'s Digital Asset Links tester to validate your configuration.',
          code: `# Visit this URL in your browser:
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://casperid.com&relation=delegate_permission/common.get_login_creds

# Should return your app's assetlinks configuration
# If empty, check your dashboard settings and try again`,
          filename: 'validation.txt'
        }
      ]
    },

    'React Native Integration': {
      title: 'React Native Integration',
      description: 'Use a system browser hosted-authorization flow for the default mobile integration. Direct passkey APIs are only for native apps configured for CasperID-associated domains.',
      steps: [
        {
          title: '1. Register a Universal-Link Callback',
          desc: 'Add an exact HTTPS callback URI in API Management. The URI must open your mobile application through Universal Links or Android App Links.',
          code: `https://app.example.com/auth/callback

// The backend currently accepts HTTPS callbacks, plus HTTP localhost for development.
// Custom URL schemes are not accepted as OAuth redirect URIs.`,
          filename: 'dashboard'
        },
        {
          title: '2. Generate PKCE and Open the System Browser',
          desc: 'Generate state and PKCE values in the app, retain the verifier securely, then open the hosted CasperID authorization URL in the system browser.',
          code: `const authorizationUrl = new URL('https://account.casperid.com/authorize');
authorizationUrl.search = new URLSearchParams({
  response_type: 'code',
  client_id: 'app_xyz123',
  redirect_uri: 'https://app.example.com/auth/callback',
  state,
  code_challenge: codeChallenge,
  code_challenge_method: 'S256'
}).toString();

await openSystemBrowser(authorizationUrl.toString());`,
          filename: 'auth/casperid.ts'
        },
        {
          title: '3. Handle the Callback',
          desc: 'Validate the returned state and send the authorization code and retained PKCE verifier to your backend.',
          code: `const callback = new URL(incomingUniversalLink);
if (callback.searchParams.get('state') !== retainedState) {
  throw new Error('Invalid OAuth state');
}

await sendCodeToBackend({
  code: callback.searchParams.get('code'),
  codeVerifier: retainedCodeVerifier,
  redirectUri: 'https://app.example.com/auth/callback'
});`,
          filename: 'auth/callback.ts'
        },
        {
          title: '4. Exchange the Code on Your Backend',
          desc: 'Use the same backend-only OAuth token exchange documented for the React SDK. Never ship the API secret in the mobile app.',
          code: `POST https://apis.casperid.com/api/oauth/token
X-API-Secret: your_backend_only_secret

{
  "grant_type": "authorization_code",
  "code": "...",
  "client_id": "app_xyz123",
  "redirect_uri": "https://app.example.com/auth/callback",
  "code_verifier": "..."
}`,
          filename: 'backend'
        }
      ]
    }
  };

  const activeContent = docContent[activeDoc] || docContent['Quickstart'];

  return (
    <div className="flex h-full max-w-[1400px] mx-auto bg-white border border-border-muted rounded-2xl overflow-hidden shadow-sm">
      <aside className="w-64 border-r border-border-muted overflow-y-auto p-6 shrink-0 bg-background-light/30">
        <div className="flex flex-col gap-8">
          {[
            {
              title: 'Getting Started',
              items: [{ label: 'Quickstart' }],
            },
            {
              title: 'React SDK',
              items: [
                { label: 'React SDK Installation' },
                { label: 'SDK Configuration' },
                { label: 'OAuth Token Exchange' }
              ],
            },
            {
              title: 'REST API (Headless)',
              items: [
                { label: 'REST API (Headless)' },
                { label: 'OTP Authentication', isNested: true },
                { label: 'Session Management', isNested: true }
              ],
            },
            {
              title: 'Identity Verification',
              items: [
                { label: 'Identity Verification' },
                { label: 'Layer 1 Verification', isNested: true },
                { label: 'Layer 2 Verification', isNested: true },
                { label: 'Layer 3 Verification', isNested: true },
                { label: 'Verification Status', isNested: true }
              ],
            },
            {
              title: 'Passkey Auth (Advanced)',
              items: [
                { label: 'Registration Flow' },
                { label: 'Authentication Flow' },
                { label: 'User Profile' }
              ],
            },
            {
              title: 'Backend Integration',
              items: [
                { label: 'Token Verification' },
                { label: 'Webhooks' }
              ],
            },
            {
              title: 'Mobile Integration',
              items: [
                { label: 'React Native Integration' },
                { label: 'Android Setup', isNested: true }
              ],
            }
          ].map((section, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">{section.title}</h4>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveDoc(item.label as DocSection)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm text-left transition-all ${activeDoc === item.label
                        ? 'bg-primary/10 text-primary font-bold shadow-sm'
                        : 'text-text-main hover:bg-background-light font-medium'
                      } ${item.isNested ? 'ml-4 border-l border-border-muted rounded-none' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-8 md:p-12">
        <div className="max-w-4xl mx-auto flex flex-col xl:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-text-main text-4xl font-black tracking-tight">{activeContent.title}</h2>
              <p className="text-lg text-text-muted leading-relaxed">{activeContent.description}</p>
            </div>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeContent.steps ? (
                <div className="flex flex-col gap-12">
                  {activeContent.steps.map((step, i) => (
                    <div key={i} className="flex flex-col gap-4">
                      <h3 className="text-2xl font-bold text-text-main">{step.title}</h3>
                      <p className="text-text-muted leading-relaxed">{step.desc}</p>
                      {step.code && (
                        <div className="flex flex-col gap-0 group">
                          <div className="flex items-center justify-between bg-[#1e1e2e] rounded-t-xl px-4 py-3 border-b border-white/10">
                            <span className="text-xs font-mono text-white/50">{step.filename || 'example.js'}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(step.code || '')}
                              className="text-white/30 hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined !text-sm">content_copy</span>
                            </button>
                          </div>
                          <div className="bg-[#1e1e2e] p-6 rounded-b-xl font-mono text-sm leading-relaxed overflow-x-auto text-[#d9e0ee] shadow-inner max-w-full">
                            <pre>
                              <code>{step.code}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : activeContent.code ? (
                <div className="flex flex-col gap-0 mb-8 group">
                  <div className="flex items-center justify-between bg-[#1e1e2e] rounded-t-xl px-4 py-3 border-b border-white/10">
                    <span className="text-xs font-mono text-white/50">{activeContent.filename || 'example.js'}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(activeContent.code || '')}
                      className="text-white/30 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined !text-sm">content_copy</span>
                    </button>
                  </div>
                  <div className="bg-[#1e1e2e] p-6 rounded-b-xl font-mono text-sm leading-relaxed overflow-x-auto text-[#d9e0ee] shadow-inner max-w-full">
                    <pre>
                      <code>{activeContent.code}</code>
                    </pre>
                  </div>
                </div>
              ) : null}

              <div className="mt-12 pt-12 border-t border-border-muted">
                <h3 className="text-2xl font-bold text-text-main mb-4">Implementation Details</h3>
                <p className="text-text-muted mb-6 leading-relaxed">
                  Ensure you handle errors gracefully. Standard HTTP 4xx and 5xx codes are used.
                  For API calls, include your <code>X-App-Id</code> header from the dashboard.
                  Session tokens expire after 24 hours.
                </p>
              </div>
            </section>
          </div>

          <div className="w-64 shrink-0 hidden xl:flex flex-col gap-6">
            <div className="p-6 bg-white rounded-xl border border-border-muted shadow-sm flex flex-col gap-4 sticky top-6">
              <h4 className="text-sm font-bold text-text-main uppercase tracking-wider">Useful Links</h4>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Join Discord', icon: 'forum' },
                  { label: 'Github Repository', icon: 'code' },
                  { label: 'API Status Page', icon: 'check_circle' },
                ].map((link, i) => (
                  <button key={i} className="flex items-center gap-3 text-text-muted hover:text-primary transition-colors group">
                    <div className="size-8 rounded-lg bg-background-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined !text-lg">{link.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-left">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
