'use client';

import { useState, useEffect } from 'react';
import { apiClient, UserProfile, Experience, Education, Certification, Skill, Project, Award, Language, Volunteer } from '@/lib/api-client';
import LegacyProfileView from './legacy-profile-view';
import ProfileSharingTools from './profile-sharing-tools';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ClientProfilePageProps {
  params: { wallet: string };
  initialProfile: UserProfile | null;
  originalSlug?: string;
}

export default function ClientProfilePage({ params, initialProfile, originalSlug }: ClientProfilePageProps) {
  const { wallet } = params;
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);

  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
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
    // If we have initial profile data, extract all sections from it
    if (initialProfile) {
      loadFromInitialData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use public profile endpoint to get all data in one call
      const publicProfileData = await apiClient.getPublicProfile(wallet);
      
      // Set profile data
      setProfile(publicProfileData);
      
      // Set all section data from the single response
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

  const loadFromInitialData = () => {
    // If initialProfile is from the public endpoint, it should already have all sections
    if (initialProfile && 'experiences' in initialProfile) {
      const publicProfile = initialProfile as any;
      setExperiences(publicProfile.experiences || []);
      setEducationList(publicProfile.education || []);
      setCertifications(publicProfile.certifications || []);
      setSkills(publicProfile.skills || []);
      setProjects(publicProfile.projects || []);
      setAwards(publicProfile.awards || []);
      setLanguages(publicProfile.languages || []);
      setVolunteers(publicProfile.volunteers || []);
    } else {
      // Fallback: if initialProfile doesn't have sections, we need to load them separately
      // This shouldn't happen with the public endpoint, but just in case
      setExperiences([]);
      setEducationList([]);
      setCertifications([]);
      setSkills([]);
      setProjects([]);
      setAwards([]);
      setLanguages([]);
      setVolunteers([]);
    }
    setLoading(false);
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
      
      {/* Profile sharing tools */}
      <ProfileSharingTools 
        profile={profile}
        walletOrHumanId={wallet}
      />
      
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