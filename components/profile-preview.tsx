'use client';

import {
    Briefcase, GraduationCap, Award as AwardIcon,
    Trophy, Heart, User, MapPin, Link as LinkIcon, Mail, Phone, Globe
} from 'lucide-react';
import { UserProfile, Experience, Education, Certification, Skill, Project, Award, Language, Volunteer } from '@/lib/api-client';

export default function ProfilePreview({
    profile,
    experiences,
    educationList,
    certifications,
    skills,
    projects,
    awards,
    languages,
    volunteers
}: {
    profile: Partial<UserProfile>;
    experiences: Experience[];
    educationList?: Education[];
    certifications?: Certification[];
    skills?: Skill[];
    projects?: Project[];
    awards?: Award[];
    languages?: Language[];
    volunteers?: Volunteer[];
}) {
    return (
        <div className="bg-slate-900 min-h-full">
            {/* Header */}
            <div>
                <div
                    className="h-48 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-cover bg-center"
                    style={{ backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : undefined }}
                />
                <div className="px-6 pb-6">
                    <div className="relative -mt-20 mb-6 flex justify-between items-end">
                        <div className="w-40 h-40 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500">
                            {profile.profile_image_url ? (
                                <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-white">{profile.first_name?.[0] || 'U'}</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {profile.first_name || 'First'} {profile.last_name || 'Last'}
                            {profile.pronouns && (
                                <span className="text-base font-normal text-gray-400 ml-2">({profile.pronouns})</span>
                            )}
                        </h1>
                        <p className="text-xl text-gray-300 mt-2">{profile.headline || 'Your headline here'}</p>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                            {(profile.city || profile.country) && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}</span>
                                </div>
                            )}
                            {profile.website && (
                                <div className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{profile.website.replace(/^https?:\/\//, '')}</a>
                                </div>
                            )}
                            {profile.email && (
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{profile.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* About */}
                {profile.about && (
                    <div className="bg-slate-800 rounded-lg p-6">
                        <h3 className="font-semibold text-white mb-3 text-lg">About</h3>
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{profile.about}</p>
                    </div>
                )}

                {/* Experience */}
                {experiences.length > 0 && (
                    <div className="bg-slate-800 rounded-lg p-6">
                        <h3 className="font-semibold text-white mb-4 text-lg">Experience</h3>
                        <div className="space-y-6">
                            {experiences.map((exp) => (
                                <div key={exp._id} className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white text-lg">{exp.job_title}</h4>
                                        <p className="text-gray-300">{exp.company_name}</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {exp.start_date?.year || 'N/A'} - {exp.end_date?.is_current ? 'Present' : exp.end_date?.year || 'N/A'}
                                            {exp.location && ` • ${exp.location}`}
                                        </p>
                                        {exp.description && <p className="text-gray-400 mt-2 text-sm">{exp.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {educationList && educationList.length > 0 && (
                    <div className="bg-slate-800 rounded-lg p-6">
                        <h3 className="font-semibold text-white mb-4 text-lg">Education</h3>
                        <div className="space-y-6">
                            {educationList.map((edu) => (
                                <div key={edu._id} className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <GraduationCap className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white text-lg">{edu.school_name}</h4>
                                        <p className="text-gray-300">{edu.degree}{edu.field_of_study ? ` - ${edu.field_of_study}` : ''}</p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {edu.start_date?.year || 'N/A'} - {edu.end_date?.year || 'N/A'}
                                        </p>
                                        {edu.description && <p className="text-gray-400 mt-2 text-sm">{edu.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                    <div className="bg-slate-800 rounded-lg p-6">
                        <h3 className="font-semibold text-white mb-4 text-lg">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span key={skill._id} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${skill.is_top_skill ? 'bg-purple-900/40 text-purple-200 border border-purple-700/50' : 'bg-slate-700/50 text-gray-300 border border-slate-600'}`}>
                                    {skill.skill_name}
                                    {skill.is_top_skill && <Trophy className="w-3 h-3 text-yellow-500" />}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {projects && projects.length > 0 && (
                    <div className="bg-slate-800 rounded-lg p-6">
                        <h3 className="font-semibold text-white mb-4 text-lg">Projects</h3>
                        <div className="grid gap-4">
                            {projects.map((proj) => (
                                <div key={proj._id} className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-white text-lg">{proj.project_name}</h4>
                                        <span className="text-sm text-gray-400">{proj.start_date?.year} - {proj.end_date?.year}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-3">{proj.description}</p>
                                    {proj.project_url && (
                                        <a href={proj.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300">
                                            <LinkIcon className="w-3 h-3 mr-1" />
                                            View Project
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications & Awards Grid */}
                {((certifications && certifications.length > 0) || (awards && awards.length > 0)) && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {certifications && certifications.length > 0 && (
                            <div className="bg-slate-800 rounded-lg p-6">
                                <h3 className="font-semibold text-white mb-4 text-lg">Certifications</h3>
                                <div className="space-y-4">
                                    {certifications.map((cert) => (
                                        <div key={cert._id} className="flex gap-3">
                                            <div className="w-10 h-10 bg-slate-700/50 rounded flex items-center justify-center flex-shrink-0">
                                                <AwardIcon className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{cert.name}</h4>
                                                <p className="text-sm text-gray-300">{cert.issuing_organization}</p>
                                                <p className="text-xs text-gray-400 mt-1">Issued {cert.issue_date?.year}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {awards && awards.length > 0 && (
                            <div className="bg-slate-800 rounded-lg p-6">
                                <h3 className="font-semibold text-white mb-4 text-lg">Honors & Awards</h3>
                                <div className="space-y-4">
                                    {awards.map((award) => (
                                        <div key={award._id} className="flex gap-3">
                                            <div className="w-10 h-10 bg-slate-700/50 rounded flex items-center justify-center flex-shrink-0">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-white">{award.title}</h4>
                                                <p className="text-sm text-gray-300">{award.issuing_organization}</p>
                                                <p className="text-xs text-gray-400 mt-1">{award.issue_date?.year}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Languages & Volunteer */}
                <div className="grid md:grid-cols-2 gap-6">
                    {languages && languages.length > 0 && (
                        <div className="bg-slate-800 rounded-lg p-6">
                            <h3 className="font-semibold text-white mb-4 text-lg">Languages</h3>
                            <div className="space-y-3">
                                {languages.map((lang) => (
                                    <div key={lang._id} className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                                        <span className="text-white font-medium">{lang.language_name}</span>
                                        <span className="text-sm text-gray-400 capitalize bg-slate-700 px-2 py-1 rounded">{lang.proficiency?.replace('-', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {volunteers && volunteers.length > 0 && (
                        <div className="bg-slate-800 rounded-lg p-6">
                            <h3 className="font-semibold text-white mb-4 text-lg">Volunteering</h3>
                            <div className="space-y-4">
                                {volunteers.map((vol) => (
                                    <div key={vol._id} className="flex gap-3">
                                        <div className="w-10 h-10 bg-slate-700/50 rounded flex items-center justify-center flex-shrink-0">
                                            <Heart className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">{vol.role}</h4>
                                            <p className="text-sm text-gray-300">{vol.organization}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {vol.start_date?.year} - {vol.end_date?.is_current ? 'Present' : vol.end_date?.year}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
