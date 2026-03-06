import React, { useState, useEffect, useRef } from 'react';
import { ProfilePreview } from './ProfilePreview';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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
import { calculateATSScore } from '../utils/atsAlgorithm';
import { ATSScoreCard } from './ATSScoreCard';

// Reverted to self-contained state for compatibility
// interface ProfileProps {
//   activeTab: string;
// }

export const Profile: React.FC = () => {
  const { refreshUser } = useAuth();
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
  const [atsScoreData, setAtsScoreData] = useState<{ score: number; breakdown: any; feedback: string[] } | null>(null);

  // UI State for Editing/Adding
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingSection, setAddingSection] = useState<string | null>(null);

  // UI State for modals/forms (Legacy toggles, likely removable if fully migrated)

  const [parsingResume, setParsingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (section: string, id: string) => {
    try {
      let res;
      switch (section) {
        case 'Experience':
          res = await apiService.deleteExperience(id);
          setExperiences(prev => prev.filter(i => i._id !== id));
          break;
        case 'Education':
          res = await apiService.deleteEducation(id);
          setEducation(prev => prev.filter(i => i._id !== id));
          break;
        case 'Skills':
          res = await apiService.deleteSkill(id);
          setSkills(prev => prev.filter(i => i._id !== id));
          break;
        case 'Certifications':
          res = await apiService.deleteCertification(id);
          setCertifications(prev => prev.filter(i => i._id !== id));
          break;
        case 'Projects':
          res = await apiService.deleteProject(id);
          setProjects(prev => prev.filter(i => i._id !== id));
          break;
        case 'Awards':
          res = await apiService.deleteAward(id);
          setAwards(prev => prev.filter(i => i._id !== id));
          break;
        case 'Volunteer':
          res = await apiService.deleteVolunteer(id);
          setVolunteers(prev => prev.filter(i => i._id !== id));
          break;
        case 'Languages':
          res = await apiService.deleteLanguage(id);
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
        const res = await apiService.getUserProfile();

        // Backend returns raw profile object directly
        if (res && res.wallet) {
          setProfile(res);
          // Sync local UI states with profile data
          setOpenToWork(res.open_to_work?.enabled || false);

          // Calculate initial ATS Score
          // Note: We need to fetch sub-collections to calculate accurate score initially if not already loaded
          // But usually we load them below? Wait, loadProfile only loads profile.
          // We rely on refreshAllData to load everything.
        } else {
          console.error("❌ Profile fetch failed or no wallet:", res);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
        // Only redirect on specific 401/403 errors, but generic catch is okay for now
      } finally {
        setIsLoading(false);
        // Trigger full data load
        refreshAllData();
      }
    };
    loadProfile();
  }, []);

  // Effect to recalculate ATS score whenever data changes
  useEffect(() => {
    if (profile) {
      const result = calculateATSScore(profile, experiences, education, skills);
      setAtsScoreData(result);
    }
  }, [profile, experiences, education, skills]);

  // Save Handlers
  const handleSaveExperience = async (data: Experience) => {
    try {
      if (data._id) {
        const res = await apiService.updateExperience(data._id, data);
        if (res.success || res._id) {
          setExperiences(prev => prev.map(item => item._id === data._id ? (res.menu ? res.data : res) : item));
          setEditingId(null);
          await refreshAllData();
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
        if (res.success || res._id) {
          setEducation(prev => prev.map(item => item._id === data._id ? (res.success ? res.data : res) : item));
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
    try {
      if (data._id) {
        const res = await apiService.updateSkill(data._id, data);
        if (res.success || res._id) {
          setSkills(prev => prev.map(item => item._id === data._id ? (res.success ? res.data : res) : item));
          setEditingId(null);
        }
      } else {
        const res = await apiService.addSkill(data);

        // Handle both response formats - direct object or wrapped in success/data
        const newSkill = res.success ? res.data : res;

        setSkills(prev => {
          const updated = [...prev, newSkill];
          return updated;
        });
        setAddingSection(null);

        // Force refresh to ensure UI updates
        await refreshAllData();
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
        if (res.success || res._id) {
          setCertifications(prev => prev.map(item => item._id === data._id ? (res.success ? res.data : res) : item));
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
        if (res.success || res._id) {
          setProjects(prev => prev.map(item => item._id === data._id ? (res.success ? res.data : res) : item));
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
        if (res.success || res._id) {
          setAwards(prev => prev.map(item => item._id === data._id ? (res.success ? res.data : res) : item));
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
        if (res.success || res._id) {
          setVolunteers(prev => prev.map(item => item._id === data._id ? (res.success ? res.data : res) : item));
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
        if (res.success || res._id) {
          setLanguages(prev => prev.map(item => item._id === data._id ? (res.success ? res.data : res) : item));
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


      // Backend returns direct arrays, not wrapped in success/data
      if (Array.isArray(expRes)) {
        setExperiences(expRes);
      }
      if (Array.isArray(eduRes)) {
        setEducation(eduRes);
      }
      if (Array.isArray(skillsRes)) {
        setSkills(skillsRes);
      }
      if (Array.isArray(certsRes)) {
        setCertifications(certsRes);
      }
      if (Array.isArray(projectsRes)) {
        setProjects(projectsRes);
      }
      if (Array.isArray(awardsRes)) {
        setAwards(awardsRes);
      }
      if (Array.isArray(langsRes)) {
        setLanguages(langsRes);
      }
      if (Array.isArray(volRes)) {
        setVolunteers(volRes);
      }
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  };

  // Helper function to format time since last save
  const formatTimeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Helper function to safely format date objects
  const formatDate = (date: { month?: number | string; year?: number | string } | null | undefined): string => {
    if (!date) return '-';
    const { month, year } = date;
    if (!month && !year) return '-';
    if (!month) return year?.toString() || '-';
    if (!year) return month?.toString() || '-';
    return `${month}/${year}`;
  };



  // Note: refreshAllData() is already called in loadProfile's finally block above
  // Removed duplicate useEffect that was causing double data fetches




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

  const handleShare = () => {
    if (!profile) return;
    const identifier = profile.human_id || profile.wallet;
    if (!identifier) return;
    const publicUrl = `${window.location.protocol}//${window.location.host}/${identifier}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      alert('Profile link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy profile link:', err);
    });
  };

  const handleClosePreview = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowPreview(false);
      setIsExiting(false);
    }, 400); // Match animation duration
  };

  const renderSectionHeader = (title: string, icon: string, onSave?: () => void) => (
    <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/10">
      <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        {title}
      </h3>
      <button
        onClick={onSave}
        className={`text-primary font-bold text-sm hover:underline ${!onSave ? 'opacity-0 pointer-events-none' : ''}`}
      >
        Save
      </button>
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      console.log('Uploading avatar:', file.name);
      const res = await apiService.uploadProfilePicture(file);
      if (res && res.imageUrl) {
        setProfile(prev => prev ? { ...prev, profile_image_url: res.imageUrl } : null);
        alert("Profile picture updated!");

        // Force refresh to update header profile image too
        // Note: Header likely uses a separate fetch or context. For now updates active profile.
        await apiService.getUserProfile();
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    // Merge local UI states into profile payload
    const updatedProfile = {
      ...profile,
      open_to_work: {
        ...profile.open_to_work,
        enabled: openToWork
      }
    };

    try {
      const res = await apiService.updateUserProfile(updatedProfile);
      if (res && res.wallet) {
        setLastSaved(new Date());
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
        socials: {
          ...profile.socials,
          linkedin: data.socials?.linkedin || profile.socials?.linkedin,
          twitter: data.socials?.twitter || profile.socials?.twitter,
          github: data.socials?.github || profile.socials?.github,
          website: data.socials?.website || profile.socials?.website,
        }
      };

      // Save updated profile
      await apiService.updateUserProfile(updatedProfile);
      setProfile(updatedProfile);

      // Prepare and save collections (Experiences, Education, etc.)
      const wallet = profile.wallet;

      // CLEAR existing data before overwriting (to prevent duplicates)
      const categoriesToClear = [
        'experience', 'education', 'skill', 'project',
        'certification', 'volunteer', 'award', 'language'
      ];

      await Promise.all(
        categoriesToClear.map(cat => apiService.clearProfileCategory(cat, wallet))
      );

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
        const newExps = savedExps.map(r => r).filter(Boolean);
        setExperiences(newExps);
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
        setEducation(savedEdu.map(r => r).filter(Boolean));
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
        setSkills(savedSkills.map(r => r).filter(Boolean));
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
        setProjects(savedProjects.map(r => r).filter(Boolean));
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
        setCertifications(savedCerts.map(r => r).filter(Boolean));
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
        setVolunteers(savedVols.map(r => r).filter(Boolean));
      }

      // Awards
      if (data.awards?.length > 0) {
        const awardsToSave = data.awards.map((award: any) => ({
          title: award.title || 'Award',
          issuing_organization: award.issuing_organization || '',
          issue_date: award.issue_date || { month: undefined, year: undefined },
          description: award.description || ''
        }));
        const savedAwards = await Promise.all(awardsToSave.map((item: any) => apiService.addAward(item, wallet)));
        setAwards(savedAwards.map(r => r).filter(Boolean));
      }

      // Languages
      if (data.languages?.length > 0) {
        const languagesToSave = data.languages.map((lang: any) => ({
          language_name: lang.language || '',
          proficiency: lang.proficiency?.toLowerCase() || 'Elementary'
        }));
        const savedLangs = await Promise.all(languagesToSave.map((item: any) => apiService.addLanguage(item, wallet)));
        setLanguages(savedLangs.map(r => r).filter(Boolean));
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
              {renderSectionHeader('Identity Details', 'badge', handleSaveProfile)}
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
              {renderSectionHeader('About', 'person_book', handleSaveProfile)}
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
              {renderSectionHeader('Location & Contact', 'location_on', handleSaveProfile)}
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

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-text-sub uppercase tracking-wider mb-4">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">link</span> LinkedIn
                      </label>
                      <input
                        type="text"
                        placeholder="https://linkedin.com/in/..."
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        value={profile?.socials?.linkedin || ''}
                        onChange={(e) => {
                          setProfile(prev => prev ? { ...prev, socials: { ...prev.socials, linkedin: e.target.value } } : null);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">alternate_email</span> Twitter (X)
                      </label>
                      <input
                        type="text"
                        placeholder="https://x.com/..."
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        value={profile?.socials?.twitter || ''}
                        onChange={(e) => {
                          setProfile(prev => prev ? { ...prev, socials: { ...prev.socials, twitter: e.target.value } } : null);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">code</span> GitHub
                      </label>
                      <input
                        type="text"
                        placeholder="https://github.com/..."
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        value={profile?.socials?.github || ''}
                        onChange={(e) => {
                          setProfile(prev => prev ? { ...prev, socials: { ...prev.socials, github: e.target.value } } : null);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">public</span> Website
                      </label>
                      <input
                        type="text"
                        placeholder="https://yoursite.com"
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        value={profile?.socials?.website || ''}
                        onChange={(e) => {
                          setProfile(prev => prev ? { ...prev, socials: { ...prev.socials, website: e.target.value } } : null);
                        }}
                      />
                    </div>
                  </div>
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
                    {editingId === exp._id ? (
                      <ExperienceForm
                        initialData={exp}
                        onSave={handleSaveExperience}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        <div className="absolute top-6 right-6 flex gap-2">
                          <button
                            onClick={() => setEditingId(exp._id || null)}
                            className="text-text-sub hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (exp._id) {
                                await apiService.deleteExperience(exp._id);
                                setExperiences(p => p.filter(e => e._id !== exp._id));
                              }
                            }}
                            className="text-text-sub hover:text-alerts transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Job Title</label>
                            <div className="text-base font-bold text-text-main">{exp.job_title}</div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Company</label>
                            <div className="text-base font-bold text-text-main">{exp.company_name}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Start Date</label>
                            <div className="text-sm font-semibold text-text-main">{formatDate(exp.start_date)}</div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">End Date</label>
                            <div className="text-sm font-semibold text-text-main">
                              {exp.end_date?.is_current ? 'Present' : formatDate(exp.end_date)}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Description</label>
                          <div className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{exp.description}</div>
                        </div>
                      </>
                    )}
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
                    {editingId === edu._id ? (
                      <EducationForm
                        initialData={edu}
                        onSave={handleSaveEducation}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <>
                        <div className="absolute top-6 right-6 flex gap-2">
                          <button
                            onClick={() => setEditingId(edu._id || null)}
                            className="text-text-sub hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={async () => {
                              if (edu._id) {
                                await apiService.deleteEducation(edu._id);
                                setEducation(p => p.filter(e => e._id !== edu._id));
                              }
                            }}
                            className="text-text-sub hover:text-alerts transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Institution</label>
                          <div className="text-base font-bold text-text-main">{edu.school_name || edu.school || 'Not specified'}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Degree</label>
                            <div className="text-base font-bold text-text-main">{edu.degree || 'Not specified'}</div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Field of Study</label>
                            <div className="text-base font-bold text-text-main">{edu.field_of_study || 'Not specified'}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Start Date</label>
                            <div className="text-sm font-semibold text-text-main">
                              {edu.start_date && edu.start_date.year ?
                                `${edu.start_date.month ? (edu.start_date.month + '/') : ''}${edu.start_date.year}` : '-'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Graduation Date</label>
                            <div className="text-sm font-semibold text-text-main">
                              {edu.end_date && edu.end_date.year ?
                                `${edu.end_date.month ? (edu.end_date.month + '/') : ''}${edu.end_date.year}` : '-'}
                            </div>
                          </div>
                        </div>
                        {edu.grade && (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Grade</label>
                            <div className="text-sm font-semibold text-text-main">{edu.grade}</div>
                          </div>
                        )}
                        {edu.description && (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-text-sub uppercase tracking-wider">Description</label>
                            <div className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{edu.description}</div>
                          </div>
                        )}
                      </>
                    )}
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
                            <span>{skill.skill_name}</span>
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
                      <p className="text-xs text-text-sub font-medium">{cert.issuing_organization} • Issued {cert.issue_date?.month || ''} {cert.issue_date?.year || ''}</p>
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
            {renderSectionHeader('Projects', 'rocket_launch', handleSaveProfile)}
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
                        <h4 className="text-lg font-bold text-text-main">{proj.project_name}</h4>
                        {proj.project_url && (
                          <a href={proj.project_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                            {proj.project_url}
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
                          <p className="text-[12px] text-text-sub font-medium leading-none mt-1">{award.issuing_organization} • {award.issue_date.year}</p>
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
                        <p className="text-xs text-text-sub font-bold uppercase tracking-wider">{vol.organization} • {vol.start_date.year} - {vol.end_date?.is_current ? 'Present' : (vol.end_date?.year || '')}</p>
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
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarUpload}
      />
      <input
        type="file"
        ref={resumeInputRef}
        className="hidden"
        accept="application/pdf"
        onChange={handleResumeUpload}
      />
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
              {lastSaved ? `Last saved ${formatTimeSince(lastSaved)}` : 'No changes saved yet'}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-8">
          {/* Main Content Area */}
          <div className="space-y-6">

            {/* User Banner Card - Always shown at top */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-soft overflow-hidden relative group">
              <div
                className="h-32 bg-cover bg-center relative transition-all duration-500"
                style={{
                  backgroundImage: profile?.cover_image_url ? `url(${profile.cover_image_url})` : 'linear-gradient(to bottom right, #3b28cc, #291f7a)'
                }}
              >
                {!profile?.cover_image_url && (
                  <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                )}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={async () => {
                      // Use backend API with Unsplash integration
                      try {
                        const { imageUrl } = await apiService.getRandomBanner();

                        if (imageUrl && profile) {
                          const updated = { ...profile, cover_image_url: imageUrl };
                          setProfile(updated);
                          await apiService.updateUserProfile(updated);
                        }
                      } catch (e) {
                        console.error(e);
                        alert("Failed to save banner");
                      }
                    }}
                    className="bg-white/90 backdrop-blur-sm text-text-main text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-white flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">shuffle</span>
                    Shuffle Cover
                  </button>
                </div>
              </div>
              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 relative z-10">
                  <div className="relative group">
                    <div
                      className="size-28 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg relative cursor-pointer z-10"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {/* Loading Ring */}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 z-20 pointer-events-none">
                          <svg className="w-full h-full -rotate-90">
                            <circle
                              className="text-primary/20"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="48"
                              cx="52"
                              cy="52"
                            />
                            <circle
                              className="text-primary animate-[spin_2s_linear_infinite]"
                              strokeWidth="8"
                              strokeDasharray="300"
                              strokeDashoffset="150"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="48"
                              cx="52"
                              cy="52"
                            />
                          </svg>
                        </div>
                      )}

                      <img
                        src={profile?.profile_image_url ?
                          (profile.profile_image_url.startsWith('http') ? profile.profile_image_url : `${apiService['baseURL'] || 'http://localhost:3001'}${profile.profile_image_url}`)
                          : "https://picsum.photos/id/64/200/200"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {uploadingAvatar ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-white animate-spin">refresh</span>
                            <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Uploading</span>
                          </div>
                        ) : (
                          <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-1 right-1 size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div>
                      <h2 className="text-2xl font-black text-text-main tracking-tight">
                        {profile?.first_name && profile?.last_name ?
                          `${profile.first_name} ${profile.last_name}` :
                          profile?.human_id}
                      </h2>
                      <div className="flex items-center gap-3 mt-1">
                        {(() => {
                          const getTierBadgeProps = (tier?: string) => {
                            switch (tier) {
                              case 'layer_3':
                                return { label: 'Full KYC Verified', color: 'bg-green-50 text-green-600 border-green-100' };
                              case 'layer_2':
                                return { label: 'Liveness Verified', color: 'bg-purple-50 text-purple-600 border-purple-100' };
                              case 'layer_1':
                                return { label: 'Basic Verified', color: 'bg-blue-50 text-blue-600 border-blue-100' };
                              default:
                                return { label: 'Identity Active', color: 'bg-gray-50 text-gray-600 border-gray-100' };
                            }
                          };
                          const badge = getTierBadgeProps(profile?.tier);
                          return (
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${badge.color}`}>
                              <span className="material-symbols-outlined text-[14px] icon-filled">shield</span>
                              <span className="text-[11px] font-bold uppercase tracking-wider">
                                {badge.label}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                      <span className="text-sm font-bold text-text-main">Open to Work</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={openToWork}
                          onChange={async () => {
                            const newValue = !openToWork;
                            setOpenToWork(newValue);

                            // Auto-save logic
                            if (profile) {
                              try {
                                const updatedProfile = {
                                  ...profile,
                                  open_to_work: { ...profile.open_to_work, enabled: newValue }
                                };

                                // Update local profile state immediately for instant UI feedback (previews, etc)
                                setProfile(updatedProfile);

                                await apiService.updateUserProfile(updatedProfile);

                                // Sync global auth context
                                await refreshUser();
                              } catch (e) {
                                console.error('Error toggling open to work:', e);
                              }
                            }
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <img src="/logos/logo.svg" alt="CasperID" className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-black text-text-main">CasperID (DID)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-text-sub">
                      {profile?.human_id || (profile?.wallet ? `did:casper:${profile.wallet.slice(0, 4)}...${profile.wallet.slice(-3)}` : 'did:casper:pending')}
                    </code>
                    <button
                      onClick={() => {
                        const didText = profile?.human_id || profile?.wallet || '';
                        navigator.clipboard.writeText(didText);
                      }}
                      className="text-primary hover:text-primary/80"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={async () => {
                    if (confirm('Discard all unsaved changes?')) {
                      await refreshAllData();
                    }
                  }}
                  className="flex-1 md:flex-none h-12 px-6 rounded-xl text-sm font-bold text-text-sub hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
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

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all font-black text-text-main text-sm group active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-green-500 group-hover:scale-110 transition-transform">share</span>
                Share Profile link
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

              {/* ATS Score Card (Global Sidebar) */}
              <ATSScoreCard
                data={atsScoreData}
                onClickReport={() => alert("Full Report coming soon!")}
              />
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
