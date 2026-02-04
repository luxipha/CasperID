
import React, { useState } from 'react';

type DocSection = 'Quickstart' | 'Architecture Overview' | 'Javascript / Node.js' | 'React Hooks' | 'Python' | 'Go' | 'Authentication' | 'Identity Verifications' | 'Webhooks API' | 'Onboarding with Web3' | 'KYC Compliance Flow';

const Docs: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<DocSection>('Quickstart');

  const docContent: Record<DocSection, { title: string; description: string; code?: string; filename?: string }> = {
    'Quickstart': {
      title: 'Quickstart Guide',
      description: 'Get up and running with CasperID in less than 5 minutes. This guide covers the basic setup and your first verification flow.',
      filename: 'quickstart.js',
      code: `import { CasperID } from '@casperid/business-sdk';\n\nconst client = new CasperID({\n  apiKey: 'sk_test_51...',\n  environment: 'sandbox'\n});`
    },
    'Architecture Overview': {
      title: 'Architecture Overview',
      description: 'CasperID uses a decentralized identity framework. Our platform acts as an abstraction layer between your app and the blockchain.',
      code: `// The B-Platform handles the complex zero-knowledge proof generation\n// and returns simple verification results to your backend.`
    },
    'Javascript / Node.js': {
      title: 'Javascript SDK',
      description: 'The official Javascript/Typescript library for CasperID. Perfect for both frontend and backend integrations.',
      filename: 'npm-install.sh',
      code: `npm install @casperid/business-sdk`
    },
    'React Hooks': {
      title: 'React Hooks Library',
      description: 'Ready-to-use React hooks for managing verification states and UI components.',
      filename: 'App.tsx',
      code: `const { verify, status } = useCasperID();\n\nreturn <button onClick={verify}>Verify Identity</button>;`
    },
    'Authentication': {
      title: 'Authentication API',
      description: 'Securely authenticate users using their CasperID credentials without ever storing sensitive data.',
      code: `GET /v1/auth/session`
    },
    'Identity Verifications': {
      title: 'Identity Verifications',
      description: 'Configure and trigger deep identity checks including Liveness, Age, and Document verification.',
      code: `client.verifications.create({\n  type: 'L2',\n  userId: 'user_99'\n});`
    },
    'Webhooks API': {
      title: 'Webhooks API',
      description: 'Subscribe to real-time events. We recommend verifying the signature on every payload.',
      code: `// Example verification of webhook signature\nconst isValid = client.webhooks.verifySignature(payload, signature);`
    },
    'Python': { title: 'Python SDK', description: 'Integrate CasperID into your Python/Django/Flask applications.', code: 'pip install casperid-sdk' },
    'Go': { title: 'Go Client', description: 'High-performance Go client for high-throughput verification needs.', code: 'go get github.com/casperid/sdk-go' },
    'Onboarding with Web3': { title: 'Web3 Onboarding', description: 'Streamline the onboarding of wallet users with pre-verified identity proofs.' },
    'KYC Compliance Flow': { title: 'KYC Compliance', description: 'Automated compliance flows for institutional requirements.' }
  };

  const activeContent = docContent[activeDoc];

  return (
    <div className="flex h-full max-w-[1400px] mx-auto bg-white border border-border-muted rounded-2xl overflow-hidden shadow-sm">
      <aside className="w-64 border-r border-border-muted overflow-y-auto p-6 shrink-0 bg-background-light/30">
        <div className="flex flex-col gap-8">
          {[
            {
              title: 'Introduction',
              items: ['Quickstart', 'Architecture Overview'],
            },
            {
              title: 'SDKs & Libraries',
              items: ['Javascript / Node.js', 'React Hooks', 'Python', 'Go'],
            },
            {
              title: 'API Reference',
              items: ['Authentication', 'Identity Verifications', 'Webhooks API'],
            },
            {
              title: 'Tutorials',
              items: ['Onboarding with Web3', 'KYC Compliance Flow'],
            },
          ].map((section, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">{section.title}</h4>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveDoc(item as DocSection)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      activeDoc === item ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'text-text-main hover:bg-background-light font-medium'
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
                    <span className="text-xs font-mono text-white/50">{activeContent.filename || 'code-snippet.ts'}</span>
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
                When implementing the {activeContent.title}, ensure your application handles both synchronous and asynchronous callbacks correctly. Use our dashboard to monitor integration health in real-time.
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
