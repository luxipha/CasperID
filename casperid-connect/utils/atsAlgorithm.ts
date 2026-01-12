
export interface ATSResult {
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
    profile: any | null,
    experiences: any[],
    education: any[],
    skills: any[]
): ATSResult => {
    let feedback: string[] = [];

    if (!profile) return { score: 0, breakdown: { actionVerbs: 0, metrics: 0, keywords: 0, contactInfo: 0, formatting: 0 }, feedback: ['Connect your CasperID to get started.'] };

    // 1. Action Verbs (25 pts)
    let actionVerbCount = 0;
    experiences.forEach(exp => {
        const firstWord = exp.description?.trim().split(' ')[0]?.toLowerCase();
        if (firstWord && ACTION_VERBS.some(v => firstWord.includes(v))) {
            actionVerbCount++;
        }
    });
    const actionVerbScore = Math.min(25, (actionVerbCount / Math.max(1, experiences.length)) * 25);
    if (experiences.length > 0 && actionVerbScore < 15) feedback.push("Start job descriptions with strong action verbs.");

    // 2. Metrics (25 pts)
    let metricCount = 0;
    const metricRegex = /\d+%|\$\d+|\d+x|\d+\+/;
    experiences.forEach(exp => {
        if (metricRegex.test(exp.description || '')) {
            metricCount++;
        }
    });
    const metricScore = Math.min(25, (metricCount / 2) * 25);
    if (experiences.length > 0 && metricScore < 15) feedback.push("Include numbers or percentages to quantify impact.");

    // 3. Keyword Density (20 pts)
    let keywordMatches = 0;
    const allDescriptions = experiences.map(e => e.description?.toLowerCase() || '').join(' ');
    skills.forEach(skill => {
        const name = typeof skill === 'string' ? skill : (skill.skill_name || '');
        if (allDescriptions.includes(name.toLowerCase())) {
            keywordMatches++;
        }
    });
    const keywordScore = Math.min(20, (keywordMatches / Math.max(1, skills.length)) * 40);
    if (skills.length > 0 && keywordScore < 10) feedback.push("Mention listed skills within descriptions.");

    // 4. Contact Info (10 pts)
    let contactScore = 0;
    if (profile.email) contactScore += 3;
    if (profile.phone_number) contactScore += 3;
    if (profile.city || profile.country) contactScore += 4;
    if (contactScore < 10) feedback.push("Complete your contact information.");

    // 5. Formatting & Completeness (20 pts)
    let fmtScore = 0;
    if (experiences.length > 0) fmtScore += 5;
    if (education.length > 0) fmtScore += 5;
    if (skills.length >= 3) fmtScore += 5;
    if (profile.bio || profile.about) fmtScore += 5;
    if (fmtScore < 20) feedback.push("Add more detail to your bio and education.");

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
        feedback: feedback.slice(0, 3)
    };
};
