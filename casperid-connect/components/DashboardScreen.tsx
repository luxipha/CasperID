import React, { useState, useMemo, useEffect } from 'react';
import { getStorageData } from '../services/storageService';
import {
  ShieldCheck,
  Copy,
  Wallet,
  Briefcase,
  UserCheck,
  Settings,
  LogOut,
  Shield,
  CheckCircle,
  TrendingUp,
  Search,
  X,
  SlidersHorizontal,
  ArrowRightLeft,
  Box,
  Image as ImageIcon,
  Link2Off,
  Share2,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  onShare: () => void;
  onRevoke: (domain: string) => void;
  onDisconnect: () => void;
}

interface TabProps {
  onShare?: () => void;
  userData: any;
  onRevoke?: (domain: string) => void;
  onDisconnect?: () => void;
}

const WalletTab: React.FC<TabProps> = ({ onShare, userData }) => (
  <div className="flex-1 px-5 pb-6 space-y-4 overflow-y-auto bg-[#F8F9FF]/30">
    {/* Verification Card */}
    <div className={`relative p-5 rounded-2xl border overflow-hidden group mt-4 ${userData?.verified ? 'bg-[#F0FFF4] border-[#C6F6D5]' : 'bg-gray-50 border-gray-100'
      }`}>
      <div className={`absolute -right-4 -top-4 opacity-10 pointer-events-none rotate-12 ${userData?.verified ? 'text-green-600' : 'text-gray-400'
        }`}>
        <ShieldCheck size={120} />
      </div>
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-green-50">
          <Shield className={`size-7 ${userData?.verified ? 'text-green-500' : 'text-gray-300'}`} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <h3 className="text-[#1A1A2E] text-sm font-extrabold">
              {userData?.verified ? 'Identity: Full KYC Verified' : 'Identity: Unverified'}
            </h3>
            {userData?.verified && (
              <CheckCircle className="text-green-500 size-4" strokeWidth={3} />
            )}
          </div>
          <p className="text-[#626D85] text-[11px] font-medium mb-3">
            {userData?.verified ? 'Gov ID, Liveness, AML Passed' : 'Verification required to access features'}
          </p>
          <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase ${userData?.verified ? 'bg-[#C6F6D5] text-green-800' : 'bg-gray-200 text-gray-500'
            }`}>
            {userData?.tier || 'Unverified'}
          </div>
        </div>
      </div>
    </div>

    {/* Identity Info Card */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-dashed border-gray-100">
        <span className="text-[11px] font-bold text-[#626D85] uppercase tracking-wider">Profile ID</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-[#1A1A2E]">{userData?.humanId || userData?.human_id || 'not-generated'}</span>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Copy size={16} />
          </button>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#626D85] uppercase tracking-wider">CID Domain</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-400">
            {userData?.humanId || userData?.human_id ? `${userData?.humanId || userData?.human_id}.cid` : 'pending.cid'}
          </span>
          <button className="text-gray-300 hover:text-gray-400 transition-colors">
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
    <div className="flex gap-4">
      <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <h5 className="text-[9px] font-extrabold text-[#626D85] uppercase tracking-widest mb-2">Lifetime Earnings</h5>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-[#1A1A2E]">---</span>
          <span className="text-xs font-bold text-gray-400">tokens</span>
        </div>
      </div>
      <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <h5 className="text-[9px] font-extrabold text-[#626D85] uppercase tracking-widest mb-2">This Month</h5>
        <div className="flex items-center gap-1.5 text-green-500 mb-1">
          <TrendingUp size={16} strokeWidth={3} />
          <span className="text-xl font-extrabold">---</span>
        </div>
        <p className="text-[11px] font-bold text-gray-400">tokens</p>
      </div>
    </div>

    {/* Synced Resume & CV Highlights */}
    {userData?.profile && (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-dashed border-gray-100 pb-2">
          <span className="text-[11px] font-extrabold text-[#626D85] uppercase tracking-wider">Synced Profile Highlights</span>
          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-50 text-[#8652E2] border border-purple-100">
            Active CV
          </span>
        </div>

        {/* Experience Highlight */}
        {userData.profile.experiences && userData.profile.experiences.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Latest Experience</span>
            <div className="text-xs font-bold text-[#1A1A2E]">{userData.profile.experiences[0].job_title}</div>
            <div className="text-[11px] text-[#626D85] font-medium">{userData.profile.experiences[0].company_name}</div>
          </div>
        )}

        {/* Education Highlight */}
        {userData.profile.education && userData.profile.education.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Latest Education</span>
            <div className="text-xs font-bold text-[#1A1A2E]">{userData.profile.education[0].degree}</div>
            <div className="text-[11px] text-[#626D85] font-medium">
              {userData.profile.education[0].school_name || userData.profile.education[0].school}
            </div>
          </div>
        )}

        {/* Skills Highlight */}
        {userData.profile.skills && userData.profile.skills.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">Skills Summary</span>
            <div className="flex flex-wrap gap-1.5">
              {userData.profile.skills.slice(0, 4).map((skill: any, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[9px] font-bold text-[#1A1A2E]">
                  {skill.skill_name || skill.name}
                </span>
              ))}
              {userData.profile.skills.length > 4 && (
                <span className="px-1.5 py-0.5 bg-gray-50 rounded-md text-[9px] font-extrabold text-gray-400">
                  +{userData.profile.skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Counts / Other sections */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50 text-center">
          <div className="bg-[#FBFBFF] rounded-lg p-1.5 border border-gray-50">
            <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Projects</span>
            <span className="text-xs font-extrabold text-[#1A1A2E]">{userData.profile.projects?.length || 0}</span>
          </div>
          <div className="bg-[#FBFBFF] rounded-lg p-1.5 border border-gray-50">
            <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Certs</span>
            <span className="text-xs font-extrabold text-[#1A1A2E]">{userData.profile.certifications?.length || 0}</span>
          </div>
          <div className="bg-[#FBFBFF] rounded-lg p-1.5 border border-gray-50">
            <span className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Langs</span>
            <span className="text-xs font-extrabold text-[#1A1A2E]">{userData.profile.languages?.length || 0}</span>
          </div>
        </div>
      </div>
    )}



    {/* Share Button */}
    <div className="flex justify-center pt-2">
      <button
        onClick={onShare}
        className="w-[85%] py-4 bg-gradient-to-r from-[#8652E2] to-[#7C3AED] text-white rounded-2xl font-bold shadow-xl shadow-purple-200 hover:shadow-purple-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Share2 size={20} />
        Share Identity with Website
      </button>
    </div>
  </div>
);

interface Job {
  id: number;
  title: string;
  company: string;
  salary: string;
  location: string;
  requirement: string;
  badge: string;
  badgeIcon: any;
  badgeColor: string;
  badgeBorder: string;
  badgeTextColor: string;
}


const JobsTab: React.FC<{ userData: any, currentJob: any, fetchData: () => void }> = ({ userData, currentJob, fetchData }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  // Removed mock data filtering

  const handleStartMatching = async () => {
    console.log('[CasperID Popup] Start AI Matching clicked. currentJob:', currentJob);
    console.log('[CasperID Popup] Current job description length:', currentJob?.description?.length || 0);

    if (!currentJob || isMatching) {
      console.log('[CasperID Popup] Aborting - no job or already matching');
      return;
    }

    if (!currentJob.description || currentJob.description.length < 50) {
      console.error('[CasperID Popup] Job description too short or missing!');
      setMatchError('Job description not found. Try refreshing the page.');
      return;
    }

    setIsMatching(true);
    setMatchError(null);

    console.log('[CasperID Popup] Sending MATCH_JOB message to background...');

    try {
      chrome.runtime.sendMessage({
        type: 'MATCH_JOB',
        jobDescription: currentJob.description
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[CasperID Popup] chrome.runtime.lastError:', chrome.runtime.lastError.message);
          setIsMatching(false);
          setMatchError('Extension communication error. Try reloading.');
          return;
        }

        console.log('[CasperID Popup] Received response from background:', response);
        setIsMatching(false);

        if (!response) {
          console.error('[CasperID Popup] No response received from background!');
          setMatchError('No response from extension. Try reloading.');
          return;
        }

        if (!response.success) {
          setMatchError(response.error || 'Failed to match job');
        } else {
          console.log('[CasperID Popup] Match success! Refreshing data.');
          fetchData();
        }
      });
    } catch (e: any) {
      console.error('[CasperID Popup] sendMessage threw exception:', e);
      setIsMatching(false);
      setMatchError('Failed to communicate with extension: ' + e.message);
    }
  };

  const handleGeneratePitch = async () => {
    console.log('[CasperID Popup] Generate Pitch clicked');

    if (!currentJob || isGeneratingPitch) return;

    setIsGeneratingPitch(true);
    setPitchError(null);

    try {
      chrome.runtime.sendMessage({
        type: 'GENERATE_COVER_LETTER',
        jobDescription: currentJob.description
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[CasperID Popup] chrome.runtime.lastError:', chrome.runtime.lastError.message);
          setIsGeneratingPitch(false);
          setPitchError('Extension communication error. Try reloading.');
          return;
        }

        console.log('[CasperID Popup] Cover letter response:', response);
        setIsGeneratingPitch(false);

        if (!response) {
          setPitchError('No response from extension. Try reloading.');
          return;
        }

        if (!response.success) {
          setPitchError(response.error || 'Failed to generate pitch');
        } else {
          console.log('[CasperID Popup] Pitch generated! Refreshing data.');
          fetchData();
          setShowCoverLetter(true);
        }
      });
    } catch (e: any) {
      console.error('[CasperID Popup] sendMessage threw exception:', e);
      setIsGeneratingPitch(false);
      setPitchError('Failed to communicate with extension: ' + e.message);
    }
  };

  const handleCopyPitch = () => {
    const content = currentJob?.coverLetter?.content;
    if (content) {
      navigator.clipboard.writeText(content);
      // Could add a toast notification here
    }
  };

  const results = currentJob?.matchResults;
  const coverLetter = currentJob?.coverLetter;
  if (results) {
    console.log('[CasperID Popup] Rendering with match results:', results);
  }

  return (
    <div className="flex-1 px-5 pb-6 space-y-5 overflow-y-auto bg-[#F8F9FF]/30 animate-in fade-in duration-300">
      <div className="pt-2">
        <h2 className="text-[#1A1A2E] text-[22px] font-extrabold mb-1 tracking-tight">Job Assistant</h2>
        <p className="text-[#626D85] text-[13px] font-medium leading-relaxed">
          {currentJob ? "I've detected a job on this page! See how you match." : "Curated opportunities based on your CasperID profile."}
        </p>
      </div>

      {currentJob && (
        <div className="bg-gradient-to-br from-[#8652E2] to-[#7C3AED] p-5 rounded-2xl shadow-xl shadow-purple-200 border border-white/20 animate-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10">
              <ShieldCheck size={14} className="text-white" />
              <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Live Match</span>
            </div>
            <span className="text-[10px] font-bold text-white/70">{currentJob.platform}</span>
          </div>
          <h3 className="text-lg font-extrabold text-white mb-1 leading-tight">{currentJob.title}</h3>
          <p className="text-sm font-bold text-white/80 mb-4">{currentJob.company}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="block text-[9px] font-extrabold text-white/60 uppercase tracking-widest mb-1">ATS Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-white">
                  {results ? `${results.matchScore}%` : isMatching ? '...' : '--%'}
                </span>
                {results && results.matchScore >= 80 && (
                  <div className="size-1.5 rounded-full bg-green-400 animate-pulse"></div>
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="block text-[9px] font-extrabold text-white/60 uppercase tracking-widest mb-1">Status</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {isMatching ? (
                  <>
                    <div className="size-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    Matching...
                  </>
                ) : results ? (
                  <>
                    <CheckCircle size={14} className="text-green-400" /> Analysis Done
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} /> Analysis Ready
                  </>
                )}
              </span>
            </div>
          </div>

          {results && (
            <div className="space-y-4 mb-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <h5 className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2">Why you fit</h5>
                <p className="text-xs font-semibold text-white/90 leading-relaxed italic">
                  "{results.summary}"
                </p>
              </div>

              {results.skillGaps && results.skillGaps.length > 0 && (
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <h5 className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2.5">Missing Skills</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {results.skillGaps.map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-red-400/20 text-red-100 rounded-md text-[9px] font-extrabold border border-red-400/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {matchError && (
            <p className="text-[10px] font-bold text-red-200 mb-3 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              ⚠️ {matchError}
            </p>
          )}

          <button
            onClick={handleStartMatching}
            disabled={isMatching}
            className={`w-full py-3 ${isMatching ? 'bg-white/50 cursor-not-allowed' : 'bg-white hover:bg-gray-50'} text-[#8652E2] rounded-xl font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2`}
          >
            {isMatching ? 'Calculating Match...' : results ? 'Re-calculate Match' : 'Start AI Matching'}
            {!isMatching && <ArrowRightLeft size={16} />}
          </button>

          {/* Generate Pitch Button - only show after matching is done */}
          {results && (
            <button
              onClick={handleGeneratePitch}
              disabled={isGeneratingPitch}
              className={`w-full py-3 mt-3 ${isGeneratingPitch ? 'bg-green-400/50 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'} text-white rounded-xl font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2`}
            >
              {isGeneratingPitch ? 'Generating Pitch...' : coverLetter ? 'Regenerate Pitch' : 'Generate Personalized Pitch'}
              {!isGeneratingPitch && <Sparkles size={16} />}
            </button>
          )}

          {pitchError && (
            <p className="text-[10px] font-bold text-red-200 mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              ⚠️ {pitchError}
            </p>
          )}

          {/* Cover Letter Display */}
          {coverLetter && (
            <div className="mt-4 space-y-3 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest">Your Pitch</h5>
                  <button
                    onClick={handleCopyPitch}
                    className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-md text-[9px] font-bold text-white transition-colors"
                  >
                    <Copy size={10} /> Copy
                  </button>
                </div>
                <p className="text-[10px] font-bold text-white/80 mb-2">Subject: {coverLetter.subject}</p>
                <p className="text-xs font-medium text-white/90 leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {coverLetter.content}
                </p>
              </div>

              {coverLetter.keyHighlights && coverLetter.keyHighlights.length > 0 && (
                <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <h5 className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2">Key Highlights</h5>
                  <ul className="space-y-1">
                    {coverLetter.keyHighlights.map((highlight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] font-medium text-white/80">
                        <CheckCircle size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!currentJob && (
        <>
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, company..."
              className="w-full h-[48px] pl-11 pr-12 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-sm font-medium transition-all shadow-sm"
            />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-60">
            <div className="size-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
              <Sparkles size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">Discovering opportunities...</p>
            <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] text-center">
              Navigate to a job post on LinkedIn or Indeed to see AI match results.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const PermsTab: React.FC<{ permissions: any[], onRevoke: (domain: string) => void }> = ({ permissions, onRevoke }) => (
  <div className="flex-1 px-5 pb-6 space-y-6 overflow-y-auto bg-[#F8F9FF]/30 animate-in fade-in duration-300">
    <div className="pt-2">
      <h2 className="text-[#1A1A2E] text-[22px] font-extrabold mb-2 tracking-tight">Connected Apps</h2>
      <p className="text-[#626D85] text-[13px] font-medium leading-relaxed">
        Review and revoke access for applications connected through your CasperID.
      </p>
    </div>

    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 px-6 border-b border-gray-50 bg-[#FBFBFF]">
        <h4 className="text-[11px] font-extrabold text-[#1A1A2E] uppercase tracking-widest">
          {permissions.length} Connected Applications
        </h4>
      </div>

      <div className="divide-y divide-gray-50">
        {permissions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="size-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Box size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">No applications connected yet</p>
          </div>
        ) : (
          permissions.map((app, idx) => (
            <div key={app.grantId || idx} className="p-5 flex items-center justify-between group hover:bg-[#F8F9FF]/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`size-11 rounded-xl flex items-center justify-center shadow-sm ${idx % 3 === 0 ? 'bg-[#FFF1F5] text-[#FF007A]' :
                  idx % 3 === 1 ? 'bg-[#EBF4FF] text-[#2EBAC6]' :
                    'bg-[#E0F2FE] text-[#2081E2]'
                  }`}>
                  {idx % 3 === 0 ? <ArrowRightLeft size={24} /> :
                    idx % 3 === 1 ? <Box size={24} /> :
                      <ImageIcon size={24} />}
                </div>
                <div>
                  <h5 className="text-[13px] font-extrabold text-[#1A1A2E]">{app.name}</h5>
                  <p className="text-[10px] font-medium text-[#626D85]">
                    {app.permissions?.join(', ') || 'Standard Access'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRevoke(app.domain || app.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FED7D7] bg-[#FFF5F5] text-[#E63946] text-[10px] font-extrabold uppercase tracking-wider hover:bg-[#FEE2E2] transition-colors"
              >
                <Link2Off size={16} />
                Revoke
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const SettingsTab: React.FC<{ onDisconnect: () => void, userData: any }> = ({ onDisconnect, userData }) => {
  const [autoApprove, setAutoApprove] = useState(false);

  return (
    <div className="flex-1 px-5 pb-6 space-y-6 overflow-y-auto bg-[#F8F9FF]/30 animate-in fade-in duration-300">
      <div className="pt-2">
        <h2 className="text-[#1A1A2E] text-[22px] font-extrabold mb-2 tracking-tight">Settings</h2>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 px-6 border-b border-gray-50 bg-[#FBFBFF]">
          <h4 className="text-[11px] font-extrabold text-[#1A1A2E] uppercase tracking-widest">General</h4>
        </div>
        <div className="p-6 flex items-center justify-between">
          <span className="text-sm font-bold text-[#1A1A2E]">Auto-approve trusted sites</span>
          <button
            onClick={() => setAutoApprove(!autoApprove)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${autoApprove ? 'bg-[#8652E2]' : 'bg-gray-200'}`}
          >
            <div className={`size-4.5 bg-white rounded-full shadow-sm absolute transition-all ${autoApprove ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 px-6 border-b border-gray-50 bg-[#FBFBFF]">
          <h4 className="text-[11px] font-extrabold text-[#1A1A2E] uppercase tracking-widest">Wallet</h4>
        </div>
        <div className="p-6">
          <button
            onClick={onDisconnect}
            className="w-full py-3.5 border border-[#FED7D7] bg-[#FFF5F5] text-[#E63946] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FEE2E2] transition-all"
          >
            <LogOut size={20} />
            Disconnect Identity
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 px-6 border-b border-gray-50 bg-[#FBFBFF]">
          <h4 className="text-[11px] font-extrabold text-[#1A1A2E] uppercase tracking-widest">About CasperID</h4>
        </div>
        <div className="p-6 text-center">
          <div className="w-full py-4 bg-[#F8F9FA] rounded-xl flex items-center justify-center text-sm font-mono font-bold text-gray-500 border border-gray-100">
            Version 1.1.0 (Refined)
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardScreen: React.FC<DashboardProps> = ({ onShare, onRevoke, onDisconnect }) => {
  const [activeTab, setActiveTab] = useState('Identity'); // Default to Identity
  const [userData, setUserData] = useState<any>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [currentJob, setCurrentJob] = useState<any>(null);

  const fetchData = async () => {
    const data = await getStorageData();
    console.log('[CasperID Popup] Fetched storage data:', {
      hasUserData: !!data.userData,
      hasCurrentJob: !!data.currentJob,
      hasMatchResults: !!data.currentJob?.matchResults
    });
    setUserData(data.userData);
    setPermissions(data.permissions || []);

    // Verify the stored job matches the current tab
    if (data.currentJob && typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const currentUrl = tabs[0]?.url || '';
          const storedJobUrl = data.currentJob?.url || '';

          // Check if we're on a different domain/platform than the stored job
          const isOnLinkedIn = currentUrl.includes('linkedin.com');
          const isOnIndeed = currentUrl.includes('indeed.com');
          const storedIsLinkedIn = storedJobUrl.includes('linkedin.com');
          const storedIsIndeed = storedJobUrl.includes('indeed.com');

          // If platforms don't match, or we're not on a job platform, show stale warning or clear
          if ((isOnLinkedIn && storedIsIndeed) || (isOnIndeed && storedIsLinkedIn)) {
            console.log('[CasperID Popup] Platform mismatch - clearing stale job data');
            setCurrentJob(null);
            chrome.storage.local.remove('currentJob');
          } else if (!isOnLinkedIn && !isOnIndeed && data.currentJob) {
            // Not on a job platform at all - keep the job but could show it as "recent"
            console.log('[CasperID Popup] Not on a job platform, showing stored job as context');
            setCurrentJob(data.currentJob);
          } else {
            setCurrentJob(data.currentJob);
          }
        });
      } catch (e) {
        console.error('[CasperID Popup] Error checking tab URL:', e);
        setCurrentJob(data.currentJob);
      }
    } else {
      setCurrentJob(data.currentJob || null);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for storage changes (e.g. from content.js or background.js)
    const handleStorageChange = (changes: any) => {
      if (changes.userData || changes.permissions || changes.connected || changes.currentJob) {
        console.log('[CasperID Popup] Storage changed, refreshing UI...', changes);
        fetchData();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);

  const handleRevoke = async (domain: string) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'REVOKE_PERMISSION', domain }, () => {
        fetchData(); // Refresh UI
      });
    }
  };

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect? All synced data will be cleared.")) {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'DISCONNECT_IDENTITY' }, () => {
          window.location.reload(); // Force app restart to welcome screen
        });
      }
    }
  };

  const tabs = [
    { name: 'Identity', icon: ShieldCheck },
    { name: 'Jobs', icon: Briefcase },
    { name: 'Apps', icon: UserCheck },
    { name: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Identity': return <WalletTab onShare={onShare} userData={userData} />;
      case 'Jobs': return <JobsTab userData={userData} currentJob={currentJob} fetchData={fetchData} />;
      case 'Apps': return <PermsTab onRevoke={handleRevoke} permissions={permissions} />;
      case 'Settings': return <SettingsTab onDisconnect={handleDisconnect} userData={userData} />;
      default: return <WalletTab onShare={onShare} userData={userData} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <nav className="flex items-center px-4 border-b border-gray-100 bg-white z-20 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex-1 flex flex-col items-center py-3 relative transition-all ${activeTab === tab.name ? 'text-[#8652E2] bg-[#F5F1FF]/50' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <tab.icon className={`size-5.5 mb-1 ${activeTab === tab.name ? 'animate-in zoom-in-75 duration-300' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide uppercase">{tab.name}</span>
            {activeTab === tab.name && (
              <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#8652E2] rounded-t-full"></div>
            )}
          </button>
        ))}
      </nav>

      {renderContent()}
    </div>
  );
};

export default DashboardScreen;
