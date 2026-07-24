import React, { useState } from 'react';
import { UserProfile, Experience, Education, Certification, Skill, Project, Award, Language, Volunteer } from '../types';
import { apiService } from '../services/api';
import { VerifyCredentialDrawer } from './VerifyCredentialDrawer';
import { ProfileReviewsDrawer } from './ProfileReviewsDrawer';

interface ProfileDisplayProps {
    data: {
        profile: UserProfile | null;
        experiences: Experience[];
        education: Education[];
        certifications: Certification[];
        skills: Skill[];
        projects: Project[];
        awards: Award[];
        languages: Language[];
        volunteers: Volunteer[];
    };
    isPublicView?: boolean;
}

export default function ProfileDisplay({ data, isPublicView = true }: ProfileDisplayProps) {
    const { profile, experiences, education, certifications, skills, projects, awards, languages, volunteers } = data;
    const [verifyDrawerOpen, setVerifyDrawerOpen] = useState(false);
    const [reviewsDrawerOpen, setReviewsDrawerOpen] = useState(false);

    if (!profile) return null;

    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
    const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');

    const resolveImageUrl = (url?: string) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        const baseUrl = apiService.getBaseURL() || '';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const reviewUrl = profile.human_id || profile.cns_name || profile.wallet
        ? `/profile/${profile.human_id || profile.cns_name || profile.wallet}/reviews`
        : null;

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700">
            {/* Hero Header Section */}
            <div className="relative rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-soft">
                {/* Banner Background */}
                <div className="h-48 md:h-64 relative">
                    {profile.cover_image_url ? (
                        <img src={resolveImageUrl(profile.cover_image_url)} alt="Profile banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#8652E2] to-[#6DE8EC] relative">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent)]"></div>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-10 -mt-16 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                    {/* Profile Image */}
                    <div className="size-32 md:size-44 rounded-[32px] p-1 bg-white shadow-xl relative group">
                        <div className="w-full h-full rounded-[28px] overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                            {profile.profile_image_url ? (
                                <img src={resolveImageUrl(profile.profile_image_url)} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl md:text-5xl font-black text-[#8652E2]/30 uppercase">{initials || 'ID'}</span>
                            )}
                        </div>
                        {profile.tier && (
                            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-xl shadow-lg border border-gray-100">
                                <div className="px-3 py-1 bg-[#8652E2] text-white text-[10px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">verified</span>
                                    {profile.tier.replace('_', ' ')}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-3 pt-12 md:pt-20 pb-2 text-center md:text-left w-full">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-black text-text-main tracking-tight">{fullName}</h1>
                            {profile.headline && (
                                <p className="text-lg md:text-xl font-bold text-[#8652E2] flex items-center justify-center md:justify-start gap-2 italic">
                                    {profile.headline}
                                </p>
                            )}
                            {profile.open_to_work?.enabled && (
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[11px] font-black text-green-600 uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[16px]">work</span>
                                    Open to Work
                                    {profile.open_to_work.roles && profile.open_to_work.roles.length > 0 && (
                                        <span className="opacity-60">• {profile.open_to_work.roles[0]}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-medium text-text-sub">
                            {profile.city && (
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    {profile.city}, {profile.country}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[18px] text-[#6DE8EC]">bolt</span>
                                {(profile as any).alias
                                    ? `${(profile as any).alias} persona`
                                    : profile.human_id || (profile.wallet ? `${profile.wallet.slice(0, 6)}...${profile.wallet.slice(-4)}` : '')}
                            </span>
                            {profile.email && !isPublicView && (
                                <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                    {profile.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Social/Action Section */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 pb-2 w-full md:w-auto">
                        {profile.socials?.linkedin && (
                            <a href={profile.socials.linkedin} target="_blank" rel="noopener" className="size-11 rounded-2xl bg-gray-50 flex items-center justify-center text-text-sub hover:text-[#8652E2] hover:bg-[#8652E2]/5 transition-all border border-gray-100" title="LinkedIn">
                                <span className="material-symbols-outlined">link</span>
                            </a>
                        )}
                        {profile.socials?.twitter && (
                            <a href={`https://twitter.com/${profile.socials.twitter.replace('@', '')}`} target="_blank" rel="noopener" className="size-11 rounded-2xl bg-gray-50 flex items-center justify-center text-text-sub hover:text-[#8652E2] hover:bg-[#8652E2]/5 transition-all border border-gray-100" title="Twitter">
                                <span className="material-symbols-outlined">alternate_email</span>
                            </a>
                        )}
                        {profile.socials?.github && (
                            <a href={profile.socials.github} target="_blank" rel="noopener" className="size-11 rounded-2xl bg-gray-50 flex items-center justify-center text-text-sub hover:text-[#8652E2] hover:bg-[#8652E2]/5 transition-all border border-gray-100" title="GitHub">
                                <span className="material-symbols-outlined">code</span>
                            </a>
                        )}
                        {(profile.socials?.website || profile.website) && (
                            <a href={profile.socials?.website || profile.website} target="_blank" rel="noopener" className="size-11 rounded-2xl bg-gray-50 flex items-center justify-center text-text-sub hover:text-[#8652E2] hover:bg-[#8652E2]/5 transition-all border border-gray-100" title="Website">
                                <span className="material-symbols-outlined">language</span>
                            </a>
                        )}
                        {reviewUrl && (
                            <button
                                type="button"
                                onClick={() => setReviewsDrawerOpen(true)}
                                className="inline-flex h-11 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 px-4 text-[11px] font-black uppercase tracking-[0.18em] text-text-main hover:border-[#8652E2]/30 hover:text-[#8652E2]"
                            >
                                Reviews
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: About & Sections */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About Section */}
                    {profile.about && (
                        <Card title="About" icon="person">
                            <p className="text-text-main text-base leading-relaxed whitespace-pre-wrap font-medium">
                                {profile.about}
                            </p>
                        </Card>
                    )}

                    {/* Experience Section */}
                    {experiences.length > 0 && (
                        <Card title="Experience" icon="work_history">
                            <div className="space-y-10">
                                {experiences.map((exp, idx) => (
                                    <div key={exp._id || idx} className="relative pl-10 group">
                                        {/* Minimal Timeline */}
                                        <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-gray-100 group-last:bg-transparent"></div>
                                        <div className="absolute left-0 top-1.5 size-6 rounded-full bg-white border-2 border-[#8652E2] flex items-center justify-center z-10">
                                            <div className="size-2 rounded-full bg-[#8652E2]"></div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                                <h4 className="text-xl font-black text-text-main">{exp.job_title}</h4>
                                                <span className="text-xs font-black text-[#8652E2] px-3 py-1 bg-[#8652E2]/5 rounded-full uppercase tracking-wider">
                                                    {formatDate(exp.start_date)} - {exp.end_date?.is_current ? 'Present' : formatDate(exp.end_date)}
                                                </span>
                                            </div>
                                            <div className="text-[#8652E2] font-bold">{exp.company_name}</div>
                                            {exp.description && (
                                                <p className="text-text-sub text-sm leading-relaxed mt-4 font-medium italic">
                                                    {exp.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Projects Section */}
                    {projects.length > 0 && (
                        <Card title="Projects" icon="rocket_launch">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map((proj, idx) => (
                                    <div key={proj._id || idx} className="p-6 rounded-[28px] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-soft transition-all duration-300 group">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-lg font-black text-text-main tracking-tight">{proj.project_name}</h4>
                                                {proj.project_url && (
                                                    <a href={proj.project_url} target="_blank" rel="noopener" className="text-[#8652E2] hover:scale-110 transition-transform">
                                                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-text-sub text-sm line-clamp-3 font-medium leading-relaxed">
                                                {proj.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Volunteering Section */}
                    {volunteers.length > 0 && (
                        <Card title="Volunteering" icon="volunteer_activism">
                            <div className="space-y-10">
                                {volunteers.map((vol, idx) => (
                                    <div key={vol._id || idx} className="relative pl-10 group">
                                        <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-gray-100 group-last:bg-transparent"></div>
                                        <div className="absolute left-0 top-1.5 size-6 rounded-full bg-white border-2 border-[#8652E2] flex items-center justify-center z-10">
                                            <div className="size-2 rounded-full bg-[#8652E2]"></div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                                                <h4 className="text-xl font-black text-text-main">{vol.role}</h4>
                                                <span className="text-xs font-black text-[#8652E2] px-3 py-1 bg-[#8652E2]/5 rounded-full uppercase tracking-wider">
                                                    {formatDate(vol.start_date)} - {vol.end_date?.is_current ? 'Present' : formatDate(vol.end_date)}
                                                </span>
                                            </div>
                                            <div className="text-[#8652E2] font-bold">{vol.organization}</div>
                                            {vol.description && (
                                                <p className="text-text-sub text-sm leading-relaxed mt-4 font-medium italic">
                                                    {vol.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column: Skills, Education, Sidebar Info */}
                <div className="space-y-8">
                    {/* Skills Grid */}
                    {skills.length > 0 && (
                        <Card title="Skills" icon="psychology">
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => (
                                    <span key={skill._id || idx} className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[13px] font-bold text-text-main shadow-sm hover:border-[#8652E2]/30 transition-all flex items-center gap-2">
                                        {skill.skill_name}
                                        {skill.proficiency && (
                                            <span className="text-[10px] text-[#8652E2] uppercase font-black opacity-60">
                                                {skill.proficiency[0]}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <Card title="Education" icon="school">
                            <div className="space-y-6">
                                {education.map((edu, idx) => (
                                    <div key={edu._id || idx} className="space-y-1">
                                        <h4 className="text-base font-black text-text-main">{edu.school_name || edu.school}</h4>
                                        <p className="text-sm font-bold text-[#8652E2] italic leading-tight">{edu.degree}</p>
                                        <p className="text-xs text-text-sub font-medium">
                                            {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Languages */}
                    {languages.length > 0 && (
                        <Card title="Languages" icon="translate">
                            <div className="space-y-4">
                                {languages.map((lang, idx) => (
                                    <div key={lang._id || idx} className="flex items-center justify-between">
                                        <span className="text-sm font-black text-text-main">{lang.language_name}</span>
                                        <span className="text-[10px] font-black uppercase text-[#8652E2] px-2 py-0.5 bg-[#8652E2]/5 rounded border border-[#8652E2]/5">
                                            {lang.proficiency}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Certifications & Awards */}
                    {(certifications.length > 0 || awards.length > 0) && (
                        <Card title="Recognition" icon="verified">
                            <div className="space-y-4">
                                {certifications.map((cert, idx) => (
                                    <div key={cert._id || idx} className="flex gap-4 group">
                                        <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">verified</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <h5 className="text-[13px] font-black text-text-main truncate group-hover:text-primary transition-colors">{cert.name}</h5>
                                            <p className="text-[11px] text-text-sub font-bold">{cert.issuing_organization}</p>
                                        </div>
                                    </div>
                                ))}
                                {awards.map((award, idx) => (
                                    <div key={award._id || idx} className="flex gap-4 group">
                                        <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">military_tech</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <h5 className="text-[13px] font-black text-text-main truncate group-hover:text-primary transition-colors">{award.title}</h5>
                                            <p className="text-[11px] text-text-sub font-bold">{award.issuing_organization}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-12 p-8 rounded-[32px] bg-[#1A1A2E] text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <img src="/logos/logo.svg" alt="CasperID" className="w-32 h-32 filter invert" />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                    <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                        <img src="/logos/logo.svg" alt="CasperID" className="w-8 h-8 invert brightness-0" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black">
                            {profile.is_verified && profile.credential_hash ? 'Verified CasperID Profile' : 'CasperID Profile'}
                        </h4>
                        <p className="text-sm text-gray-400 font-medium">
                            {profile.is_verified && profile.credential_hash
                                ? 'This identity is verified and secured on the Casper Mainnet.'
                                : 'This profile is published on CasperID but does not yet have an active verification proof.'}
                        </p>
                    </div>
                </div>
                <div className="relative z-10 w-full md:w-auto">
                    {profile.is_verified && profile.credential_hash ? (
                        <button
                            onClick={() => setVerifyDrawerOpen(true)}
                            className="w-full md:w-auto px-8 h-14 bg-white text-[#1A1A2E] rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform active:scale-95 shadow-xl flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            Verify Authenticity
                        </button>
                    ) : (
                        <button
                            disabled
                            className="w-full md:w-auto px-8 h-14 bg-white/20 text-white/50 rounded-2xl font-black text-sm cursor-not-allowed"
                        >
                            Not Verified
                        </button>
                    )}
                </div>
            </div>

            {/* Inline Verification Drawer */}
            {profile.credential_hash && (
                <VerifyCredentialDrawer
                    isOpen={verifyDrawerOpen}
                    onClose={() => setVerifyDrawerOpen(false)}
                    credentialHash={profile.credential_hash}
                    identifier={profile.cns_name || profile.human_id || undefined}
                />
            )}
            {reviewUrl && (
                <ProfileReviewsDrawer
                    isOpen={reviewsDrawerOpen}
                    onClose={() => setReviewsDrawerOpen(false)}
                    identifier={profile.human_id || profile.cns_name || profile.wallet || ''}
                    reviewUrl={reviewUrl}
                />
            )}
        </div>
    );
}

// Internal Helper Card Component
const Card: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#8652E2] text-[24px]">{icon}</span>
            <h3 className="text-[15px] font-black text-text-main uppercase tracking-widest">{title}</h3>
        </div>
        <div className="p-8">
            {children}
        </div>
    </div>
);

// Date formatting helper
const formatDate = (date: any) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const { month, year } = date;
    if (!month && !year) return '';
    if (!month) return year.toString();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = typeof month === 'number' ? monthNames[month - 1] : month;
    return `${m} ${year}`;
};
