import React from 'react';
import { UserProfile, Experience, Education, Skill, Project, Certification, Award, Volunteer, Language as LanguageType } from '../types';

interface ProfilePreviewProps {
  onBack: () => void;
  data: {
    profile: UserProfile | null;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications: Certification[];
    awards: Award[];
    volunteers: Volunteer[];
    languages: LanguageType[];
  }
}

export const ProfilePreview: React.FC<ProfilePreviewProps> = ({ onBack, data }) => {
  const { profile, experiences, projects, skills, certifications } = data;

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'User';
  const headline = profile?.headline || 'Blockchain Enthusiast';
  const location = profile?.city && profile?.country ? `${profile.city}, ${profile.country}` : 'Global';
  const about = profile?.about || 'No bio provided yet.';
  const jobTitle = experiences[0]?.job_title || 'Member';
  const company = experiences[0]?.company_name || 'Casper Ecosystem';

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-right-12 duration-700 pb-20">
      {/* Immersive Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="size-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-text-sub hover:text-primary hover:border-primary/30 transition-all shadow-soft group active:scale-95"
            title="Exit Preview"
          >
            <span className="material-symbols-outlined text-[28px] group-hover:-translate-x-1 transition-transform">close</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-text-main tracking-tight leading-none">Public Profile Preview</h2>
            <p className="text-sm font-medium text-text-sub mt-1">This is how your profile appears to others in the Casper ecosystem.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex-1 md:flex-none h-12 px-6 bg-white border border-gray-100 rounded-2xl text-sm font-black text-text-main hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">share</span>
            Share Link
          </button>
          <button className="flex-1 md:flex-none h-12 px-8 bg-primary text-white rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Identity CV
          </button>
        </div>
      </div>

      {/* Hero Header Section - High Fidelity */}
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-[0_40px_80px_-20px_rgba(134,82,226,0.08)] overflow-hidden">
        <div
          className="h-56 md:h-80 bg-gradient-to-br from-[#8652E2] via-[#6D36D6] to-[#1A1A2E] relative bg-cover bg-center"
          style={profile?.cover_image_url ? {
            backgroundImage: `url(${profile.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          {!profile?.cover_image_url && (
            <>
              <div className="absolute inset-0 opacity-15 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

              {/* Abstract Decorations */}
              <div className="absolute top-[-50px] left-[-50px] size-[300px] rounded-full bg-secondary/10 blur-[100px]"></div>
              <div className="absolute bottom-[-100px] right-[-100px] size-[400px] rounded-full bg-primary/20 blur-[120px]"></div>
            </>
          )}

          <div className="absolute bottom-8 right-8 flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              Background Verified
            </div>
          </div>
        </div>

        <div className="px-8 md:px-16 pb-16 flex flex-col items-center text-center -mt-24 md:-mt-32 relative z-10">
          <div className="relative group">
            <div className="size-48 md:size-64 rounded-full border-[10px] border-white shadow-2xl bg-gray-100 overflow-hidden mb-8">
              <img
                src={profile?.profile_image_url
                  ? (profile.profile_image_url.startsWith('http')
                    ? profile.profile_image_url
                    : `http://localhost:3001${profile.profile_image_url}`)
                  : "https://picsum.photos/id/64/600/600"
                }
                alt={fullName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Green badge for liveness/basic tier */}
            {profile?.tier === 'layer_1' && (
              <div className="absolute bottom-6 right-6 size-12 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white shadow-lg animate-bounce">
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-4xl md:text-6xl font-black text-text-main tracking-tighter">{fullName}</h1>
              {/* Purple verified badge for full_kyc and higher tiers */}
              {profile?.tier && ['layer_3', 'layer_1', 'layer_2', 'layer_3'].includes(profile.tier) && (
                <div className="flex items-center justify-center size-10 md:size-12 rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                  <span className="material-symbols-outlined text-[24px] md:text-[28px] icon-filled">verified</span>
                </div>
              )}
            </div>

            <p className="text-xl md:text-2xl font-bold text-text-sub max-w-3xl mx-auto leading-tight">
              {headline}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {profile?.open_to_work && (
                <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[11px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Open to Opportunities
                </span>
              )}
              <span className="px-4 py-1.5 bg-gray-50 text-text-sub rounded-full text-[11px] font-black uppercase tracking-widest border border-gray-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {location}
              </span>
              <span className="px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[11px] font-black uppercase tracking-widest border border-primary/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">fingerprint</span>
                {profile?.human_id || 'did:casper:unknown'}
              </span>
            </div>

            {/* Social Links */}
            {(profile?.socials?.linkedin || profile?.socials?.twitter || profile?.socials?.github || profile?.socials?.website) && (
              <div className="flex items-center justify-center gap-3 pt-2">
                {profile.socials.linkedin && (
                  <a
                    href={profile.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-all"
                    title="LinkedIn"
                  >
                    <span className="material-symbols-outlined text-[20px]">link</span>
                  </a>
                )}
                {profile.socials.twitter && (
                  <a
                    href={profile.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-10 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 hover:bg-sky-100 transition-all"
                    title="Twitter / X"
                  >
                    <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                  </a>
                )}
                {profile.socials.github && (
                  <a
                    href={profile.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all"
                    title="GitHub"
                  >
                    <span className="material-symbols-outlined text-[20px]">code</span>
                  </a>
                )}
                {profile.socials.website && (
                  <a
                    href={profile.socials.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-all"
                    title="Website"
                  >
                    <span className="material-symbols-outlined text-[20px]">public</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid - Full Width Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

        {/* Main Bio & Work Experience */}
        <div className="space-y-10">

          {/* About Card */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-12 space-y-8">
            <h2 className="text-2xl font-black text-text-main flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">person_book</span>
              </div>
              About & Mission
            </h2>
            <div className="space-y-6">
              <p className="text-xl text-text-sub font-medium leading-relaxed">
                {about}
              </p>
            </div>
          </section>

          {/* Detailed Experience */}
          {experiences.length > 0 && (
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-12 space-y-12">
              <h2 className="text-2xl font-black text-text-main flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">work_history</span>
                </div>
                Career Journey
              </h2>

              <div className="space-y-16 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-10 bottom-10 w-px bg-gray-100 hidden sm:block"></div>

                {experiences.map((exp, i) => (
                  <div key={i} className="flex gap-8 relative group">
                    <div className="hidden sm:flex size-12 rounded-2xl bg-gray-100 text-text-sub items-center justify-center font-black text-xl z-10 group-first:bg-primary group-first:text-white group-first:shadow-lg group-first:shadow-primary/20">
                      {exp.company_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-2xl font-black text-text-main tracking-tight">{exp.job_title}</h3>
                        <span className="px-4 py-1 rounded-full bg-gray-50 text-text-sub text-[11px] font-black uppercase tracking-widest border border-gray-100">
                          {exp.start_date.year} — {exp.end_date ? exp.end_date.year : 'PRESENT'}
                        </span>
                      </div>
                      <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">{exp.company_name} • {exp.location}</p>
                      <p className="text-lg text-text-sub font-medium leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Portfolio */}
          {projects.length > 0 && (
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-12 space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-text-main flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                  </div>
                  Key Projects
                </h2>
                <button className="text-sm font-bold text-primary hover:underline">View All</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((proj, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className={`h-48 rounded-[32px] bg-gradient-to-br from-purple-500 to-indigo-600 mb-6 relative overflow-hidden flex items-center justify-center text-white/20`}>
                      <span className="material-symbols-outlined text-[100px]">rocket_launch</span>
                    </div>
                    <h4 className="text-xl font-black text-text-main mb-1 group-hover:text-primary transition-colors">{proj.project_name}</h4>
                    <p className="text-[11px] font-black text-text-sub uppercase tracking-widest line-clamp-2">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar - High Visibility Stats */}
        <aside className="space-y-10">

          {/* Identity Strength */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 space-y-8">
            <div className="text-center space-y-2">
              <p className="text-[11px] font-black text-text-sub uppercase tracking-widest opacity-60">Identity Score</p>
              <h3 className="text-6xl font-black text-text-main tracking-tight">{profile?.profile_completeness || 0}<span className="text-2xl opacity-30">/100</span></h3>
            </div>
            <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                style={{ width: `${profile?.profile_completeness || 0}%` }}
              ></div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-bold text-text-sub text-center">Profile Completeness</p>
              <div className="h-px bg-gray-50 w-full"></div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Experience</p>
                  <p className="text-lg font-black text-text-main">{data.experiences.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Education</p>
                  <p className="text-lg font-black text-text-main">{data.education.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Skills</p>
                  <p className="text-lg font-black text-text-main">{skills.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Projects</p>
                  <p className="text-lg font-black text-text-main">{projects.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Certificates</p>
                  <p className="text-lg font-black text-text-main">{certifications.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Awards</p>
                  <p className="text-lg font-black text-text-main">{data.awards.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Volunteers</p>
                  <p className="text-lg font-black text-text-main">{data.volunteers.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Languages</p>
                  <p className="text-lg font-black text-text-main">{data.languages.length}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Expert Skills */}
          {skills.length > 0 && (
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 space-y-6">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill._id || skill.skill_name} className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-black text-text-main hover:bg-white hover:border-primary transition-all">
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Verified Seals */}
          <section className="bg-white rounded-[40px] border border-gray-100 shadow-soft p-8 space-y-6">
            <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Verified Seals</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-[24px] bg-blue-50/50 border border-blue-100 group hover:bg-blue-50 transition-all">
                <div className="size-12 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px] icon-filled">verified</span>
                </div>
                <div>
                  <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Liveness Proven</p>
                  <p className="text-[10px] text-blue-700 font-bold opacity-70">Secured with CasperID</p>
                </div>
              </div>
              {certifications.map((cert) => (
                <div key={cert._id} className="flex items-center gap-4 p-4 rounded-[24px] bg-purple-50/50 border border-purple-100 group hover:bg-purple-50 transition-all">
                  <div className="size-12 rounded-2xl bg-white border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px] icon-filled">workspace_premium</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-purple-900 uppercase tracking-tight">{cert.name}</p>
                    <p className="text-[10px] text-purple-700 font-bold opacity-70">{cert.issuing_organization}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Digital Stamp */}
          <div className="p-8 bg-[#1A1A2E] rounded-[40px] text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">shield_with_heart</span>
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest">Digital Stamp</h4>
              </div>
              <p className="text-[11px] font-medium text-white/50 leading-relaxed italic">
                This profile document is cryptographically hashed and signed on the Casper network. All credentials are verifiable via ZK-proofs.
              </p>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-1">
                <p className="text-[9px] font-mono text-white/30 truncate">SIG: {profile?.wallet ? `0x${profile.wallet.substring(0, 6)}...` : 'PENDING'}</p>
                <p className="text-[9px] font-mono text-white/30 truncate">BLOCK: 2,842,912</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-[120px] text-white">fingerprint</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

