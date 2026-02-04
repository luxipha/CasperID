import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { UserProfile, Experience, Education, Certification, Skill, Project, Award, Language, Volunteer } from '../types';
import ProfileDisplay from './ProfileDisplay.tsx';
import HeaderMarketing from './HeaderMarketing';
import { Loader2, AlertCircle } from 'lucide-react';
// import { Button } from './ui/button';

interface PublicProfileContainerProps {
    walletOrUsername: string;
}

export const PublicProfileContainer: React.FC<PublicProfileContainerProps> = ({ walletOrUsername }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Profile data
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [educationList, setEducationList] = useState<Education[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

    useEffect(() => {
        if (walletOrUsername && walletOrUsername !== 'null' && walletOrUsername !== 'undefined') {
            loadProfile();
        }
    }, [walletOrUsername]);

    const loadProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use public profile endpoint to get all data in one call
            const publicProfileData = await apiClient.getPublicProfile(walletOrUsername);

            // Set profile data
            setProfile(publicProfileData);

            // Dynamically update page title for SEO
            if (publicProfileData) {
                const name = publicProfileData.first_name && publicProfileData.last_name
                    ? `${publicProfileData.first_name} ${publicProfileData.last_name}`
                    : (publicProfileData.human_id || walletOrUsername);
                document.title = `${name} - CasperID Profile`;
            }

            // Set all section data from the single response (safely handling potential missing arrays)
            setExperiences(publicProfileData.experiences || []);
            setEducationList(publicProfileData.education || []);
            setCertifications(publicProfileData.certifications || []);
            setSkills(publicProfileData.skills || []);
            setProjects(publicProfileData.projects || []);
            setAwards(publicProfileData.awards || []);
            setLanguages(publicProfileData.languages || []);
            setVolunteers(publicProfileData.volunteers || []);

        } catch (error: any) {
            console.error('Failed to load public profile:', error);
            if (error.message?.includes('not found') || error.message?.includes('404')) {
                setError('Profile not found');
            } else {
                setError('Failed to load profile data');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-xl p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
                    <p className="text-gray-500 mb-6">
                        {error === 'Profile not found'
                            ? "We couldn't find a profile for this wallet/ID."
                            : "Something went wrong while loading this profile."}
                    </p>
                    <a href="/">
                        <button className="w-full h-12 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all">
                            Go to Home
                        </button>
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <HeaderMarketing />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
                <ProfileDisplay
                    data={{
                        profile,
                        experiences,
                        education: educationList,
                        certifications,
                        skills,
                        projects,
                        awards,
                        languages,
                        volunteers
                    }}
                />
            </main>
        </div>
    );
};
