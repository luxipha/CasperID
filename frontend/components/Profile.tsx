import React, { useState, useEffect, useRef } from 'react';
import { ProfilePreview } from './ProfilePreview';
import { apiService } from '../services/api';
import {
  UserProfile,
  Experience,
  Education,
  Skill,
  Certification,
  Project,
  Award,
  Volunteer,
  Language
} from '../types';

import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillForm } from './forms/SkillForm';
import { CertificationForm } from './forms/CertificationForm';
import { ProjectForm } from './forms/ProjectForm';
import { AwardForm } from './forms/AwardForm';
import { VolunteerForm } from './forms/VolunteerForm';
import { LanguageForm } from './forms/LanguageForm';

// Reverted to self-contained state for compatibility
// interface ProfileProps {
//   activeTab: string;
// }

export const Profile: React.FC = () => {
  const [openToWork, setOpenToWork] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [showPreview, setShowPreview] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Data State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // UI State for Editing/Adding
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingSection, setAddingSection] = useState<string | null>(null);

  // UI State for modals/forms (Legacy toggles, likely removable if fully migrated)

  const [parsingResume, setParsingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (section: string, id: string) => {
    try {
      console.log(`🗑️ Deleting ${section} item:`, id);
      let res;
      switch (section) {
        case 'Experience':
          res = await apiService.deleteExperience(id);
          console.log('Delete experience result:', res);
          setExperiences(prev => prev.filter(i => i._id !== id));
          break;
        case 'Education':
          res = await apiService.deleteEducation(id);
          console.log('Delete education result:', res);
          setEducation(prev => prev.filter(i => i._id !== id));
          break;
        case 'Skills':
          res = await apiService.deleteSkill(id);
          console.log('Delete skill result:', res);
          setSkills(prev => prev.filter(i => i._id !== id));
          break;
        case 'Certifications':
          res = await apiService.deleteCertification(id);
          console.log('Delete certification result:', res);
          setCertifications(prev => prev.filter(i => i._id !== id));
          break;
        case 'Projects':
          res = await apiService.deleteProject(id);
          console.log('Delete project result:', res);
          setProjects(prev => prev.filter(i => i._id !== id));
          break;
        case 'Awards':
          res = await apiService.deleteAward(id);
          console.log('Delete award result:', res);
          setAwards(prev => prev.filter(i => i._id !== id));
          break;
        case 'Volunteer':
          res = await apiService.deleteVolunteer(id);
          console.log('Delete volunteer result:', res);
          setVolunteers(prev => prev.filter(i => i._id !== id));
          break;
        case 'Languages':
          res = await apiService.deleteLanguage(id);
          console.log('Delete language result:', res);
          setLanguages(prev => prev.filter(i => i._id !== id));
          break;
      }
    } catch (e) { 
      console.error("Delete error:", e);
      alert("Failed to delete item: " + e.message);
    }
  };

  // Load Main Profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        console.log("🔄 Fetching user profile...");
        const res = await apiService.getUserProfile();
        console.log("✅ Profile fetch result:", res);

        // Backend returns raw profile object directly
        if (res && res.wallet) {
          setProfile(res);
        } else {
          console.error("❌ Profile fetch failed or no wallet:", res);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
        // Only redirect on specific 401/403 errors, but generic catch is okay for now
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save Handlers
  const handleSaveExperience = async (data: Experience) => {
    try {
      if (data._id) {
        const res = await apiService.updateExperience(data._id, data);
        if (res.success) {
          setExperiences(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addExperience(data);
        const newExperience = res.success ? res.data : res;
        setExperiences(prev => [...prev, newExperience]);
        setAddingSection(null);
        // Force refresh to ensure UI updates
        await refreshAllData();
      }
    } catch (e) { alert("Failed to save experience"); }
  };

  const handleSaveEducation = async (data: Education) => {
    try {
      if (data._id) {
        const res = await apiService.updateEducation(data._id, data);
        if (res.success) {
          setEducation(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addEducation(data);
        const newEducation = res.success ? res.data : res;
        setEducation(prev => [...prev, newEducation]);
        setAddingSection(null);
        // Force refresh to ensure UI updates
        await refreshAllData();
      }
    } catch (e) { alert("Failed to save education"); }
  };

  const handleSaveSkill = async (data: Skill) => {
    console.log('🚀 handleSaveSkill called with data:', data);
    try {
      if (data._id) {
        console.log('📝 Updating existing skill with ID:', data._id);
        const res = await apiService.updateSkill(data._id, data);
        console.log('📝 Update skill response:', res);
        if (res.success) {
          setSkills(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
          console.log('✅ Skill updated in state');
        }
      } else {
        console.log('✨ Creating new skill:', data);
        const res = await apiService.addSkill(data);
        console.log('✨ Add skill API response:', res);
        
        // Handle both response formats - direct object or wrapped in success/data
        const newSkill = res.success ? res.data : res;
        console.log('✨ Processed new skill object:', newSkill);
        
        console.log('📊 Current skills before update:', skills);
        setSkills(prev => {
          const updated = [...prev, newSkill];
          console.log('📊 Updated skills array:', updated);
          return updated;
        });
        setAddingSection(null);
        console.log('✅ Skill added to state, form closed');
        
        // Force refresh to ensure UI updates
        console.log('🔄 Refreshing all data...');
        await refreshAllData();
        console.log('🔄 Data refresh completed');
      }
    } catch (e) { 
      console.error('❌ Error saving skill:', e);
      alert("Failed to save skill: " + e.message); 
    }
  };

  const handleSaveCertification = async (data: Certification) => {
    try {
      if (data._id) {
        const res = await apiService.updateCertification(data._id, data);
        if (res.success) {
          setCertifications(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addCertification(data);
        const newCertification = res.success ? res.data : res;
        setCertifications(prev => [...prev, newCertification]);
        setAddingSection(null);
        // Force refresh to ensure UI updates
        await refreshAllData();
      }
    } catch (e) { alert("Failed to save certification"); }
  };

  const handleSaveProject = async (data: Project) => {
    try {
      if (data._id) {
        const res = await apiService.updateProject(data._id, data);
        if (res.success) {
          setProjects(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addProject(data);
        const newProject = res.success ? res.data : res;
        setProjects(prev => [...prev, newProject]);
        setAddingSection(null);
        // Force refresh to ensure UI updates
        await refreshAllData();
      }
    } catch (e) { alert("Failed to save project"); }
  };

  const handleSaveAward = async (data: Award) => {
    try {
      if (data._id) {
        const res = await apiService.updateAward(data._id, data);
        if (res.success) {
          setAwards(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addAward(data);
        const newAward = res.success ? res.data : res;
        setAwards(prev => [...prev, newAward]);
        setAddingSection(null);
        // Force refresh to ensure UI updates
        await refreshAllData();
      }
    } catch (e) { alert("Failed to save award"); }
  };

  const handleSaveVolunteer = async (data: Volunteer) => {
    try {
      if (data._id) {
        const res = await apiService.updateVolunteer(data._id, data);
        if (res.success) {
          setVolunteers(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addVolunteer(data);
        const newVolunteer = res.success ? res.data : res;
        setVolunteers(prev => [...prev, newVolunteer]);
        setAddingSection(null);
        // Force refresh to ensure UI updates
        await refreshAllData();
      }
    } catch (e) { alert("Failed to save volunteer work"); }
  };

  const handleSaveLanguage = async (data: Language) => {
    try {
      if (data._id) {
        const res = await apiService.updateLanguage(data._id, data);
        if (res.success) {
          setLanguages(prev => prev.map(item => item._id === data._id ? res.data : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addLanguage(data);
        const newLanguage = res.success ? res.data : res;
        setLanguages(prev => [...prev, newLanguage]);
        setAddingSection(null);
        // Force refresh to ensure UI updates
        await refreshAllData();
      }
    } catch (e) { alert("Failed to save language"); }
  };

  // Function to refresh all data sections
  const refreshAllData = async () => {
    console.log('🔄 refreshAllData started');
    try {
      const [expRes, eduRes, skillsRes, certsRes, projectsRes, awardsRes, langsRes, volRes] = await Promise.all([
        apiService.getExperience(),
        apiService.getEducation(),
        apiService.getSkills(),
        apiService.getCertifications(),
        apiService.getProjects(),
        apiService.getAwards(),
        apiService.getLanguages(),
        apiService.getVolunteers()
      ]);

      console.log('🔍 Raw API responses:', {
        experiences: expRes,
        skills: skillsRes,
        education: eduRes
      });

      // Backend returns direct arrays, not wrapped in success/data
      if (Array.isArray(expRes)) {
        setExperiences(expRes);
        console.log('🔄 Updated experiences:', expRes);
      }
      if (Array.isArray(eduRes)) {
        setEducation(eduRes);
        console.log('🔄 Updated education:', eduRes);
      }
      if (Array.isArray(skillsRes)) {
        setSkills(skillsRes);
        console.log('🔄 Updated skills:', skillsRes);
      }
      if (Array.isArray(certsRes)) {
        setCertifications(certsRes);
        console.log('🔄 Updated certifications:', certsRes);
      }
      if (Array.isArray(projectsRes)) {
        setProjects(projectsRes);
        console.log('🔄 Updated projects:', projectsRes);
      }
      if (Array.isArray(awardsRes)) {
        setAwards(awardsRes);
        console.log('🔄 Updated awards:', awardsRes);
      }
      if (Array.isArray(langsRes)) {
        setLanguages(langsRes);
        console.log('🔄 Updated languages:', langsRes);
      }
      if (Array.isArray(volRes)) {
        setVolunteers(volRes);
        console.log('🔄 Updated volunteers:', volRes);
      }
      console.log('🔄 refreshAllData completed successfully');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  };

  // Load all data on component mount
  useEffect(() => {
    refreshAllData();
  }, []);




  const navItems = [
    { label: 'Profile', icon: 'badge' },
    { label: 'Experience', icon: 'work_history' },
    { label: 'Education', icon: 'school' },
    { label: 'Skills', icon: 'hotel_class' },
    { label: 'Certifications', icon: 'verified' },
    { label: 'Projects', icon: 'rocket_launch' },
    { label: 'Awards', icon: 'trophy' },
    { label: 'Languages', icon: 'translate' },
    { label: 'Volunteer', icon: 'volunteer_activism' },
  ];

  const handleOpenPreview = () => {
    setShowPreview(true);
    setIsExiting(false);
  };

  const handleClosePreview = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowPreview(false);
      setIsExiting(false);
    }, 400); // Match animation duration
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
      <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        {title}
      </h3>
      <button className="text-primary font-bold text-sm hover:underline">Save</button>
    </div>
  );

  const renderMagicImport = () => (
    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/50">
          <span className="material-symbols-outlined text-purple-400">auto_awesome</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
            AI Magic Import
          </h3>
          <p className="text-sm text-text-sub">
            Upload your resume to auto-fill your profile in seconds
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <input
          type="file"
          ref={resumeInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,image/*"
          onChange={handleResumeUpload}
        />
        <button
          onClick={() => resumeInputRef.current?.click()}
          disabled={parsingResume}
          className="bg-white text-purple-900 hover:bg-gray-100 font-bold px-6 h-12 rounded-xl flex items-center gap-2 transition-colors"
        >
          {parsingResume ? (
            <>
              <span className="material-symbols-outlined animate-spin">refresh</span>
              Parsing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">upload_file</span>
              Upload Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const res = await apiService.updateUserProfile(profile);
      if (res.success) {
        alert("Profile saved successfully!"); // Replace with toast later
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
  };

  // Utility function to parse various date formats into {month, year} structure
  const parseDateString = (dateInput: any) => {
    if (!dateInput) return undefined;
    
    // Handle object format {month: number, year: number}
    if (typeof dateInput === 'object' && dateInput.month && dateInput.year) {
      return {
        month: dateInput.month,
        year: dateInput.year
      };
    }
    
    // Handle string format
    if (typeof dateInput !== 'string') return undefined;
    if (dateInput.toLowerCase() === 'present') return undefined;

    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const monthAbbrevs = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];

    // Handle different date formats
    const str = dateInput.toLowerCase().trim();

    // Format: "2024-09-01" or "2024-09"
    const isoMatch = str.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
    if (isoMatch) {
      return {
        year: parseInt(isoMatch[1]),
        month: parseInt(isoMatch[2])
      };
    }

    // Format: "Jan 2023", "January 2023", "Sept 2025"
    const monthYearMatch = str.match(/^(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{4})$/);
    if (monthYearMatch) {
      const monthStr = monthYearMatch[1];
      const year = parseInt(monthYearMatch[2]);

      // Find month number (1-12)
      let month = monthNames.findIndex(name => name.startsWith(monthStr.substring(0, 3))) + 1;
      if (month === 0) {
        month = monthAbbrevs.findIndex(abbrev => abbrev === monthStr.substring(0, 3)) + 1;
      }

      if (month > 0) {
        return { year, month };
      }
    }

    // Format: "2023" (year only)
    const yearMatch = str.match(/^(\d{4})$/);
    if (yearMatch) {
      return {
        year: parseInt(yearMatch[1]),
        month: undefined
      };
    }

    console.warn('Could not parse date string:', dateInput);
    return undefined;
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("📂 Upload triggered:", file?.name); // DEBUG

    if (!file) return;

    if (!profile) {
      console.error("❌ Profile state is null");
      alert("Profile not loaded yet. Please wait or refresh.");
      return;
    }

    if (!profile.wallet) {
      console.error("❌ Profile wallet is missing:", profile);
      alert("Error: Your profile has no wallet address. Please refresh.");
      return;
    }

    // if (!file || !profile?.wallet) return; // Removed silent fail

    setParsingResume(true);
    try {
      const res = await apiService.parseResume(file);
      if (!res.success || !res.data) throw new Error(res.error || "Failed to parse resume");

      const data = res.data;

      // Auto-fill basic profile fields
      let updatedProfile = {
        ...profile,
        first_name: data.first_name || profile.first_name,
        last_name: data.last_name || profile.last_name,
        email: data.email || profile.email,
        phone_number: data.phone_number || profile.phone_number,
        about: data.bio || profile.about,
        website: data.socials?.website || profile.website,
        city: data.city || data.location?.split(',')[0]?.trim() || profile.city,
        country: data.country || data.location?.split(',')[1]?.trim() || profile.country,
        headline: data.job_title || profile.headline,
      };

      // Save updated profile
      await apiService.updateUserProfile(updatedProfile);
      setProfile(updatedProfile);

      // Prepare and save collections (Experiences, Education, etc.)
      const wallet = profile.wallet;

      // Experiences
      if (data.experiences?.length > 0) {
        const experiencesToSave = data.experiences.map((exp: any) => {
          const startDate = parseDateString(exp.start_date);
          const isCurrentPosition = exp.end_date === 'Present' || exp.end_date === 'present';
          const endDate = isCurrentPosition ? undefined : parseDateString(exp.end_date);
          return {
            company_name: exp.company_name || '',
            job_title: exp.job_title || '',
            employment_type: exp.employment_type || 'full-time',
            start_date: startDate || { month: undefined, year: undefined },
            end_date: endDate || { month: undefined, year: undefined, is_current: isCurrentPosition },
            description: exp.description || '',
            location: exp.location || ''
          };
        });
        const savedExps = await Promise.all(experiencesToSave.map((item: any) => apiService.addExperience(item, wallet)));
        // Only update state if successful and currently viewing Experience tab (or refresh all?)
        // For simplicity, we won't force refresh all tabs state immediately unless we want to managing complex state merging.
        // But we should likely refetch or manually push to state if we are on that tab. 
        // A simple way is to trust the user to switch tabs which triggers fetch, or update local state now.
        // Let's update local state so the counters/preview update immediately.
        const newExps = savedExps.map(r => r.data).filter(Boolean);
        setExperiences(prev => [...prev, ...newExps]);
      }

      // Education
      if (data.education?.length > 0) {
        const educationToSave = data.education.map((edu: any) => {
          const startDate = parseDateString(edu.start_date);
          const endDate = parseDateString(edu.end_date);
          return {
            school_name: edu.school_name || '',
            degree: edu.degree || '',
            field_of_study: edu.field_of_study || '',
            start_date: startDate || { month: undefined, year: undefined },
            end_date: endDate || { month: undefined, year: undefined }
          };
        });
        const savedEdu = await Promise.all(educationToSave.map((item: any) => apiService.addEducation(item, wallet)));
        setEducation(prev => [...prev, ...savedEdu.map(r => r.data).filter(Boolean)]);
      }

      // Skills
      if (data.skills?.length > 0) {
        // Standardize skills to string array if objects
        const processedSkills = data.skills
          .map((skill: any) => typeof skill === 'string' ? skill.trim() : skill.name?.trim())
          .filter((skill: string) => skill && skill.length > 0)
          .slice(0, 30);

        const skillsToSave = processedSkills.map((skillName: string) => ({
          skill_name: skillName,
          is_top_skill: false
        }));

        const savedSkills = await Promise.all(skillsToSave.map((item: any) => apiService.addSkill(item, wallet)));
        setSkills(prev => [...prev, ...savedSkills.map(r => r.data).filter(Boolean)]);
      }

      // Projects
      if (data.projects?.length > 0) {
        const projectsToSave = data.projects.map((project: any) => {
          const startDate = parseDateString(project.start_date);
          const endDate = parseDateString(project.end_date);
          return {
            project_name: project.name || '',
            description: project.description || '',
            start_date: startDate || { month: undefined, year: undefined },
            end_date: endDate || { month: undefined, year: undefined },
            project_url: project.url || ''
          };
        });
        const savedProjects = await Promise.all(projectsToSave.map((item: any) => apiService.addProject(item, wallet)));
        setProjects(prev => [...prev, ...savedProjects.map(r => r.data).filter(Boolean)]);
      }

      // Certifications
      if (data.certifications?.length > 0) {
        const certsToSave = data.certifications
          .filter((cert: any) => cert.name && cert.name.trim())
          .map((cert: any) => {
            const issueDate = cert.issue_date || { month: undefined, year: undefined };
            const expirationDate = cert.expiration_date || { month: undefined, year: undefined, does_not_expire: true };
            return {
              name: cert.name.trim(),
              issuing_organization: cert.issuing_organization?.trim() || '',
              issue_date: issueDate,
              expiration_date: expirationDate,
              credential_id: cert.credential_id?.trim() || '',
              credential_url: cert.credential_url?.trim() || ''
            };
          });
        const savedCerts = await Promise.all(certsToSave.map((item: any) => apiService.addCertification(item, wallet)));
        setCertifications(prev => [...prev, ...savedCerts.map(r => r.data).filter(Boolean)]);
      }

      // Volunteer
      if (data.volunteer?.length > 0) {
        const volunteerToSave = data.volunteer.map((vol: any) => {
          const startDate = parseDateString(vol.start_date);
          const isCurrentPosition = vol.end_date === 'Present' || vol.end_date === 'present';
          const endDate = isCurrentPosition ? undefined : parseDateString(vol.end_date);
          return {
            organization: vol.organization || '',
            role: vol.role || '',
            start_date: startDate || { month: undefined, year: undefined },
            end_date: endDate || { month: undefined, year: undefined, is_current: isCurrentPosition },
            description: vol.description || ''
          };
        });
        const savedVols = await Promise.all(volunteerToSave.map((item: any) => apiService.addVolunteer(item, wallet)));
        setVolunteers(prev => [...prev, ...savedVols.map(r => r.data).filter(Boolean)]);
      }

      // Languages
      if (data.languages?.length > 0) {
        const languagesToSave = data.languages.map((lang: any) => ({
          language_name: lang.language || '',
          proficiency: lang.proficiency?.toLowerCase() || 'Elementary'
        }));
        const savedLangs = await Promise.all(languagesToSave.map((item: any) => apiService.addLanguage(item, wallet)));
        setLanguages(prev => [...prev, ...savedLangs.map(r => r.data).filter(Boolean)]);
      }

      // Refresh all data to show the newly imported resume data
      await refreshAllData();
      
      alert('✅ Resume parsed and saved! All data has been added to your profile. You can now view it in the respective tabs.');

    } catch (error: any) {
      console.error("Error parsing resume:", error);
      alert('Failed to parse resume: ' + (error.message || 'Unknown error'));
    } finally {
      setParsingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <>
            {/* AI Magic Import Banner */}
            {renderMagicImport()}

            {/* Identity Details Form */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              {renderSectionHeader('Identity Details', 'badge')}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">First Name</label>
                    <input
                      type="text"
                      className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                      value={profile?.first_name || ''}
                      onChange={(e) => handleProfileChange('first_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Last Name</label>
                    <input
                      type="text"
                      className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                      value={profile?.last_name || ''}
                      onChange={(e) => handleProfileChange('last_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Pronouns <span className="text-text-sub font-medium">(optional)</span></label>
                    <input
                      type="text"
                      className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                      placeholder="She/Her"
                      value={profile?.pronouns || ''}
                      onChange={(e) => handleProfileChange('pronouns', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">Headline <span className="text-text-sub font-medium">(220 characters max)</span></label>
                    <input
                      type="text"
                      className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                      value={profile?.headline || ''}
                      onChange={(e) => handleProfileChange('headline', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              {renderSectionHeader('About', 'person_book')}
              <div className="p-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main">Tell your story <span className="text-text-sub font-medium">(2,600 characters max)</span></label>
                  <textarea
                    className="w-full h-40 p-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium leading-relaxed resize-none"
                    placeholder="Share your professional journey..."
                    value={profile?.about || ''}
                    onChange={(e) => handleProfileChange('about', e.target.value)}
                  ></textarea>
                  <p className="text-[11px] text-text-sub font-bold text-right">
                    {profile?.about?.length || 0} / 2,600
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              {renderSectionHeader('Location & Contact', 'location_on')}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main">City</label>
                    <input
                      type="text"
                      className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                      value={profile?.city || ''}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-text-main">Country</label>
                      <span className="material-symbols-outlined text-primary text-[18px] icon-filled">check_circle</span>
                    </div>
                    <input
                      type="text"
                      className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                      value={profile?.country || ''}
                      onChange={(e) => handleProfileChange('country', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-text-main">Email</label>
                    <span className="material-symbols-outlined text-primary text-[18px] icon-filled">check_circle</span>
                  </div>
                  <input
                    type="email"
                    className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                    value={profile?.email || ''}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        );

      case 'Experience':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary">
                  <span className="material-symbols-outlined">work_history</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Professional Experience</h3>
                  <p className="text-text-sub text-sm">Your work history</p>
                </div>
              </div>
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Experience')}
                  className="size-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>
            <div className="p-8 space-y-8">
              {isLoading ? (
                <div className="text-center text-text-sub">Loading experience...</div>
              ) : experiences.length === 0 ? (
                <div className="text-center text-text-sub italic">No experience added yet.</div>
              ) : (
                experiences.map((exp) => (
                  <div key={exp._id} className="p-8 rounded-[24px] bg-gray-50/50 border border-gray-100 space-y-6 relative group">
                    <button
                      onClick={async () => {
                        if (exp._id) {
                          await apiService.deleteExperience(exp._id);
                          setExperiences(p => p.filter(e => e._id !== exp._id));
                        }
                      }}
                      className="absolute top-6 right-6 text-text-sub hover:text-alerts transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Job Title</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-primary/20 text-sm font-bold" defaultValue={exp.job_title} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Company</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-primary/20 text-sm font-bold" defaultValue={exp.company_name} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Start Date</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 text-sm font-bold" defaultValue={`${exp.start_date.month}/${exp.start_date.year}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">End Date</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 text-sm font-bold" defaultValue={exp.current ? 'Present' : (exp.end_date ? `${exp.end_date.month}/${exp.end_date.year}` : '')} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main">Description</label>
                      <textarea className="w-full h-32 p-5 rounded-2xl bg-white border border-gray-100 text-sm font-medium leading-relaxed resize-none" defaultValue={exp.description}></textarea>
                    </div>
                  </div>
                ))
              )}
              {addingSection === 'Experience' && (
                <div className="mb-8">
                  <ExperienceForm
                    onSave={handleSaveExperience}
                    onCancel={() => setAddingSection(null)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'Education':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Education</h3>
                  <p className="text-text-sub text-sm">Your academic background</p>
                </div>
              </div>
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Education')}
                  className="size-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>
            <div className="p-8 space-y-8">
              {isLoading ? (
                <div className="text-center text-text-sub">Loading education...</div>
              ) : education.length === 0 ? (
                <div className="text-center text-text-sub italic">No education added yet.</div>
              ) : (
                education.map((edu) => (
                  <div key={edu._id} className="p-8 rounded-[24px] bg-gray-50/50 border border-gray-100 space-y-6 relative group">
                    <button
                      onClick={async () => {
                        if (edu._id) {
                          await apiService.deleteEducation(edu._id);
                          setEducation(p => p.filter(e => e._id !== edu._id));
                        }
                      }}
                      className="absolute top-6 right-6 text-text-sub hover:text-alerts transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main">Institution</label>
                      <input type="text" className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 text-sm font-bold" defaultValue={edu.school} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Degree</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 text-sm font-bold" defaultValue={edu.degree} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main">Graduation Date</label>
                        <input type="text" className="w-full h-14 px-5 rounded-2xl bg-white border border-gray-100 text-sm font-bold" defaultValue={edu.end_date ? `${edu.end_date.month} ${edu.end_date.year}` : ''} />
                      </div>
                    </div>
                  </div>
                ))
              )}
              {addingSection === 'Education' && (
                <div className="mb-8">
                  <EducationForm
                    onSave={handleSaveEducation}
                    onCancel={() => setAddingSection(null)}
                  />
                </div>
              )}
              
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Education')}
                  className="w-full h-16 rounded-[24px] border-2 border-dashed border-gray-200 text-text-sub hover:border-primary/40 hover:text-primary transition-all font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Education
                </button>
              )}
            </div>
          </div>
        );

      case 'Skills':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Skills</h3>
                  <p className="text-text-sub text-sm">Your expertise</p>
                </div>
              </div>
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Skills')}
                  className="size-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>

            <div className="p-8">
              {addingSection === 'Skills' && (
                <div className="mb-8">
                  <SkillForm
                    onSave={handleSaveSkill}
                    onCancel={() => setAddingSection(null)}
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {isLoading ? (
                  <div className="text-text-sub">Loading skills...</div>
                ) : skills.length === 0 && !addingSection ? (
                  <div className="w-full text-center py-8">
                    <p className="text-text-sub italic mb-4">No skills added yet.</p>
                    <button
                      onClick={() => setAddingSection('Skills')}
                      className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-main hover:bg-gray-50 shadow-sm transition-all"
                    >
                      Add Skill
                    </button>
                  </div>
                ) : (
                  skills.map(skill => (
                    <div key={skill._id} className="w-full md:w-auto">
                      {editingId === skill._id ? (
                        <SkillForm
                          initialData={skill}
                          onSave={handleSaveSkill}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <div className="group relative pl-4 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-100 text-text-main font-bold text-sm hover:border-primary/30 transition-all flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{skill.skill_name || skill.name}</span>
                            {skill.proficiency && <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded uppercase">{skill.proficiency}</span>}
                          </div>
                          <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingId(skill._id!)}
                              className="size-7 rounded-lg bg-white text-text-sub hover:text-primary flex items-center justify-center shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete('Skills', skill._id!)}
                              className="size-7 rounded-lg bg-white text-text-sub hover:text-red-500 flex items-center justify-center shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'Certifications':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Certifications</h3>
                  <p className="text-text-sub text-sm">Your professional certifications</p>
                </div>
              </div>
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Certifications')}
                  className="size-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>
            <div className="p-8 space-y-6">
              {isLoading ? (
                <div className="text-center text-text-sub">Loading certifications...</div>
              ) : certifications.length === 0 ? (
                <div className="text-center text-text-sub italic">No certifications added yet.</div>
              ) : (
                certifications.map(cert => (
                  <div key={cert._id} className="flex items-center gap-6 p-6 rounded-[24px] border border-gray-100">
                    <div className="size-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined text-[32px]">verified</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-text-main">{cert.name}</h4>
                      <p className="text-xs text-text-sub font-medium">{cert.issuing_organization} • Issued {cert.issue_date.month} {cert.issue_date.year}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (cert._id) {
                          await apiService.deleteCertification(cert._id);
                          setCertifications(p => p.filter(c => c._id !== cert._id));
                        }
                      }}
                      className="material-symbols-outlined text-text-sub hover:text-alerts transition-colors"
                    >
                      delete
                    </button>
                  </div>
                ))
              )}
              {addingSection === 'Certifications' && (
                <div className="mb-8">
                  <CertificationForm
                    onSave={handleSaveCertification}
                    onCancel={() => setAddingSection(null)}
                  />
                </div>
              )}
              
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Certifications')}
                  className="w-full h-16 rounded-[24px] border-2 border-dashed border-gray-200 text-text-sub hover:border-primary/40 hover:text-primary transition-all font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Certification
                </button>
              )}
            </div>
          </div>
        );

      case 'Projects':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            {renderSectionHeader('Projects', 'rocket_launch')}
            <div className="p-8 space-y-6">
              {isLoading ? (
                <div className="text-center text-text-sub">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="text-center text-text-sub italic">No projects added yet.</div>
              ) : (
                projects.map(proj => (
                  <div key={proj._id} className="p-8 rounded-[24px] bg-gray-50/50 border border-gray-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-text-main">{proj.name}</h4>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                            {proj.url}
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </a>
                        )}
                      </div>
                      <button
                        onClick={async () => {
                          if (proj._id) {
                            await apiService.deleteProject(proj._id);
                            setProjects(p => p.filter(pr => pr._id !== proj._id));
                          }
                        }}
                        className="material-symbols-outlined text-text-sub hover:text-alerts transition-colors"
                      >
                        delete
                      </button>
                    </div>
                    <p className="text-sm text-text-sub font-medium leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                ))
              )}
              {addingSection === 'Projects' && (
                <div className="mb-8">
                  <ProjectForm
                    onSave={handleSaveProject}
                    onCancel={() => setAddingSection(null)}
                  />
                </div>
              )}
              
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Projects')}
                  className="w-full h-16 rounded-[24px] border-2 border-dashed border-gray-200 text-text-sub hover:border-primary/40 hover:text-primary transition-all font-bold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Project
                </button>
              )}
            </div>
          </div>
        );

      case 'Awards':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary">
                  <span className="material-symbols-outlined">trophy</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Awards & Honors</h3>
                  <p className="text-text-sub text-sm">Recognition</p>
                </div>
              </div>
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Awards')}
                  className="size-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>

            <div className="p-8 space-y-4">
              {addingSection === 'Awards' && (
                <AwardForm
                  onSave={handleSaveAward}
                  onCancel={() => setAddingSection(null)}
                />
              )}

              {isLoading ? (
                <div className="text-center text-text-sub">Loading awards...</div>
              ) : awards.length === 0 && !addingSection ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-gray-50 border border-gray-100 mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-2xl">trophy</span>
                  </div>
                  <p className="text-text-sub font-medium">No awards added yet.</p>
                  <button
                    onClick={() => setAddingSection('Awards')}
                    className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-main hover:bg-gray-50 shadow-sm transition-all"
                  >
                    Add Award
                  </button>
                </div>
              ) : (
                awards.map(award => (
                  <div key={award._id}>
                    {editingId === award._id ? (
                      <AwardForm
                        initialData={award}
                        onSave={handleSaveAward}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex items-center gap-5 p-6 rounded-[24px] border border-gray-100 relative group bg-white">
                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingId(award._id!)}
                            className="size-8 rounded-lg bg-gray-50 text-text-sub hover:text-primary flex items-center justify-center shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete('Awards', award._id!)}
                            className="size-8 rounded-lg bg-gray-50 text-text-sub hover:text-alerts flex items-center justify-center shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>

                        <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                          <span className="material-symbols-outlined text-[28px] icon-filled">workspace_premium</span>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-bold text-text-main">{award.title}</h4>
                          <p className="text-[12px] text-text-sub font-medium leading-none mt-1">{award.issuer} • {award.issue_date.year}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'Languages':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary">
                  <span className="material-symbols-outlined">translate</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Languages</h3>
                  <p className="text-text-sub text-sm">Communication</p>
                </div>
              </div>
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Languages')}
                  className="size-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>

            <div className="p-8">
              {addingSection === 'Languages' && (
                <div className="mb-8">
                  <LanguageForm
                    onSave={handleSaveLanguage}
                    onCancel={() => setAddingSection(null)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <div className="col-span-2 text-center py-8 text-text-sub">Loading languages...</div>
                ) : languages.length === 0 && !addingSection ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-text-sub italic mb-4">No languages added yet.</p>
                    <button
                      onClick={() => setAddingSection('Languages')}
                      className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-main hover:bg-gray-50 shadow-sm transition-all"
                    >
                      Add Language
                    </button>
                  </div>
                ) : (
                  languages.map(item => (
                    <div key={item._id} className="w-full">
                      {editingId === item._id ? (
                        <LanguageForm
                          initialData={item}
                          onSave={handleSaveLanguage}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <div className="group relative flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/20 transition-all">
                          <div>
                            <p className="text-sm font-bold text-text-main">{item.language_name}</p>
                            <p className="text-[11px] text-text-sub font-bold uppercase tracking-wider">{item.proficiency}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingId(item._id!)}
                              className="size-8 rounded-lg bg-white text-text-sub hover:text-primary flex items-center justify-center shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete('Languages', item._id!)}
                              className="size-8 rounded-lg bg-white text-text-sub hover:text-alerts flex items-center justify-center shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'Volunteer':
        return (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary">
                  <span className="material-symbols-outlined">volunteer_activism</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-main">Volunteer</h3>
                  <p className="text-text-sub text-sm">Social impact</p>
                </div>
              </div>
              {!addingSection && (
                <button
                  onClick={() => setAddingSection('Volunteer')}
                  className="size-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-text-main hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>

            <div className="p-8 space-y-6">
              {addingSection === 'Volunteer' && (
                <VolunteerForm
                  onSave={handleSaveVolunteer}
                  onCancel={() => setAddingSection(null)}
                />
              )}

              {isLoading ? (
                <div className="text-center text-text-sub">Loading volunteer experience...</div>
              ) : volunteers.length === 0 && !addingSection ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-gray-50 border border-gray-100 mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-2xl">volunteer_activism</span>
                  </div>
                  <p className="text-text-sub font-medium">No volunteer experience added yet.</p>
                  <button
                    onClick={() => setAddingSection('Volunteer')}
                    className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-text-main hover:bg-gray-50 shadow-sm transition-all"
                  >
                    Add Volunteer Role
                  </button>
                </div>
              ) : (
                volunteers.map(vol => (
                  <div key={vol._id}>
                    {editingId === vol._id ? (
                      <VolunteerForm
                        initialData={vol}
                        onSave={handleSaveVolunteer}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="p-8 rounded-[24px] bg-gray-50/50 border border-gray-100 space-y-4 relative group">
                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingId(vol._id!)}
                            className="size-8 rounded-lg bg-white bg-gray-100 text-text-sub hover:text-primary flex items-center justify-center shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete('Volunteer', vol._id!)}
                            className="size-8 rounded-lg bg-white bg-gray-100 text-text-sub hover:text-alerts flex items-center justify-center shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-text-main">{vol.role}</h4>
                        <p className="text-xs text-text-sub font-bold uppercase tracking-wider">{vol.organization} • {vol.start_date.year} - {vol.current ? 'Present' : (vol.end_date?.year || '')}</p>
                        <p className="text-sm text-text-sub font-medium leading-relaxed">
                          {vol.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="space-y-8 animate-in fade-in duration-500 pb-32">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-xs font-bold text-text-sub uppercase tracking-widest">
            <span>Identity</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary">{activeTab} Management</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">Profile Management</h1>
              <p className="text-text-sub text-sm md:text-base font-medium mt-1">Manage your decentralized digital identity (DID) and professional resume data.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full shadow-sm text-xs font-bold text-text-sub">
              <span className="material-symbols-outlined text-green-500 text-sm icon-filled">cloud_done</span>
              Last saved just now
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-8">
          {/* Main Content Area */}
          <div className="space-y-6">

            {/* User Banner Card - Always shown at top */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-[#3b28cc] to-[#291f7a] relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              </div>
              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 relative z-10">
                  <div className="relative group">
                    <div className="size-28 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                      <img src="https://picsum.photos/id/64/200/200" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-1 right-1 size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div>
                      <h2 className="text-2xl font-black text-text-main tracking-tight">Jane Doe</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                          <span className="material-symbols-outlined text-blue-600 text-[16px]">trending_up</span>
                          <span className="text-[11px] font-bold text-blue-700">ATS Score: 85%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                      <span className="text-sm font-bold text-text-main">Open to Work</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={openToWork}
                          onChange={() => setOpenToWork(!openToWork)}
                        />
                        <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-[18px] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Section Content */}
            {renderContent()}

            {/* Bottom Identity Status Bar */}
            <div className="p-5 rounded-[24px] bg-white border border-gray-100 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">fingerprint</span>
                </div>
                <div>
                  <p className="text-sm font-black text-text-main">CasperID (DID)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-text-sub">did:casper:1234...890</code>
                    <button className="text-primary hover:text-primary/80"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none h-12 px-6 rounded-xl text-sm font-bold text-text-sub hover:bg-gray-50 transition-all">Discard</button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 md:flex-none h-12 px-8 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Sticky Sidebar Navigation */}
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-28 space-y-6">
              <button
                onClick={handleOpenPreview}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all font-black text-text-main text-sm group active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">visibility</span>
                Profile Preview
              </button>

              <nav className="bg-white rounded-[28px] border border-gray-100 shadow-soft p-2 flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${activeTab === item.label
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-sub hover:bg-gray-50 hover:text-text-main'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-[22px] ${activeTab === item.label ? 'icon-filled' : ''}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile Section Nav (Visible only on mobile/tablet) */}
          <div className="lg:hidden fixed bottom-[72px] left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-30 shadow-lg">
            <div className="flex overflow-x-auto no-scrollbar px-6 py-4 gap-4 snap-x">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`shrink-0 px-5 py-2 rounded-full text-xs font-black snap-center transition-all ${activeTab === item.label
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white border border-gray-200 text-text-sub'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in Preview Overlay */}
      {showPreview && (
        <div className={`fixed inset-0 z-[60] overflow-y-auto no-scrollbar bg-bg-light ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
            <ProfilePreview
              onBack={handleClosePreview}
              data={{
                profile,
                experiences,
                education,
                skills,
                projects,
                certifications,
                awards,
                volunteers,
                languages
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
