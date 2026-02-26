import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FooterMarketing } from '../FooterMarketing';
import HeaderMarketing from '../HeaderMarketing';
import { ArrowLeft, CheckCircle, Star, Zap, FileText, Loader2, Brain, Wallet, GraduationCap, Globe } from 'lucide-react';
import { getJobBySlug, Job } from '@/utils/jobLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import axios from 'axios';

interface CareerDetailPageProps {
    onBack: () => void;
    onApplySuccess: (jobTitle: string) => void;
}

interface ParsedJobContent {
    intro: string;
    responsibilities: string[];
    requirements: string[];
    benefits: { label: string; desc: string }[];
}

const CareerDetailPage: React.FC<CareerDetailPageProps> = ({ onBack, onApplySuccess }) => {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const [content, setContent] = useState<ParsedJobContent>({
        intro: '',
        responsibilities: [],
        requirements: [],
        benefits: []
    });
    const [isLoadingJob, setIsLoadingJob] = useState(true);
    const [isApplying, setIsApplying] = useState(false);

    useDocumentTitle(job ? `${job.title} | Careers | CasperID` : 'CasperID | Join the Team');

    const { user, isAuthenticated } = useAuth();
    const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3001/api' : '/api');

    useEffect(() => {
        const loadJob = async () => {
            if (id) {
                const fetchedJob = await getJobBySlug(id);
                if (fetchedJob) {
                    setJob(fetchedJob);
                    parseMarkdownContent(fetchedJob.content);
                }
            }
            setIsLoadingJob(false);
        };
        loadJob();
    }, [id]);

    const parseMarkdownContent = (md: string) => {
        // Simple regex-based parsing to extract sections
        // This assumes the standard template structure we defined

        const introMatch = md.match(/## (?:Why this role matters|Nhiệm vụ:.*?|The Mandate.*?)\n([\s\S]*?)(?=\n##|$)/);
        const responsibilitiesMatch = md.match(/## (?:Responsibilities|Trách nhiệm chính.*?|Key Responsibilities.*?)\n([\s\S]*?)(?=\n##|$)/);
        const requirementsMatch = md.match(/## (?:Requirements|Hồ sơ ứng viên.*?|Candidate Profile.*?)\n([\s\S]*?)(?=\n##|$)/);
        const benefitsMatch = md.match(/## (?:Why Join Us|Chế độ đãi ngộ & Thưởng.*?|Compensation & (?:Incentives|Professional Upside).*?)\n([\s\S]*?)(?=$)/);

        const parseList = (text: string) => {
            if (!text) return [];
            return text.split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => line.replace(/^-\s*/, '').trim());
        };

        const parseBenefits = (text: string) => {
            if (!text) return [];
            return text.split('\n')
                .filter(line => line.trim().startsWith('-'))
                .map(line => {
                    // Expected format: - **Label**: Description
                    const match = line.match(/\*\*(.*?)\*\*:\s*(.*)/);
                    if (match) return { label: match[1], desc: match[2] };
                    return null;
                })
                .filter((item): item is { label: string; desc: string } => item !== null);
        };

        setContent({
            intro: introMatch ? introMatch[1].trim() : '',
            responsibilities: parseList(responsibilitiesMatch?.[1] || ''),
            requirements: parseList(requirementsMatch?.[1] || ''),
            benefits: parseBenefits(benefitsMatch?.[1] || '')
        });
    };

    const handleApply = async () => {
        if (!isAuthenticated || !user) {
            window.location.href = '/dashboard';
            return;
        }

        setIsApplying(true);
        try {
            await axios.post(`${API_URL}/careers/apply`, {
                jobTitle: job?.title,
                applicantEmail: user.email || 'no-email-linked',
                applicantName: user.display_name || user.cns_name || 'CasperID User',
                applicantId: user.human_id || user.wallet || 'Unknown ID'
            });
            onApplySuccess(job?.title || 'Position');
        } catch (error) {
            console.error('Failed to apply:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoadingJob) {
        return (
            <div className="bg-bg-light min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="bg-bg-light min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-text-main mb-4">Job Not Found</h1>
                <button onClick={onBack} className="text-primary font-bold hover:underline">Back to Careers</button>
            </div>
        );
    }

    return (
        <div className="bg-bg-light min-h-screen">
            <HeaderMarketing />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">
                {/* Back Link */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-primary font-bold mb-8 hover:gap-3 transition-all"
                >
                    <ArrowLeft size={20} /> Back to All Jobs
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-primary/5 mb-12 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-full">{job.department}</span>
                            <span className="px-4 py-1.5 bg-gray-100 text-text-sub text-xs font-bold rounded-full">{job.location}</span>
                            <span className="px-4 py-1.5 bg-gray-100 text-text-sub text-xs font-bold rounded-full">{job.type}</span>
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">{job.salary}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-text-main mb-8 leading-tight">
                            {job.title}
                        </h1>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                            >
                                {isApplying ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                                {isAuthenticated && user ? 'Apply now with CasperID' : 'Log in to Apply'}
                            </button>
                        </div>
                    </div>

                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Content Sections - Restored Layout */}
                <div className="space-y-16">
                    {/* Why this role matters */}
                    {content.intro && (
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-1 bg-primary rounded-full"></div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight">Why this role matters</h2>
                            </div>
                            <p className="text-lg text-text-sub leading-relaxed whitespace-pre-wrap">
                                {content.intro}
                            </p>
                        </section>
                    )}

                    {/* Responsibilities & Requirements */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {content.responsibilities.length > 0 && (
                            <section>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em] mb-8">Responsibilities</h3>
                                <ul className="space-y-6">
                                    {content.responsibilities.map((item, i) => (
                                        <li key={i} className="flex gap-4">
                                            <CheckCircle size={20} className="text-primary shrink-0" />
                                            <span className="text-text-sub font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {content.requirements.length > 0 && (
                            <section>
                                <h3 className="text-sm font-black text-text-main uppercase tracking-[0.2em] mb-8">Requirements</h3>
                                <ul className="space-y-6">
                                    {content.requirements.map((item, i) => (
                                        <li key={i} className="flex gap-4">
                                            <Star size={20} className="text-primary shrink-0" />
                                            <span className="text-text-sub font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* Why Join Us */}
                    {content.benefits.length > 0 && (
                        <section className="bg-white rounded-[2.5rem] p-12 border border-gray-100 text-center">
                            <h2 className="text-3xl font-black text-text-main mb-12 tracking-tight">Why Join Us</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {content.benefits.map((item, i) => {
                                    // Map labels to icons dynamically or fallback
                                    let Icon = Brain;
                                    if (item.label.includes('Equity')) Icon = Wallet;
                                    if (item.label.includes('Stipend')) Icon = GraduationCap;
                                    if (item.label.includes('Impact')) Icon = Globe;

                                    return (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                                <Icon size={24} />
                                            </div>
                                            <h4 className="font-bold text-text-main mb-1">{item.label}</h4>
                                            <p className="text-xs text-text-sub font-medium">{item.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Application CTA Bottom */}
                    <section className="relative">
                        <div className="bg-white rounded-[2.5rem] p-12 md:p-16 border-2 border-primary/30 text-center shadow-2xl shadow-primary/10">
                            <h2 className="text-3xl md:text-4xl font-black text-text-main mb-4 tracking-tight">Ready to build the future?</h2>
                            <p className="text-text-sub mb-10 max-w-lg mx-auto">
                                Apply using your CasperID for a 10-second application experience. No forms, no friction.
                            </p>

                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-5 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 group disabled:opacity-70"
                            >
                                {isApplying ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <Zap size={24} className="group-hover:rotate-12 transition-transform" />
                                )}
                                {isAuthenticated && user ? 'Apply with CasperID' : 'Log in to Apply'}
                            </button>

                            <div className="flex items-center justify-center gap-4 my-8">
                                <div className="h-px bg-gray-200 w-20"></div>
                                <span className="text-xs font-black text-text-sub uppercase tracking-widest">OR</span>
                                <div className="h-px bg-gray-200 w-20"></div>
                            </div>

                            <button disabled className="text-gray-400 font-bold cursor-not-allowed flex items-center justify-center gap-2 mx-auto pointer-events-none" title="Coming Soon">
                                <FileText size={18} /> Or upload your resume manually
                            </button>
                        </div>
                    </section>
                </div>
            </div>
            <FooterMarketing />
        </div>
    );
};

export default CareerDetailPage;

