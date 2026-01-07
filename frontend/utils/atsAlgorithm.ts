
import { UserProfile, Experience, Education, Skill } from '../types';

interface ATSResult {
    score: number;
    breakdown: {
        actionVerbs: number; // 25
        metrics: number; // 25
        keywords: number; // 20
        contactInfo: number; // 10
        formatting: number; // 20
    };
    feedback: string[];
}

const ACTION_VERBS = [
    'developed', 'created', 'managed', 'led', 'designed', 'implemented', 'optimized',
    'reduced', 'increased', 'improved', 'built', 'deployed', 'launched', 'architected',
    'resolved', 'fixed', 'collaborated', 'analyzed', 'generated', 'delivered'
];

export const calculateATSScore = (
    profile: UserProfile | null,
    experiences: Experience[],
    education: Education[],
    skills: Skill[]
): ATSResult => {
    let feedback: string[] = [];
    let score = 0;

    if (!profile) return { score: 0, breakdown: { actionVerbs: 0, metrics: 0, keywords: 0, contactInfo: 0, formatting: 0 }, feedback: ['Create your profile to get started.'] };

    // 1. Action Verbs (25 pts)
    let actionVerbCount = 0;
    experiences.forEach(exp => {
        const firstWord = exp.description?.trim().split(' ')[0]?.toLowerCase();
        if (firstWord && ACTION_VERBS.some(v => firstWord.includes(v))) {
            actionVerbCount++;
        }
    });
    // Cap at 25 (need at least 3 strong descriptions)
    const actionVerbScore = Math.min(25, (actionVerbCount / Math.max(1, experiences.length)) * 25);
    if (experiences.length > 0 && actionVerbScore < 15) feedback.push("Start job descriptions with strong action verbs (e.g., 'Led', 'Built').");

    // 2. Metrics (25 pts)
    let metricCount = 0;
    const metricRegex = /\d+%|\$\d+|\d+x|\d+\+/;
    experiences.forEach(exp => {
        if (metricRegex.test(exp.description || '')) {
            metricCount++;
        }
    });
    // Cap at 25 (need at least 2 metrics)
    const metricScore = Math.min(25, (metricCount / 2) * 25);
    if (experiences.length > 0 && metricScore < 15) feedback.push("Include numbers or percentages to quantify your impact (e.g., 'Increased revenue by 20%').");

    // 3. Keyword Density (20 pts)
    let keywordMatches = 0;
    const allDescriptions = experiences.map(e => e.description?.toLowerCase() || '').join(' ');
    skills.forEach(skill => {
        if (allDescriptions.includes(skill.skill_name.toLowerCase())) {
            keywordMatches++;
        }
    });
    // Need to use at least 50% of listed skills in descriptions
    const keywordScore = Math.min(20, (keywordMatches / Math.max(1, skills.length)) * 40); // 40 multiplier helps reach 20 faster
    if (skills.length > 0 && keywordScore < 10) feedback.push("Mention your listed skills within your job descriptions to improve keyword matching.");

    // 4. Contact Info (10 pts)
    let contactScore = 0;
    if (profile.email) contactScore += 3;
    if (profile.phone_number) contactScore += 3;
    if (profile.city && profile.country) contactScore += 4;
    if (contactScore < 10) feedback.push("Complete your contact information (Email, Phone, Location).");

    // 5. Formatting & Completeness (20 pts)
    let fmtScore = 0;
    if (experiences.length > 0) fmtScore += 5;
    if (education.length > 0) fmtScore += 5;
    if (skills.length >= 3) fmtScore += 5;
    if (profile.about && profile.about.length > 100) fmtScore += 5; // Bio length
    if (fmtScore < 20) feedback.push("Flesh out your profile with Education, at least 3 Skills, and a detailed About section.");

    const totalScore = Math.round(actionVerbScore + metricScore + keywordScore + contactScore + fmtScore);

    return {
        score: totalScore,
        breakdown: {
            actionVerbs: Math.round(actionVerbScore),
            metrics: Math.round(metricScore),
            keywords: Math.round(keywordScore),
            contactInfo: Math.round(contactScore),
            formatting: Math.round(fmtScore)
        },
        feedback: feedback.slice(0, 3) // Top 3 tips
    };
};
