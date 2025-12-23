'use client';

import { useState, useEffect } from 'react';
import {
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandTiktok,
    IconBrandX,
    IconBrandYoutube,
    IconBriefcase,
    IconCake,
    IconCertificate,
    IconMail,
    IconMapPin,
    IconPhone,
    IconShieldCheck,
    IconSparkles,
} from '@tabler/icons-react';
import Link from 'next/link';
import { Toaster } from '@/components/ui/toaster';
import { UserProfile, Experience, Education, Certification, Skill, Project, Award, Language, Volunteer } from '@/lib/api-client';

interface LegacyProfileViewProps {
    profile: Partial<UserProfile>;
    experiences: Experience[];
    educationList: Education[];
    certifications: Certification[];
    skills: Skill[];
    projects: Project[];
    awards: Award[];
    languages: Language[];
    volunteers: Volunteer[];
}

export default function LegacyProfileView({
    profile,
    experiences,
    educationList,
    certifications,
    skills,
    projects,
    awards,
    languages,
    volunteers
}: LegacyProfileViewProps) {
    const [countryCode, setCountryCode] = useState('');

    // Map props to the legacy formData structure or usage
    // We can use derived state or just variables since we are not editing here (read-only view)

    // Helper to format dates using the legacy logic
    const formatDate = (dateObj?: { month?: number; year?: number }) => {
        if (!dateObj || (!dateObj.month && !dateObj.year)) return "";
        const month =
            typeof dateObj.month === "number"
                ? new Date(0, dateObj.month - 1).toLocaleString("en-US", {
                    month: "short",
                })
                : "";
        return [month, dateObj.year].filter(Boolean).join(" ");
    };

    const formatRange = (
        start?: { month?: number; year?: number },
        end?: { month?: number; year?: number; is_current?: boolean }
    ) => {
        const startStr = formatDate(start);
        const endStr = end?.is_current ? "Present" : formatDate(end) || "";
        return [startStr, endStr].filter(Boolean).join(" - ");
    };

    const formatTimestamp = (timestamp: number | null | undefined) => {
        if (!timestamp) return 'Not verified';
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Construct "formData" object to match the legacy template structure
    const primaryExperience = experiences?.[0];
    const primaryEducation = educationList?.[0];

    const formData = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.human_id || profile.cns_name || "user",
        headline: profile.headline || "",
        email: profile.email || "",
        home_address: [profile.city, profile.country].filter(Boolean).join(", ") || "",
        date_of_birth: "", // Privacy: do not expose DOB on public profile unless explicitly allowed? Legacy showed empty or specific field
        // Legacy constructed summaries:
        educationSummary: (primaryEducation &&
            `${primaryEducation.degree || ""} ${primaryEducation.field_of_study ? "· " + primaryEducation.field_of_study : ""} @ ${primaryEducation.school_name || ""}`.trim()) || "",
        work_historySummary: (primaryExperience &&
            `${primaryExperience.job_title || ""} @ ${primaryExperience.company_name || ""}`) || "",
        phone_number: profile.phone_number || "",
        job_title: primaryExperience?.job_title || profile.industry || profile.headline || "",

        // Socials - mapped from profile.socials or profile root fields?
        // UserProfile schema (from api-client):
        // socials?: { twitter?: string; facebook?: string; linkedin?: string; instagram?: string; github?: string; website?: string; };
        // Legacy props used: x, instagram, tiktok, youtube, linkedin
        x: profile.socials?.twitter || "",
        instagram: profile.socials?.instagram || "",
        tiktok: profile.socials?.tiktok || "", // check schema if tiktok exists
        youtube: profile.socials?.youtube || "", // check schema
        linkedin: profile.socials?.linkedin || "",

        info: profile.about || "",

        // Arrays
        skills: skills?.map((s) => s.skill_name) || [], // Legacy mapped to strings
        imageUrl: profile.profile_image_url || "",
        cover_image_url: profile.cover_image_url || "",
        experiences: experiences || [],
        educationEntries: educationList || [],
        certifications: certifications || [],
        projects: projects || [],
        awards: awards || [],
        languages: languages || [],
        volunteers: volunteers || [],

        // Verification
        verified: profile.is_verified || false, // Assuming is_verified field exists or we pass it
        tier: profile.verification_tier || null,
        last_kyc_at: profile.last_verification_date ? new Date(profile.last_verification_date).getTime() / 1000 : null, // Convert ISO to unix timestamp if needed
    };

    const displayName =
        formData.first_name || formData.last_name
            ? `${formData.first_name} ${formData.last_name}`.trim()
            : formData.username || "Unknown User";

    const headline =
        formData.info ||
        "Building trusted digital identities that travel with you across the web.";

    const contactDetails = [
        {
            label: "Role",
            value: formData.job_title || "Open to opportunities",
            icon: IconBriefcase,
        },
        {
            label: "Location",
            value: formData.home_address || countryCode || "Not shared",
            icon: IconMapPin,
        },
        {
            label: "Email",
            value: formData.email || "Not shared",
            icon: IconMail,
        },
        {
            label: "Phone",
            value: formData.phone_number || "Not shared",
            icon: IconPhone,
        },
    ];

    const verifications = [
        {
            label: "Identity verified",
            status: formData.verified ? "Verified" : "Unverified",
            icon: IconShieldCheck,
            tone: formData.verified ? "emerald" : "gray",
        },
        {
            label: "KYC status",
            status: formData.tier ? `${(formData.tier as string).charAt(0).toUpperCase()}${(formData.tier as string).slice(1).replace('_', ' ')}` : "Not completed",
            icon: IconCertificate,
            tone: formData.tier ? "blue" : "gray",
        },
        {
            label: "Last verified",
            status: formatTimestamp(formData.last_kyc_at),
            icon: IconSparkles,
            tone: formData.last_kyc_at ? "indigo" : "gray",
        },
    ];

    const toneClass: Record<string, string> = {
        emerald: "text-emerald-600",
        blue: "text-blue-600",
        indigo: "text-indigo-600",
        gray: "text-gray-400",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            <Toaster />

            <section className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/80 via-white to-sky-50 blur-3xl" />
                    <div className="absolute right-10 top-24 w-52 h-52 bg-indigo-200/60 rounded-full blur-3xl" />
                    <div className="absolute left-10 bottom-10 w-48 h-48 bg-sky-200/60 rounded-full blur-3xl" />
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-2xl shadow-indigo-100/60 backdrop-blur">
                    <div
                        className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-cover bg-center"
                        style={{
                            backgroundImage: formData.cover_image_url ? `url(${formData.cover_image_url})` : undefined
                        }}
                    />
                    <div className="-mt-16 px-6 pb-8 sm:px-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex gap-5">
                                <div className="relative shrink-0">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-inner" />
                                    <img
                                        className="relative h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-xl"
                                        src={formData.imageUrl || "/images/avatar.jpeg"}
                                        alt="Profile avatar"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-2xl font-semibold text-slate-900">
                                            {displayName}
                                        </p>
                                        {formData.verified && (
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                ✓ Verified on CasperID
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600">@{formData.username}</p>
                                    <p className="max-w-2xl text-sm text-slate-600">
                                        {formData.headline || headline}
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {contactDetails.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 shadow-sm"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-inner">
                                        <item.icon size={18} className="text-slate-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">{item.label}</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="col-span-2 space-y-6">
                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">
                                            About {formData.first_name || "this user"}
                                        </p>
                                        <span className="text-xs text-slate-500">
                                            Updated automatically
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                        {headline}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Experience
                                        </p>
                                        <span className="text-xs text-slate-500">
                                            Recent roles
                                        </span>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {formData.experiences && formData.experiences.length > 0 ? (
                                            formData.experiences.map((exp: any, idx: number) => (
                                                <div
                                                    key={exp._id || idx}
                                                    className="rounded-xl bg-slate-50 px-4 py-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {exp.job_title || "Role"}{" "}
                                                        {exp.company_name ? `@ ${exp.company_name}` : ""}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatRange(exp.start_date, exp.end_date) ||
                                                            exp.location_type ||
                                                            "Details not provided"}
                                                    </p>
                                                    {exp.location && (
                                                        <p className="text-xs text-slate-500">
                                                            {exp.location}
                                                        </p>
                                                    )}
                                                    {exp.description && (
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No experience shared yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Education
                                        </p>
                                        <span className="text-xs text-slate-500">Degrees</span>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {formData.educationEntries &&
                                            formData.educationEntries.length > 0 ? (
                                            formData.educationEntries.map((edu: any, idx: number) => (
                                                <div
                                                    key={edu._id || idx}
                                                    className="rounded-xl bg-slate-50 px-4 py-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {edu.degree || "Degree"}{" "}
                                                        {edu.field_of_study
                                                            ? `· ${edu.field_of_study}`
                                                            : ""}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {edu.school_name || "School not provided"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatRange(edu.start_date, edu.end_date)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No education shared yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Skills & tools
                                        </p>
                                        <span className="text-xs text-slate-500">Curated by the user</span>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(formData.skills?.length ? formData.skills : ["UI/UX", "DevOps", "FrontEnd Dev"]).map(
                                            (skill: string) => (
                                                <span
                                                    key={skill}
                                                    className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
                                                >
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Projects
                                        </p>
                                        <span className="text-xs text-slate-500">
                                            Selected work
                                        </span>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {formData.projects && formData.projects.length > 0 ? (
                                            formData.projects.map((proj: any, idx: number) => (
                                                <div
                                                    key={proj._id || idx}
                                                    className="rounded-xl bg-slate-50 px-4 py-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {proj.project_name || "Project"}
                                                    </p>
                                                    {proj.description && (
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            {proj.description}
                                                        </p>
                                                    )}
                                                    {proj.project_url && (
                                                        <Link
                                                            href={proj.project_url}
                                                            className="text-xs font-semibold text-indigo-600 hover:underline"
                                                            target="_blank"
                                                        >
                                                            View project
                                                        </Link>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No projects shared yet.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Identity & trust
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                                            <div>
                                                <p className="text-xs text-slate-500">Birthday (private)</p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {formData.date_of_birth || "Not shared"}
                                                </p>
                                            </div>
                                            <IconCake size={18} className="text-slate-400" />
                                        </div>
                                        <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                                            <div>
                                                <p className="text-xs text-slate-500">Address</p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {formData.home_address || "Hidden for privacy"}
                                                </p>
                                            </div>
                                            <IconMapPin size={18} className="text-slate-400" />
                                        </div>
                                        <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                                            <div>
                                                <p className="text-xs text-slate-500">Verification tier</p>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {formData.verified && formData.tier
                                                        ? `${(formData.tier as string) === 'basic' ? 'Level 1' : 'Level 2'} · ${(formData.tier as string) === 'basic' ? 'Basic verification' : 'Photo ID & address'}`
                                                        : 'Not verified'}
                                                </p>
                                            </div>
                                            <IconShieldCheck
                                                size={18}
                                                className={formData.verified ? "text-emerald-500" : "text-gray-400"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Certifications
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        {formData.certifications &&
                                            formData.certifications.length > 0 ? (
                                            formData.certifications.map((cert: any, idx: number) => (
                                                <div
                                                    key={cert._id || idx}
                                                    className="rounded-xl bg-slate-50 px-4 py-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {cert.name || "Certification"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {cert.issuing_organization || "Issuer not provided"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatDate(cert.issue_date) ||
                                                            "Issue date not provided"}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No certifications shared yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-900">Awards</p>
                                    <div className="mt-4 space-y-3">
                                        {formData.awards && formData.awards.length > 0 ? (
                                            formData.awards.map((award: any, idx: number) => (
                                                <div
                                                    key={award._id || idx}
                                                    className="rounded-xl bg-slate-50 px-4 py-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {award.title || "Award"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {award.issuing_organization || "Issuer not provided"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatDate(award.issue_date) ||
                                                            "Date not provided"}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No awards shared yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Languages
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        {formData.languages && formData.languages.length > 0 ? (
                                            formData.languages.map((lang: any, idx: number) => (
                                                <div
                                                    key={lang._id || idx}
                                                    className="rounded-xl bg-slate-50 px-4 py-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {lang.language_name || "Language"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {lang.proficiency || "Proficiency not provided"}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No languages shared yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Volunteer
                                    </p>
                                    <div className="mt-4 space-y-3">
                                        {formData.volunteers && formData.volunteers.length > 0 ? (
                                            formData.volunteers.map((vol: any, idx: number) => (
                                                <div
                                                    key={vol._id || idx}
                                                    className="rounded-xl bg-slate-50 px-4 py-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {vol.role || "Volunteer role"}{" "}
                                                        {vol.organization ? `@ ${vol.organization}` : ""}
                                                    </p>
                                                    {vol.cause && (
                                                        <p className="text-xs text-slate-500">
                                                            {vol.cause}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500">
                                                        {formatRange(vol.start_date, vol.end_date)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">
                                                No volunteer experience shared yet.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-900">Social links</p>
                                    <div className="mt-4 grid grid-cols-3 gap-3">
                                        {formData.x && (
                                            <Link
                                                href={formData.x}
                                                className="flex items-center justify-center rounded-xl bg-black px-3 py-2 text-white shadow-sm"
                                                target="_blank"
                                            >
                                                <IconBrandX width={22} height={22} />
                                            </Link>
                                        )}
                                        {formData.instagram && (
                                            <Link
                                                href={formData.instagram}
                                                className="flex items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 px-3 py-2 text-white shadow-sm"
                                                target="_blank"
                                            >
                                                <IconBrandInstagram width={22} height={22} />
                                            </Link>
                                        )}
                                        {formData.youtube && (
                                            <Link
                                                href={formData.youtube}
                                                className="flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-white shadow-sm"
                                                target="_blank"
                                            >
                                                <IconBrandYoutube width={22} height={22} />
                                            </Link>
                                        )}
                                        {formData.tiktok && (
                                            <Link
                                                href={formData.tiktok}
                                                className="flex items-center justify-center rounded-xl bg-[#111827] px-3 py-2 text-white shadow-sm"
                                                target="_blank"
                                            >
                                                <IconBrandTiktok width={22} height={22} />
                                            </Link>
                                        )}
                                        {formData.linkedin && (
                                            <Link
                                                href={formData.linkedin}
                                                className="flex items-center justify-center rounded-xl bg-[#0A66C2] px-3 py-2 text-white shadow-sm"
                                                target="_blank"
                                            >
                                                <IconBrandLinkedin width={22} height={22} />
                                            </Link>
                                        )}
                                        {!formData.x &&
                                            !formData.instagram &&
                                            !formData.youtube &&
                                            !formData.tiktok &&
                                            !formData.linkedin && (
                                                <p className="col-span-3 text-xs text-slate-500">
                                                    No public social links shared.
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
