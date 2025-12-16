'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    User, Briefcase, GraduationCap, Award as AwardIcon, Code,
    Trophy, Languages, Heart, Eye, EyeOff, Camera,
    Plus, Edit2, Trash2, X, Save, ChevronRight, ArrowLeft, RefreshCw, Loader2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient, UserProfile, Experience, Education, Certification, Skill, Project, Award, Language, Volunteer } from '@/lib/api-client';
import { useCasper } from '@/lib/casper-context';
import ProfilePreview from '@/components/profile-preview';
import ExperienceForm from './experience-form';
import EducationForm from './education-form';
import CertificationForm from './certification-form';
import SkillForm from './skill-form';
import ProjectForm from './project-form';
import AwardForm from './award-form';
import LanguageForm from './language-form';
import VolunteerForm from './volunteer-form';

type Tab = 'profile' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects' | 'awards' | 'languages' | 'volunteer';

export default function EditProfilePage() {
    const { account } = useCasper();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile data
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [educationList, setEducationList] = useState<Education[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

    useEffect(() => {
        if (account) {
            loadProfile();
        }
    }, [account]);

    const loadProfile = async () => {
        if (!account) return;

        setLoading(true);
        try {
            try {
                const profileData = await apiClient.getProfile(account);
                setProfile(profileData);
            } catch (error: any) {
                // If profile doesn't exist yet, just continue with empty state
                if (error.message?.includes('not found') || error.message?.includes('404')) {
                    console.log('Profile not found, initializing new profile');
                } else {
                    console.error('Failed to load user profile:', error);
                }
            }

            const experienceData = await apiClient.getExperiences(account);
            setExperiences(experienceData);

            const educationData = await apiClient.getEducation(account);
            setEducationList(educationData);

            const certificationsData = await apiClient.getCertifications(account);
            setCertifications(certificationsData);

            const skillsData = await apiClient.getSkills(account);
            setSkills(skillsData);

            const projectsData = await apiClient.getProjects(account);
            setProjects(projectsData);

            const awardsData = await apiClient.getAwards(account);
            setAwards(awardsData);

            const languagesData = await apiClient.getLanguages(account);
            setLanguages(languagesData);

            const volunteerData = await apiClient.getVolunteer(account);
            setVolunteers(volunteerData);
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        if (!account) return;

        setSaving(true);
        try {
            const updatedProfile = await apiClient.updateProfile(account, profile);
            setProfile(updatedProfile);
            alert('Profile saved successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile' as Tab, label: 'Profile', icon: User },
        { id: 'experience' as Tab, label: 'Experience', icon: Briefcase },
        { id: 'education' as Tab, label: 'Education', icon: GraduationCap },
        { id: 'skills' as Tab, label: 'Skills', icon: Code },
        { id: 'certifications' as Tab, label: 'Certifications', icon: AwardIcon },
        { id: 'projects' as Tab, label: 'Projects', icon: Trophy },
        { id: 'awards' as Tab, label: 'Awards', icon: Trophy },
        { id: 'languages' as Tab, label: 'Languages', icon: Languages },
        { id: 'volunteer' as Tab, label: 'Volunteer', icon: Heart },
    ];

    if (!account) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <Card className="p-8 bg-slate-800/50 border-slate-700">
                    <p className="text-white">Please connect your wallet to edit your profile.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-gray-400 hover:text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Build your professional Web3 identity
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                            className="bg-transparent border-slate-600 text-white hover:bg-slate-700"
                        >
                            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {showPreview ? 'Hide' : 'Show'} Preview
                        </Button>
                        <Button
                            onClick={saveProfile}
                            disabled={saving}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
                {/* Sidebar Navigation */}
                <div className="w-64 flex-shrink-0">
                    <Card className="bg-slate-800/50 border-slate-700 p-2 sticky top-24">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <ProfileSection profile={profile} setProfile={setProfile} wallet={account} />
                    )}
                    {activeTab === 'experience' && (
                        <ExperienceSection
                            experiences={experiences}
                            setExperiences={setExperiences}
                            wallet={account}
                        />
                    )}
                    {activeTab === 'education' && (
                        <EducationSection
                            educationList={educationList}
                            setEducationList={setEducationList}
                            wallet={account}
                        />
                    )}
                    {activeTab === 'skills' && (
                        <SkillSection skills={skills} setSkills={setSkills} wallet={account} />
                    )}
                    {activeTab === 'certifications' && (
                        <CertificationSection certifications={certifications} setCertifications={setCertifications} wallet={account} />
                    )}
                    {activeTab === 'projects' && (
                        <ProjectSection projects={projects} setProjects={setProjects} wallet={account} />
                    )}
                    {activeTab === 'awards' && (
                        <AwardSection awards={awards} setAwards={setAwards} wallet={account} />
                    )}
                    {activeTab === 'languages' && (
                        <LanguageSection languages={languages} setLanguages={setLanguages} wallet={account} />
                    )}
                    {activeTab === 'volunteer' && (
                        <VolunteerSection volunteers={volunteers} setVolunteers={setVolunteers} wallet={account} />
                    )}
                </div>

                {/* Slide-in Preview Panel */}
                <div
                    className={`fixed top-0 right-0 h-full w-[500px] bg-slate-900 border-l border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${showPreview ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="h-full overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-semibold text-white">Profile Preview</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <ProfilePreview
                            profile={profile}
                            experiences={experiences}
                            educationList={educationList}
                            certifications={certifications}
                            skills={skills}
                            projects={projects}
                            awards={awards}
                            languages={languages}
                            volunteers={volunteers}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Profile Section Component
function ProfileSection({
    profile,
    setProfile,
    wallet
}: {
    profile: Partial<UserProfile>;
    setProfile: (p: Partial<UserProfile>) => void;
    wallet: string;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [randomizing, setRandomizing] = useState(false);

    const updateField = (field: keyof UserProfile, value: any) => {
        setProfile({ ...profile, [field]: value });
    };

    const handleBannerRandomize = async () => {
        setRandomizing(true);
        try {
            const result = await apiClient.getRandomBanner();
            updateField('cover_image_url', result.imageUrl);
        } catch (error) {
            console.error('Failed to get random banner:', error);
            // Fallback client-side if server fails
            const seed = Date.now();
            updateField('cover_image_url', `https://picsum.photos/seed/${seed}/1600/900`);
        } finally {
            setRandomizing(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await apiClient.uploadProfileImage(wallet, file);
            // Backend returns relative path, prepend API URL if needed OR just use as is if served from same origin
            // Actually uploadProfileImage response.imageUrl is expected to be relative
            // But we can construct full URL for display here
            const fullUrl = `http://localhost:3001${result.imageUrl}`;
            updateField('profile_image_url', fullUrl);
        } catch (error: any) {
            alert('Failed to upload image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                {/* Cover Photo */}
                <div
                    className="h-48 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative group bg-cover bg-center transition-all"
                    style={{ backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : undefined }}
                >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBannerRandomize}
                        disabled={randomizing}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${randomizing ? 'animate-spin' : ''}`} />
                        {randomizing ? 'Loading...' : 'Randomize Banner'}
                    </Button>
                </div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                {profile.profile_image_url ? (
                                    <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-600" />
                                )}
                            </div>
                            {/* Upload Overlay */}
                            <div
                                className="absolute inset-0 w-32 h-32 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {uploading && (
                                <div className="absolute inset-0 w-32 h-32 rounded-full bg-black/70 flex items-center justify-center border-4 border-slate-900 z-10">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 ml-6 mb-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">
                                    {profile.first_name || 'Your'} {profile.last_name || 'Name'}
                                </h2>
                                <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700/50">
                                    <Label htmlFor="header-open-to-work" className="text-xs text-green-400 font-semibold cursor-pointer">
                                        #OpenToWork
                                    </Label>
                                    <Switch
                                        id="header-open-to-work"
                                        className="scale-75"
                                        checked={profile.open_to_work?.enabled || false}
                                        onCheckedChange={(checked) => {
                                            const current = profile.open_to_work || { enabled: false };
                                            updateField('open_to_work', { ...current, enabled: checked });
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="text-gray-400 mt-1">
                                {profile.headline?.length || 0} / 220
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Name & Headline */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Identity Details</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-white">First Name</Label>
                            <Input
                                value={profile.first_name || ''}
                                onChange={(e) => updateField('first_name', e.target.value)}
                                placeholder="John"
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-white">Last Name</Label>
                            <Input
                                value={profile.last_name || ''}
                                onChange={(e) => updateField('last_name', e.target.value)}
                                placeholder="Doe"
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-white">Pronouns (optional)</Label>
                        <Input
                            value={profile.pronouns || ''}
                            onChange={(e) => updateField('pronouns', e.target.value)}
                            placeholder="he/him, she/her, they/them"
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>

                    <div>
                        <Label className="text-white">
                            Headline <span className="text-gray-400 text-sm">(220 characters max)</span>
                        </Label>
                        <Input
                            value={profile.headline || ''}
                            onChange={(e) => updateField('headline', e.target.value.slice(0, 220))}
                            placeholder="Full Stack Developer | Web3 Enthusiast | Building the future"
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                            maxLength={220}
                        />
                    </div>
                </div>
            </Card>

            {/* About Section */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                <div>
                    <Label className="text-white">
                        Tell your story <span className="text-gray-400 text-sm">(2,600 characters max)</span>
                    </Label>
                    <Textarea
                        value={profile.about || ''}
                        onChange={(e) => updateField('about', e.target.value.slice(0, 2600))}
                        placeholder="Share your professional journey, passions, and what drives you..."
                        className="bg-slate-700 border-slate-600 text-white mt-2 min-h-[200px]"
                        maxLength={2600}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {profile.about?.length || 0} / 2,600
                    </p>
                </div>
            </Card>

            {/* Location & Contact */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Location & Contact</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-white">City</Label>
                            <Input
                                value={profile.city || ''}
                                onChange={(e) => updateField('city', e.target.value)}
                                placeholder="San Francisco"
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-white">Country</Label>
                            <Input
                                value={profile.country || ''}
                                onChange={(e) => updateField('country', e.target.value)}
                                placeholder="United States"
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-white">Email</Label>
                        <Input
                            type="email"
                            value={profile.email || ''}
                            onChange={(e) => updateField('email', e.target.value)}
                            placeholder="john@example.com"
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>

                    <div>
                        <Label className="text-white">Phone (optional)</Label>
                        <Input
                            type="tel"
                            value={profile.phone_number || ''}
                            onChange={(e) => updateField('phone_number', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>

                    <div>
                        <Label className="text-white">Website</Label>
                        <Input
                            type="url"
                            value={profile.website || ''}
                            onChange={(e) => updateField('website', e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                        />
                    </div>
                </div>
            </Card>

            {/* Job Preferences (Open to Work) - Only visible when enabled */}
            {profile.open_to_work?.enabled && (
                <Card className="bg-slate-800/50 border-slate-700 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">Job Preferences</h3>
                        <p className="text-sm text-gray-400">Customize your job search preferences</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-white">Target Job Titles (comma separated)</Label>
                            <Input
                                value={profile.open_to_work?.job_titles?.join(', ') || ''}
                                onChange={(e) => {
                                    const titles = e.target.value.split(',').map(t => t.trim());
                                    const current = profile.open_to_work || { enabled: true };
                                    updateField('open_to_work', { ...current, job_titles: titles });
                                }}
                                placeholder="Senior Engineer, Solution Architect, Web3 Developer"
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Remote Preference</Label>
                            <div className="mt-1">
                                <Select
                                    value={profile.open_to_work?.remote_preference || 'any'}
                                    onValueChange={(value) => {
                                        const current = profile.open_to_work || { enabled: true };
                                        updateField('open_to_work', { ...current, remote_preference: value as any });
                                    }}
                                >
                                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full">
                                        <SelectValue placeholder="Select preference" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                        <SelectItem value="remote">Remote Only</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                        <SelectItem value="on-site">On-Site</SelectItem>
                                        <SelectItem value="any">Open to Anything</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white">Preferred Locations (comma separated)</Label>
                            <Input
                                value={profile.open_to_work?.locations?.join(', ') || ''}
                                onChange={(e) => {
                                    const locs = e.target.value.split(',').map(l => l.trim());
                                    const current = profile.open_to_work || { enabled: true };
                                    updateField('open_to_work', { ...current, locations: locs });
                                }}
                                placeholder="London, New York, Remote"
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-white">Availability</Label>
                            <Input
                                value={profile.open_to_work?.availability || ''}
                                onChange={(e) => {
                                    const current = profile.open_to_work || { enabled: true };
                                    updateField('open_to_work', { ...current, availability: e.target.value });
                                }}
                                placeholder="Immediate, 2 weeks notice, Viewing offers"
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                            />
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

// Experience Section Component
function ExperienceSection({
    experiences,
    setExperiences,
    wallet
}: {
    experiences: Experience[];
    setExperiences: (e: Experience[]) => void;
    wallet: string;
}) {
    const [showForm, setShowForm] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | undefined>();
    const [saving, setSaving] = useState(false);

    const handleSave = async (data: Partial<Experience>) => {
        setSaving(true);
        try {
            if (editingExperience?._id) {
                // Update existing
                const updated = await apiClient.updateExperience(wallet, editingExperience._id, data);
                setExperiences(experiences.map(exp => exp._id === updated._id ? updated : exp));
            } else {
                // Add new
                const newExp = await apiClient.addExperience(wallet, data as any);
                setExperiences([...experiences, newExp]);
            }
            setShowForm(false);
            setEditingExperience(undefined);
        } catch (error: any) {
            alert(error.message || 'Failed to save experience');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (exp: Experience) => {
        setEditingExperience(exp);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this experience?')) return;

        try {
            await apiClient.deleteExperience(wallet, id);
            setExperiences(experiences.filter(exp => exp._id !== id));
        } catch (error: any) {
            alert(error.message || 'Failed to delete experience');
        }
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Work Experience</h3>
                        <Button
                            onClick={() => {
                                setEditingExperience(undefined);
                                setShowForm(true);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Experience
                        </Button>
                    </div>

                    {experiences.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No work experience added yet</p>
                            <p className="text-sm text-gray-500 mt-1">Click "Add Experience" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {experiences.map((exp) => (
                                <div
                                    key={exp._id}
                                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-purple-500 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Briefcase className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white">{exp.job_title}</h4>
                                                <p className="text-gray-300">{exp.company_name}</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {exp.start_date?.year || 'N/A'} - {exp.end_date?.is_current ? 'Present' : exp.end_date?.year || 'N/A'}
                                                    {exp.location && ` • ${exp.location}`}
                                                    {exp.location_type && ` • ${exp.location_type}`}
                                                </p>
                                                {exp.description && (
                                                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{exp.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(exp)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(exp._id!)}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Experience Form Modal */}
            {showForm && (
                <ExperienceForm
                    experience={editingExperience}
                    onSave={handleSave}
                    onClose={() => {
                        setShowForm(false);
                        setEditingExperience(undefined);
                    }}
                />
            )}
        </>
    );
}

// Education Section Component
function EducationSection({
    educationList,
    setEducationList,
    wallet
}: {
    educationList: Education[];
    setEducationList: (e: Education[]) => void;
    wallet: string;
}) {
    const [showForm, setShowForm] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | undefined>();
    const [saving, setSaving] = useState(false);

    const handleSave = async (data: Partial<Education>) => {
        setSaving(true);
        try {
            if (editingEducation?._id) {
                // Update existing
                const updated = await apiClient.updateEducation(wallet, editingEducation._id, data);
                setEducationList(educationList.map(edu => edu._id === updated._id ? updated : edu));
            } else {
                // Add new
                const newEdu = await apiClient.addEducation(wallet, data as any);
                setEducationList([...educationList, newEdu]);
            }
            setShowForm(false);
            setEditingEducation(undefined);
        } catch (error: any) {
            alert(error.message || 'Failed to save education');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (edu: Education) => {
        setEditingEducation(edu);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this education entry?')) return;

        try {
            await apiClient.deleteEducation(wallet, id);
            setEducationList(educationList.filter(edu => edu._id !== id));
        } catch (error: any) {
            alert(error.message || 'Failed to delete education');
        }
    };

    return (
        <>
            <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Education</h3>
                        <Button
                            onClick={() => {
                                setEditingEducation(undefined);
                                setShowForm(true);
                            }}
                            className="bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Education
                        </Button>
                    </div>

                    {educationList.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No education added yet</p>
                            <p className="text-sm text-gray-500 mt-1">Click "Add Education" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {educationList.map((edu) => (
                                <div
                                    key={edu._id}
                                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-green-500 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white">{edu.school_name}</h4>
                                                <p className="text-sm text-gray-300">{edu.degree}{edu.field_of_study ? ` - ${edu.field_of_study}` : ''}</p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {edu.start_date?.year || 'N/A'} - {edu.end_date?.year || 'N/A'}
                                                </p>
                                                {edu.grade && (
                                                    <p className="text-sm text-gray-400 mt-1">Grade: {edu.grade}</p>
                                                )}
                                                {edu.description && (
                                                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{edu.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(edu)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(edu._id!)}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Education Form Modal */}
            {showForm && (
                <EducationForm
                    education={editingEducation}
                    onSave={handleSave}
                    onClose={() => {
                        setShowForm(false);
                        setEditingEducation(undefined);
                    }}
                />
            )}
        </>
    );
}

// Certification Section Component
function CertificationSection({ certifications, setCertifications, wallet }: { certifications: Certification[], setCertifications: (data: Certification[]) => void, wallet: string }) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Certification | undefined>();

    const handleSave = async (data: Partial<Certification>) => {
        try {
            if (editingItem?._id) {
                const updated = await apiClient.updateCertification(wallet, editingItem._id, data);
                setCertifications(certifications.map(item => item._id === updated._id ? updated : item));
            } else {
                const newItem = await apiClient.addCertification(wallet, data as any);
                setCertifications([...certifications, newItem]);
            }
            setShowForm(false);
            setEditingItem(undefined);
        } catch (error: any) { alert(error.message || 'Failed to save'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this certification?')) return;
        try { await apiClient.deleteCertification(wallet, id); setCertifications(certifications.filter(item => item._id !== id)); } catch (error) { console.error(error); }
    };

    return (
        <>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Certifications</h3>
                    <Button onClick={() => { setEditingItem(undefined); setShowForm(true); }} className="bg-gradient-to-r from-yellow-500 to-orange-500"><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="space-y-4">
                    {certifications.map(cert => (
                        <div key={cert._id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 flex justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0"><AwardIcon className="w-6 h-6 text-white" /></div>
                                <div>
                                    <h4 className="font-semibold text-white">{cert.name}</h4>
                                    <p className="text-gray-300">{cert.issuing_organization}</p>
                                    <p className="text-sm text-gray-400">Issued {cert.issue_date?.month}/{cert.issue_date?.year}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditingItem(cert); setShowForm(true); }}><Edit2 className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(cert._id!)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {showForm && <CertificationForm certification={editingItem} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </>
    );
}

// Skill Section Component
function SkillSection({ skills, setSkills, wallet }: { skills: Skill[], setSkills: (data: Skill[]) => void, wallet: string }) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Skill | undefined>();

    const handleSave = async (data: Partial<Skill>) => {
        try {
            if (editingItem?._id) {
                const updated = await apiClient.updateSkill(wallet, editingItem._id, data);
                setSkills(skills.map(item => item._id === updated._id ? updated : item));
            } else {
                const newItem = await apiClient.addSkill(wallet, data as any);
                setSkills([...skills, newItem]);
            }
            setShowForm(false);
            setEditingItem(undefined);
        } catch (error: any) { alert(error.message || 'Failed to save'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this skill?')) return;
        try { await apiClient.deleteSkill(wallet, id); setSkills(skills.filter(item => item._id !== id)); } catch (error) { console.error(error); }
    };

    return (
        <>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Skills</h3>
                    <Button onClick={() => { setEditingItem(undefined); setShowForm(true); }} className="bg-gradient-to-r from-blue-500 to-cyan-500"><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                        <div key={skill._id} className="px-4 py-2 bg-slate-700/50 rounded-full border border-slate-600 flex items-center gap-2">
                            <span className="text-white">{skill.skill_name}</span>
                            {skill.is_top_skill && <span className="text-yellow-500">★</span>}
                            <button onClick={() => { setEditingItem(skill); setShowForm(true); }}><Edit2 className="w-3 h-3 text-gray-400 hover:text-white" /></button>
                            <button onClick={() => handleDelete(skill._id!)}><X className="w-3 h-3 text-gray-400 hover:text-red-400" /></button>
                        </div>
                    ))}
                </div>
            </Card>
            {showForm && <SkillForm skill={editingItem} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </>
    );
}

// Project Section Component
function ProjectSection({ projects, setProjects, wallet }: { projects: Project[], setProjects: (data: Project[]) => void, wallet: string }) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Project | undefined>();

    const handleSave = async (data: Partial<Project>) => {
        try {
            if (editingItem?._id) {
                const updated = await apiClient.updateProject(wallet, editingItem._id, data);
                setProjects(projects.map(item => item._id === updated._id ? updated : item));
            } else {
                const newItem = await apiClient.addProject(wallet, data as any);
                setProjects([...projects, newItem]);
            }
            setShowForm(false);
            setEditingItem(undefined);
        } catch (error: any) { alert(error.message || 'Failed to save'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this project?')) return;
        try { await apiClient.deleteProject(wallet, id); setProjects(projects.filter(item => item._id !== id)); } catch (error) { console.error(error); }
    };

    return (
        <>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Projects</h3>
                    <Button onClick={() => { setEditingItem(undefined); setShowForm(true); }} className="bg-gradient-to-r from-indigo-500 to-purple-500"><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj._id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-white">{proj.project_name}</h4>
                                    <p className="text-sm text-gray-400">{proj.start_date?.year} - {proj.end_date?.year}</p>
                                    <p className="text-sm text-gray-300 mt-2">{proj.description}</p>
                                    {proj.project_url && <a href={proj.project_url} target="_blank" className="text-xs text-blue-400 hover:underline mt-1 block">{proj.project_url}</a>}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => { setEditingItem(proj); setShowForm(true); }}><Edit2 className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(proj._id!)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {showForm && <ProjectForm project={editingItem} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </>
    );
}

// Award Section Component
function AwardSection({ awards, setAwards, wallet }: { awards: Award[], setAwards: (data: Award[]) => void, wallet: string }) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Award | undefined>();

    const handleSave = async (data: Partial<Award>) => {
        try {
            if (editingItem?._id) {
                const updated = await apiClient.updateAward(wallet, editingItem._id, data);
                setAwards(awards.map(item => item._id === updated._id ? updated : item));
            } else {
                const newItem = await apiClient.addAward(wallet, data as any);
                setAwards([...awards, newItem]);
            }
            setShowForm(false);
            setEditingItem(undefined);
        } catch (error: any) { alert(error.message || 'Failed to save'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this award?')) return;
        try { await apiClient.deleteAward(wallet, id); setAwards(awards.filter(item => item._id !== id)); } catch (error) { console.error(error); }
    };

    return (
        <>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Awards</h3>
                    <Button onClick={() => { setEditingItem(undefined); setShowForm(true); }} className="bg-gradient-to-r from-yellow-400 to-amber-600"><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="space-y-4">
                    {awards.map(award => (
                        <div key={award._id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 flex justify-between">
                            <div>
                                <h4 className="font-semibold text-white">{award.title}</h4>
                                <p className="text-gray-300">{award.issuing_organization}</p>
                                <p className="text-sm text-gray-400">{award.issue_date?.year}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditingItem(award); setShowForm(true); }}><Edit2 className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(award._id!)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {showForm && <AwardForm award={editingItem} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </>
    );
}

// Language Section Component
function LanguageSection({ languages, setLanguages, wallet }: { languages: Language[], setLanguages: (data: Language[]) => void, wallet: string }) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Language | undefined>();

    const handleSave = async (data: Partial<Language>) => {
        try {
            if (editingItem?._id) {
                const updated = await apiClient.updateLanguage(wallet, editingItem._id, data);
                setLanguages(languages.map(item => item._id === updated._id ? updated : item));
            } else {
                const newItem = await apiClient.addLanguage(wallet, data as any);
                setLanguages([...languages, newItem]);
            }
            setShowForm(false);
            setEditingItem(undefined);
        } catch (error: any) { alert(error.message || 'Failed to save'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this language?')) return;
        try { await apiClient.deleteLanguage(wallet, id); setLanguages(languages.filter(item => item._id !== id)); } catch (error) { console.error(error); }
    };

    return (
        <>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Languages</h3>
                    <Button onClick={() => { setEditingItem(undefined); setShowForm(true); }} className="bg-gradient-to-r from-pink-500 to-rose-500"><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="space-y-2">
                    {languages.map(lang => (
                        <div key={lang._id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600 flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-white">{lang.language_name}</h4>
                                <p className="text-sm text-gray-400 capitalize">{lang.proficiency?.replace('-', ' ')}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => { setEditingItem(lang); setShowForm(true); }}><Edit2 className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(lang._id!)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {showForm && <LanguageForm language={editingItem} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </>
    );
}

// Volunteer Section Component
function VolunteerSection({ volunteers, setVolunteers, wallet }: { volunteers: Volunteer[], setVolunteers: (data: Volunteer[]) => void, wallet: string }) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Volunteer | undefined>();

    const handleSave = async (data: Partial<Volunteer>) => {
        try {
            if (editingItem?._id) {
                const updated = await apiClient.updateVolunteer(wallet, editingItem._id, data);
                setVolunteers(volunteers.map(item => item._id === updated._id ? updated : item));
            } else {
                const newItem = await apiClient.addVolunteer(wallet, data as any);
                setVolunteers([...volunteers, newItem]);
            }
            setShowForm(false);
            setEditingItem(undefined);
        } catch (error: any) { alert(error.message || 'Failed to save'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this volunteer entry?')) return;
        try { await apiClient.deleteVolunteer(wallet, id); setVolunteers(volunteers.filter(item => item._id !== id)); } catch (error) { console.error(error); }
    };

    return (
        <>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Volunteer Experience</h3>
                    <Button onClick={() => { setEditingItem(undefined); setShowForm(true); }} className="bg-gradient-to-r from-red-500 to-pink-600"><Plus className="w-4 h-4 mr-2" /> Add</Button>
                </div>
                <div className="space-y-4">
                    {volunteers.map(vol => (
                        <div key={vol._id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-white">{vol.role}</h4>
                                    <p className="text-gray-300">{vol.organization}</p>
                                    <p className="text-sm text-gray-400">{vol.start_date?.year} - {vol.end_date?.is_current ? 'Present' : vol.end_date?.year}</p>
                                    <p className="text-sm text-gray-300 mt-1">{vol.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => { setEditingItem(vol); setShowForm(true); }}><Edit2 className="w-4 h-4" /></Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(vol._id!)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {showForm && <VolunteerForm volunteer={editingItem} onSave={handleSave} onClose={() => setShowForm(false)} />}
        </>
    );
}

// End of file

