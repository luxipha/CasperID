import React, { useState } from 'react';

type DocSection =
  | 'Quickstart'
  | 'React SDK Installation'
  | 'SDK Configuration'
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
      description: 'Get up and running with CasperID Business Platform. Choose between our React SDK for quick integration or REST API for custom implementations.',
      filename: 'quickstart.md',
      code: `// Option 1: React SDK (Recommended for web apps)
npm install @casperid/react

// Option 2: REST API (For custom UI or mobile apps)
// Use your App ID from the dashboard
const APP_ID = 'app_...';

// All API calls to: https://apis.casperid.com
// Include X-App-Id header in all requests`
    },

    'React SDK Installation': {
      title: 'React SDK Installation',
      description: 'The fastest way to integrate CasperID into your React application using our pre-built UI components.',
      steps: [
        {
          title: '1. Install the package',
          desc: 'Add the CasperID React SDK to your project using npm or yarn.',
          code: 'npm install @casperid/react',
          filename: 'terminal'
        },
        {
          title: '2. Import Styles',
          desc: 'Import the required CSS in your main entry file (e.g., App.tsx or index.tsx).',
          code: "import '@casperid/react/style.css';",
          filename: 'App.tsx'
        },
        {
          title: '3. Implement the Modal',
          desc: 'Use the CasperIDModal component to handle the authentication and verification flow.',
          code: `import { CasperIDModal } from '@casperid/react';

function MyAuthComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (token, data) => {
    console.log('Verified!', data.businessToken);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Verify Identity</button>
      <CasperIDModal
        isOpen={isOpen}
        apiKey="app_xyz123"
        onSuccess={handleSuccess}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}`,
          filename: 'Auth.jsx'
        }
      ]
    },

    'SDK Configuration': {
      title: 'SDK Configuration Options',
      description: 'Customize the CasperID modal appearance and behavior with theme options and configuration.',
      filename: 'sdk-config.jsx',
      code: `<CasperIDModal
  isOpen={isOpen}
  apiKey="app_xyz123"
  onSuccess={handleSuccess}
  onClose={() => setIsOpen(false)}

  // Verification Settings
  requiredTier="layer_2" // 'layer_1' | 'layer_2' | 'layer_3'
  mode="login" // 'login' | 'verify'

  // Theme Customization
  theme={{
    primaryColor: '#8651e1',
    borderRadius: '12',
    fontFamily: 'Inter',
    mode: 'light', // 'light' | 'dark' | 'system'
    layout: 'auto', // 'auto' | 'modal' | 'fullscreen'
  }}

  // Branding
  logoUrl="https://yourdomain.com/logo.png"

  // Localization
  language="EN" // 'EN' | 'ES' | 'FR' | 'DE'
/>`
    },

    'REST API (Headless)': {
      title: 'REST API (Headless)',
      description: 'Build your own custom UI and logic using our robust REST API endpoints. Perfect for mobile apps or unique onboarding experiences.',
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
      description: 'The foundation of CasperID. Users go through a sequential flow to verify their identity and create their persistent digital wallet.',
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
          desc: 'After email verification, the user registers a biometric passkey for secure, passwordless access.',
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
      description: 'Verify user identity with facial liveness check. Requires camera access and captures multiple frames to detect live human presence.',
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

// Step 2: Capture liveness frames
// Use camera API to capture 10-30 frames of user's face
// with different angles and expressions

const formData = new FormData();
formData.append('requestId', requestId);

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

// Step 3: Submit liveness check
const livenessResponse = await fetch('https://apis.casperid.com/api/v2/verification/liveness', {
  method: 'POST',
  body: formData // Note: No Content-Type header, browser sets it automatically
});

const { success, liveness } = await livenessResponse.json();

if (liveness.livenessVerified) {
  console.log('Liveness verified! Score:', liveness.score);
  // User is now Layer 2 verified
} else {
  console.log('Liveness check failed');
}

// Step 4: Check final verification status
const statusResponse = await fetch(\`https://apis.casperid.com/api/v2/verification/\${requestId}/status\`);
const { verification: finalStatus } = await statusResponse.json();

console.log('Verification tier:', finalStatus.status);`
    },

    'Layer 3 Verification': {
      title: 'Layer 3: Full KYC Verification',
      description: 'Complete KYC verification with government-issued ID document scanning and OCR extraction. Requires document photos and liveness check.',
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
      description: 'Register a new user with a passkey for passwordless authentication. Requires WebAuthn browser support and proper Origin header configuration.',
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
// ⚠️ CRITICAL: Include Origin header that matches your dashboard config
const finishRes = await fetch('https://apis.casperid.com/api/passkey/register/finish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123',
    'Origin': 'https://your-dapp-domain.com' // MUST match allowed_origins in dashboard
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

/* ⚠️ IMPORTANT: Origin Header Validation
 * The Origin header must EXACTLY match one of the allowed origins
 * configured in your Business Dashboard → Integrations → [Your App] → Redirect Configuration
 *
 * Examples:
 * ✅ Dashboard: https://app.example.com  | Request Origin: https://app.example.com
 * ❌ Dashboard: https://app.example.com  | Request Origin: http://localhost:3000 (mismatch!)
 * ❌ Dashboard: https://app.example.com  | Request Origin: https://app.example.com/ (trailing slash!)
 *
 * Mismatch = verification will fail for security reasons.
 */`
    },

    'Authentication Flow': {
      title: 'Passkey Authentication (Advanced)',
      description: 'Log in an existing user with their registered passkey. Similar to registration but uses WebAuthn get() instead of create(). Requires proper Origin header configuration.',
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
// ⚠️ CRITICAL: Include Origin header that matches your dashboard config
const finishRes = await fetch('https://apis.casperid.com/api/passkey/auth/finish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123',
    'Origin': 'https://your-dapp-domain.com' // MUST match allowed_origins in dashboard
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

/* ⚠️ IMPORTANT: Origin Header Validation
 * The Origin header must EXACTLY match one of the allowed origins
 * configured in your Business Dashboard → Integrations → [Your App] → Redirect Configuration
 *
 * Common mistakes:
 * ❌ Trailing slashes: https://example.com/ vs https://example.com
 * ❌ Protocol mismatch: http:// vs https://
 * ❌ Port numbers: https://example.com:3000 vs https://example.com
 * ❌ Subdomain mismatch: app.example.com vs www.example.com
 *
 * The browser automatically sends the Origin header in fetch() requests,
 * but you may need to manually add it in non-browser environments (Node.js, React Native).
 */`
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
      description: 'Integrate CasperID into your React Native application using our REST API and WebAuthn for passkeys.',
      steps: [
        {
          title: '1. Install Dependencies',
          desc: 'Install required packages for HTTP requests and WebAuthn support.',
          code: `npm install axios
npm install react-native-passkey

# For iOS, run pod install
cd ios && pod install && cd ..`,
          filename: 'terminal'
        },
        {
          title: '2. Configure Android (AssetLinks)',
          desc: 'Make sure you\'ve completed the "Android Setup" documentation first to enable passkey support.',
          code: `// See "Android Setup" section in docs
// You must configure Digital Asset Links in your dashboard`,
          filename: 'reminder.js'
        },
        {
          title: '3. Initialize CasperID Client',
          desc: 'Create a client service to handle API calls to CasperID.',
          code: `import axios from 'axios';

const casperIDClient = axios.create({
  baseURL: 'https://apis.casperid.com',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Id': 'app_xyz123', // Your App ID from dashboard
    'Origin': 'https://your-app-domain.com' // Required for passkey endpoints
  }
});

// ⚠️ Note: Origin header must match allowed_origins in your dashboard
// Configure in: Dashboard → Integrations → [Your App] → Redirect Configuration

export default casperIDClient;`,
          filename: 'services/casperid.js'
        },
        {
          title: '4. Implement OTP Authentication',
          desc: 'Use email OTP for initial authentication (recommended for mobile).',
          code: `import casperIDClient from './services/casperid';

// Send OTP
const sendOTP = async (email) => {
  const response = await casperIDClient.post('/api/auth/send-otp', {
    email
  });
  return response.data; // { verificationId, expiresIn }
};

// Verify OTP
const verifyOTP = async (verificationId, otp) => {
  const response = await casperIDClient.post('/api/auth/verify-otp', {
    verificationId,
    otp
  });
  return response.data; // { sessionToken, business_token, userAccount }
};`,
          filename: 'hooks/useAuth.js'
        },
        {
          title: '5. Optional: Register Passkey',
          desc: 'After OTP auth, optionally register a passkey for biometric login.',
          code: `import Passkey from 'react-native-passkey';

const registerPasskey = async (sessionToken) => {
  // 1. Request registration options
  const optionsRes = await casperIDClient.post('/api/passkey/register/begin', {}, {
    headers: { 'Authorization': \`Bearer \${sessionToken}\` }
  });

  const { options } = optionsRes.data;

  // 2. Create passkey with device biometric
  const credential = await Passkey.register(options);

  // 3. Complete registration
  const completeRes = await casperIDClient.post('/api/passkey/register/complete', {
    credential
  }, {
    headers: { 'Authorization': \`Bearer \${sessionToken}\` }
  });

  return completeRes.data;
};`,
          filename: 'services/passkey.js'
        },
        {
          title: '6. Authenticate with Passkey',
          desc: 'On subsequent logins, use passkey for instant biometric authentication.',
          code: `const authenticateWithPasskey = async () => {
  // 1. Request authentication options
  const optionsRes = await casperIDClient.post('/api/passkey/authenticate/begin');
  const { options } = optionsRes.data;

  // 2. Get credential from device
  const credential = await Passkey.authenticate(options);

  // 3. Complete authentication
  const authRes = await casperIDClient.post('/api/passkey/authenticate/complete', {
    credential
  });

  return authRes.data; // { sessionToken, business_token, userAccount }
};`,
          filename: 'services/passkey.js'
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
                { label: 'SDK Configuration' }
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
