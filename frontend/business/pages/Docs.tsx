import React, { useState } from 'react';

type DocSection = 'Quickstart' | 'Registration Flow' | 'Authentication Flow' | 'User Profile' | 'Token Verification' | 'Webhooks';

const Docs: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<DocSection>('Quickstart');

  const docContent: Record<DocSection, { title: string; description: string; code?: string; filename?: string; endpoints?: Array<{ method: string; path: string; desc: string }> }> = {
    'Quickstart': {
      title: 'Quickstart Guide',
      description: 'Get up and running with CasperID Business Platform. This guide covers the basic setup to start accepting passkey logins in your application.',
      filename: 'integration-steps.md',
      code: `// 1. Get your credentials from the Dashboard
const APP_ID = 'app_...';
const API_SECRET = 'sk_...';

// 2. Add headers to your API calls
const headers = {
  'Content-Type': 'application/json',
  'X-App-ID': APP_ID,
  'X-Api-Secret': API_SECRET
};

// 3. Trigger registration (see Registration Flow)`
    },
    'Registration Flow': {
      title: 'Passkey Registration',
      description: 'Register a new user with a passkey. This is a two-step process: Begin (get options) -> Finish (verify credential).',
      filename: 'register.js',
      code: `// Step 1: Start Registration
const beginRes = await fetch('/api/passkey/register/begin', {
  method: 'POST',
  headers,
  body: JSON.stringify({ email: 'user@example.com', name: 'John Doe' })
});
const { options } = await beginRes.json();

// Step 2: Create Credential (client-side)
// Use simplewebauthn/browser or navigator.credentials.create()
const credential = await navigator.credentials.create({ publicKey: options });

// Step 3: Finish Registration
const finishRes = await fetch('/api/passkey/register/finish', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    userId: options.user.id,
    credential,
    deviceInfo: { deviceType: 'desktop', os: 'mac' }
  })
});
const { business_token } = await finishRes.json();
// Store business_token for future requests!`
    },
    'Authentication Flow': {
      title: 'Passkey Authentication',
      description: 'Log in an existing user. Similar to registration, this is a two-step process: Begin (get challenge) -> Finish (verify signature).',
      filename: 'login.js',
      code: `// Step 1: Start Auth
const beginRes = await fetch('/api/passkey/auth/begin', {
  method: 'POST',
  headers,
  body: JSON.stringify({ email: 'user@example.com' })
});
const { options, challengeId } = await beginRes.json();

// Step 2: Get Assertion (client-side)
const credential = await navigator.credentials.get({ publicKey: options });

// Step 3: Finish Auth
const finishRes = await fetch('/api/passkey/auth/finish', {
  method: 'POST',
  headers,
  body: JSON.stringify({ challengeId, credential, deviceInfo: { ... } })
});
const { business_token } = await finishRes.json();`
    },
    'User Profile': {
      title: 'Get User Profile',
      description: 'Retrieve the authenticated user\'s profile using the business_token obtained during login.',
      filename: 'get-profile.sh',
      code: `curl -X GET https://casperid.com/api/passkey/me \\
  -H "Authorization: Bearer <business_token>"

# Response:
# {
#   "success": true,
#   "profile": {
#     "user_id": "user_...",
#     "verified": true,
#     "tier": "layer_1",
#     "email": "user@example.com"  // Only if sharedData includes 'email'
#   },
#   "scoped_to_app": "app_...",
#   "token_type": "business"
# }`
    },
    'Token Verification': {
      title: 'Verify Tokens (JWKS)',
      description: 'Verify the RS256 business_token on your backend using our JWKS endpoint. You do NOT need to call our API to verify tokens.',
      filename: 'verify-token.js',
      code: `const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://casperid.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

jwt.verify(business_token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
  if (err) console.error('Token invalid');
  else console.log('User ID:', decoded.sub);
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
  res.send('Received');
});`
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
              items: ['Quickstart'],
            },
            {
              title: 'Passkey API',
              items: ['Registration Flow', 'Authentication Flow', 'User Profile'],
            },
            {
              title: 'Backend Integration',
              items: ['Token Verification', 'Webhooks'],
            }
          ].map((section, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">{section.title}</h4>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveDoc(item as DocSection)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm text-left transition-all ${activeDoc === item ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'text-text-main hover:bg-background-light font-medium'
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto bg-white p-8 md:p-12">
        <div className="max-w-4xl mx-auto flex flex-col xl:flex-row gap-12">
          <div className="flex-1 min-0">
            <div className="flex flex-col gap-2 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-text-main text-4xl font-black tracking-tight">{activeContent.title}</h2>
              <p className="text-lg text-text-muted leading-relaxed">{activeContent.description}</p>
            </div>

            <section className="prose prose-slate max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeContent.code && (
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
                  <div className="bg-[#1e1e2e] p-6 rounded-b-xl font-mono text-sm leading-relaxed overflow-x-auto text-[#d9e0ee] shadow-inner">
                    <pre>
                      <code>{activeContent.code}</code>
                    </pre>
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold text-text-main mb-4">Implementation Details</h3>
              <p className="text-text-muted mb-6 leading-relaxed">
                Ensure you handle errors gracefully. Standard HTTP 4xx and 5xx codes are used.
                For Passkey flows, the <code>deviceInfo</code> object helps us track sessions securely.
              </p>
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
