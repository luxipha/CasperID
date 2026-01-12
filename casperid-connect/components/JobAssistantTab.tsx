
import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Target,
    Zap,
    FileText,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    Brain
} from 'lucide-react';
import { calculateATSScore, ATSResult } from '../utils/atsAlgorithm';

interface JobDetails {
    title: string;
    description: string;
    url: string;
}

interface JobAssistantTabProps {
    userData: any;
}

const JobAssistantTab: React.FC<JobAssistantTabProps> = ({ userData }) => {
    const [job, setJob] = useState<JobDetails | null>(null);
    const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [matchScore, setMatchScore] = useState(0);

    useEffect(() => {
        // Request job details from the active tab
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_JOB_DETAILS' }, (response) => {
                        if (response && response.title) {
                            setJob(response);
                            // Mock match score for now
                            setMatchScore(Math.floor(Math.random() * 40) + 60);
                        }
                    });
                }
            });
        }

        // Calculate ATS score from profile
        if (userData) {
            const profile = userData.profile || {};
            const result = calculateATSScore(
                profile,
                profile.experiences || [],
                profile.education || [],
                profile.skills || []
            );
            setAtsResult(result);
        }
    }, [userData]);

    const handleGenerateCoverLetter = () => {
        if (!job || !userData?.profile) return;
        setIsGenerating(true);

        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                type: 'GENERATE_COVER_LETTER',
                profileData: userData.profile,
                jobDescription: job.description
            }, (response) => {
                setIsGenerating(false);
                if (response?.success) {
                    alert("Cover letter generated! You can now use 'One-Click Apply' to fill it.");
                    // We can store it in state if needed
                    localStorage.setItem('casperid_last_cover_letter', response.data.coverLetter);
                } else {
                    alert("Generation failed: " + (response?.error || "Unknown error"));
                }
            });
        }
    };

    const handleOneClickApply = () => {
        const letter = localStorage.getItem('casperid_last_cover_letter');
        if (!letter) {
            alert("Please generate a cover letter first!");
            return;
        }

        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'FILL_COVER_LETTER',
                        content: letter
                    });
                    alert("Filling application forms with your data...");
                }
            });
        }
    };

    return (
        <div className="flex-1 px-5 pb-6 space-y-5 overflow-y-auto bg-[#F8F9FF]/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="pt-2">
                <h2 className="text-[#1A1A2E] text-[22px] font-extrabold mb-1 tracking-tight">Job Assistant</h2>
                <p className="text-[#626D85] text-[13px] font-medium leading-relaxed">
                    Optimize your application with AI and CasperID.
                </p>
            </div>

            {/* Current Job Detection */}
            {job ? (
                <div className="bg-white p-5 rounded-2xl border-2 border-primary/10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    </div>
                    <div className="flex items-start gap-4 mb-4">
                        <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <h4 className="text-[15px] font-extrabold text-[#1A1A2E] mb-1">{job.title}</h4>
                            <p className="text-[11px] font-bold text-[#626D85] truncate max-w-[200px]">{new URL(job.url).hostname}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[10px] font-extrabold text-[#626D85] uppercase tracking-wider">AI Match Score</span>
                                <span className="text-sm font-black text-primary">{matchScore}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-1000 ease-out"
                                    style={{ width: `${matchScore}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center text-center">
                    <div className="size-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                        <Target size={28} />
                    </div>
                    <h4 className="text-sm font-bold text-[#1A1A2E] mb-1">No Job Detected</h4>
                    <p className="text-[11px] font-medium text-[#626D85]">Open a job post on LinkedIn or Indeed to start.</p>
                </div>
            )}

            {/* ATS Score Card */}
            <div className="bg-gradient-to-br from-[#1A1A2E] to-[#2D2D4A] p-5 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none rotate-12 scale-150 transform -translate-y-4">
                    <TrendingUp size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-black tracking-tight mb-0.5">ATS Readiness</h3>
                            <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Resume Optimizer</p>
                        </div>
                        <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                            <span className="text-xl font-black">{atsResult?.score || 0}%</span>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        {atsResult?.feedback.map((tip, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-white/80">
                                <Zap size={12} className="text-yellow-400 min-w-[12px]" strokeWidth={3} />
                                {tip}
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-3 bg-white text-[#1A1A2E] rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg active:scale-[0.98]">
                        Review Full Report
                        <ArrowRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={handleGenerateCoverLetter}
                    disabled={!job || isGenerating}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all group disabled:opacity-50 disabled:hover:bg-white"
                >
                    <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                        {isGenerating ? <Zap size={20} className="animate-spin" /> : <Brain size={20} />}
                    </div>
                    <span className="text-[11px] font-black text-[#1A1A2E]">Draft Cover Letter</span>
                </button>

                <button
                    onClick={handleOneClickApply}
                    disabled={!job}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-green-400/30 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:hover:bg-white"
                >
                    <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 mb-2 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                    </div>
                    <span className="text-[11px] font-black text-[#1A1A2E]">One-Click Apply</span>
                </button>
            </div>

            {/* Trust Banner */}
            <div className="flex items-center justify-center gap-2 py-2">
                <ShieldCheck size={14} className="text-primary" strokeWidth={3} />
                <span className="text-[10px] font-extrabold text-[#626D85] uppercase tracking-widest">Secured by CasperID Protocol</span>
            </div>
        </div>
    );
};

export default JobAssistantTab;
