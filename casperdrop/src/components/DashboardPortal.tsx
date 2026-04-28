import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CasperIDModal } from '@casperid/react';
import '@casperid/react/style.css';
import {
  LayoutGrid,
  Rocket,
  Award,
  ShieldCheck,
  Settings,
  HelpCircle,
  Download,
  Fingerprint,
  Users,
  Wallet,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_CASPERID_API_KEY ?? '';
const API_BASE_URL = import.meta.env.VITE_CASPERID_API_BASE_URL ?? 'https://apis.casperid.com';

interface VerificationEntry {
  id: string;
  typeName: string;
  proofId: string;
  date: string;
  status: 'Verified' | 'Failed';
  sessionToken: string;
  hasBusinessToken: boolean;
}

function formatProofId(token: string): string {
  // Show first 6 and last 4 chars of the session token as the "proof hash"
  if (token.length < 12) return token;
  return `0x${token.slice(0, 6)}...${token.slice(-4)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function DashboardPortal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [history, setHistory] = useState<VerificationEntry[]>([]);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const handleClaimClick = () => {
    setSdkError(null);
    setIsModalOpen(true);
  };

  const handleAuthSuccess = (sessionToken: string, data?: { businessToken?: string }) => {
    const now = new Date().toISOString();
    const entry: VerificationEntry = {
      id: now,
      typeName: data?.businessToken ? 'Business Auth' : 'Identity Auth',
      proofId: formatProofId(sessionToken),
      date: formatDate(now),
      status: 'Verified',
      sessionToken,
      hasBusinessToken: !!data?.businessToken,
    };
    setHistory((prev) => [entry, ...prev]);
    setIsVerified(true);
    setIsModalOpen(false);
  };

  const handleAuthError = (err: Error) => {
    console.error('[CasperID SDK]', err);
    setSdkError(err.message);
    const now = new Date().toISOString();
    setHistory((prev) => [
      {
        id: now,
        typeName: 'Auth Attempt',
        proofId: '—',
        date: formatDate(now),
        status: 'Failed',
        sessionToken: '',
        hasBusinessToken: false,
      },
      ...prev,
    ]);
  };

  return (
    <div className="flex bg-background-warm min-h-screen">
      {/* SideNavBar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-primary/5 bg-grey-muted/30 h-screen sticky top-0 pt-32 pb-12 px-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center">
              <Fingerprint size={16} strokeWidth={1.5} className="text-primary/60" />
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-background-warm rounded-full ${isVerified ? 'bg-primary' : 'bg-primary/20'}`}></span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-serif italic font-bold text-xs tracking-tight">
              {isVerified ? 'Verified Member' : 'Anonymous'}
            </h3>
            <span className="font-mono text-[8px] uppercase tracking-widest opacity-40">
              {isVerified ? 'CasperID Verified' : 'Unverified Status'}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={<LayoutGrid size={16} strokeWidth={1.5} />} label="Overview" />
          <SidebarItem icon={<Rocket size={16} strokeWidth={1.5} />} label="Live Portfolio" />
          <SidebarItem icon={<Award size={16} strokeWidth={1.5} />} label="Allocations" active />
          <SidebarItem icon={<ShieldCheck size={16} strokeWidth={1.5} />} label="Methodology" />
        </nav>

        <nav className="space-y-1 border-t border-primary/5 pt-8">
          <SidebarItem icon={<Settings size={14} strokeWidth={1.5} />} label="Settings" small />
          <SidebarItem icon={<HelpCircle size={14} strokeWidth={1.5} />} label="Support" small />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-12 px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-4 py-1.5 text-white text-[9px] font-mono tracking-widest uppercase rounded-full flex items-center gap-2 transition-colors ${isVerified ? 'bg-primary' : 'bg-primary/30'}`}>
                <ShieldCheck size={10} />
                {isVerified ? 'Verified' : 'Unverified'}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest opacity-40">Proof: #C992-8821</span>
            </div>
            <h1 className="text-6xl font-serif font-black italic tracking-tighter text-primary mb-4 leading-none">Journal.01</h1>
            <p className="text-sm font-light text-text-body max-w-md">Refined allocations and verified status active for the current volume.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-primary/5">
          {/* Main Balance Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:col-span-2 bg-background-warm p-12 pr-20 relative overflow-hidden group"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-16">
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/40">Portfolio Balance</span>
                  <div className="text-primary/20">
                    <Wallet size={24} strokeWidth={1} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif font-bold italic tracking-tighter text-primary">Allocated Rewards</h2>
                  <div className="flex items-baseline gap-6">
                    <span className="text-[100px] font-serif font-black leading-none outline-text tracking-tighter">10,000</span>
                    <span className="text-xl font-mono tracking-[0.3em] uppercase opacity-40">$CASPER</span>
                  </div>
                </div>
              </div>

              <div className="mt-20 flex flex-col sm:flex-row gap-6">
                <motion.button
                  id="claim-vault-btn"
                  onClick={handleClaimClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-primary text-white py-5 px-8 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer"
                >
                  <Download size={14} />
                  Claim to Vault
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-5 border border-primary/20 flex flex-col items-center justify-center font-mono text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  View Pools
                </motion.button>
              </div>

              {/* SDK Error Banner */}
              <AnimatePresence>
                {sdkError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mt-6 flex items-center gap-3 px-5 py-4 border border-red-400/30 bg-red-50 text-red-700"
                  >
                    <XCircle size={14} />
                    <span className="font-mono text-[9px] uppercase tracking-widest">{sdkError}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Stats Column */}
          <div className="space-y-px">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-background-warm p-10 h-1/2 border-l border-primary/5"
            >
              <div className="flex items-center gap-3 mb-8 opacity-40">
                <Zap size={16} strokeWidth={1} />
                <span className="font-mono text-[10px] uppercase tracking-widest">Boost Factor</span>
              </div>
              <div className="text-4xl font-serif italic font-bold text-primary mb-6">2.4x Multiplier</div>
              <div className="w-full h-[1px] bg-primary/10 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  className="h-full bg-primary"
                />
              </div>
              <p className="mt-8 font-mono text-[9px] uppercase tracking-widest opacity-40">Top 15% Verified</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-background-warm p-10 h-1/2 border-l border-t border-primary/5"
            >
              <div className="flex items-center gap-3 mb-8 opacity-40">
                <Clock size={16} strokeWidth={1} />
                <span className="font-mono text-[10px] uppercase tracking-widest">Snapshot</span>
              </div>
              <div className="text-4xl font-serif italic font-bold text-primary">14:22:08</div>
              <p className="mt-8 font-mono text-[9px] uppercase tracking-widest opacity-40">Cycle: Volume 04</p>
            </motion.div>
          </div>

          {/* History Table — populated by SDK verification results */}
          <div className="md:col-span-3 bg-background-warm py-20 border-t border-primary/5 overflow-hidden">
            <div className="flex items-end justify-between px-2 mb-16">
              <div>
                <h3 className="text-4xl font-serif font-black italic tracking-tighter text-primary">History</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">Audit Trail / Proof Logs</span>
              </div>
              <button className="font-mono text-[10px] uppercase tracking-widest hover:line-through">
                Download PDF Audit
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="pb-8 text-[9px] uppercase tracking-[0.3em] opacity-40">Type</th>
                    <th className="pb-8 text-[9px] uppercase tracking-[0.3em] opacity-40">Proof Signature</th>
                    <th className="pb-8 text-[9px] uppercase tracking-[0.3em] opacity-40">Business Token</th>
                    <th className="pb-8 text-[9px] uppercase tracking-[0.3em] opacity-40">Date</th>
                    <th className="pb-8 text-[9px] uppercase tracking-[0.3em] opacity-40 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  <AnimatePresence>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <span className="font-mono text-[10px] uppercase tracking-widest opacity-20">
                            No verification records yet — click "Claim to Vault" to begin
                          </span>
                        </td>
                      </tr>
                    ) : (
                      history.map((entry) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group hover:bg-primary/5 transition-colors"
                        >
                          <td className="py-8">
                            <span className="font-serif italic font-bold text-lg">{entry.typeName}</span>
                          </td>
                          <td className="py-8 text-xs opacity-40 font-mono">{entry.proofId}</td>
                          <td className="py-8 text-xs">
                            {entry.hasBusinessToken ? (
                              <span className="flex items-center gap-2 text-primary/60">
                                <CheckCircle2 size={12} />
                                <span className="text-[9px] uppercase tracking-widest">Present</span>
                              </span>
                            ) : (
                              <span className="text-[9px] uppercase tracking-widest opacity-30">—</span>
                            )}
                          </td>
                          <td className="py-8 text-xs opacity-40">{entry.date}</td>
                          <td className="py-8 text-right">
                            <span
                              className={`text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                                entry.status === 'Verified'
                                  ? 'border-primary/20 text-primary'
                                  : 'border-red-300 text-red-500'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* CasperID SDK Modal */}
      <CasperIDModal
        isOpen={isModalOpen}
        apiKey={API_KEY}
        apiBaseUrl={API_BASE_URL}
        requiredTier="L2"
        onSuccess={handleAuthSuccess}
        onClose={() => setIsModalOpen(false)}
        onError={handleAuthError}
        theme={{ mode: 'light' }}
      />
    </div>
  );
}

function SidebarItem({ icon, label, active = false, small = false }: any) {
  return (
    <a
      href="#"
      className={`flex items-center gap-4 px-4 py-3 transition-all font-mono uppercase tracking-widest ${
        active ? 'text-primary' : 'text-primary/40 hover:text-primary'
      } ${small ? 'text-[9px]' : 'text-[10px]'}`}
    >
      <span className={active ? 'text-primary' : 'text-primary/40'}>{icon}</span>
      <span className={active ? 'line-through' : ''}>{label}</span>
      {active && <div className="ml-auto w-1 h-1 bg-primary rounded-full" />}
    </a>
  );
}
