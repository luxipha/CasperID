import React from 'react';
import { UserProfile, Experience, Education, Skill, Project, Certification, Award, Volunteer, Language as LanguageType } from '../types';
import ProfileDisplay from './ProfileDisplay.tsx';

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
      <ProfileDisplay data={data} />
    </div>
  );
};

