'use client';

import { useState, useEffect } from 'react';
import { apiClient, UserProfile, Experience, Education, Certification, Skill, Project, Award, Language, Volunteer } from '@/lib/api-client';
import LegacyProfileView from './legacy-profile-view';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PublicProfilePage({ params }: { params: { wallet: string } }) {
    const { wallet } = params;
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
        if (wallet) {
            loadProfile();
        }
    }, [wallet]);

    const loadProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            // Check if profile exists
            try {
                const profileData = await apiClient.getProfile(wallet);
                setProfile(profileData);
            } catch (err: any) {
                if (err.message?.includes('not found') || err.message?.includes('404')) {
                    setError('Profile not found');
                    setLoading(false);
                    return;
                }
                throw err;
            }

            // Load other sections in parallel
            const [
                expData,
                eduData,
                certData,
                skillData,
                projData,
                awardData,
                langData,
                volData
            ] = await Promise.all([
                apiClient.getExperiences(wallet),
                apiClient.getEducation(wallet),
                apiClient.getCertifications(wallet),
                apiClient.getSkills(wallet),
                apiClient.getProjects(wallet),
                apiClient.getAwards(wallet),
                apiClient.getLanguages(wallet),
                apiClient.getVolunteer(wallet)
            ]);

            setExperiences(expData);
            setEducationList(eduData);
            setCertifications(certData);
            setSkills(skillData);
            setProjects(projData);
            setAwards(awardData);
            setLanguages(langData);
            setVolunteers(volData);

        } catch (error: any) {
            console.error('Failed to load profile:', error);
            setError('Failed to load profile data');
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
                    <Link href="/">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            Go to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <LegacyProfileView
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
            <Footer />
        </div>
    );
}
