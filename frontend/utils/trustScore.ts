/**
 * Global Trust Score Calculator
 *
 * Combines Identity Verification tier + Profile Completeness into a
 * single 0-100 score. Applications require a minimum of 60 to proceed.
 *
 * Scoring Model:
 * - Identity Verification:  50 pts max (Layer1=10, Layer2=25, Layer3=50)
 * - Core Experience:        25 pts max (Exp=10, Edu=10, Skills=5)
 * - Profile Essentials:     10 pts max (Name, Photo, Headline, Bio @ 2.5 each)
 * - Portfolio & Expertise:  15 pts max (Projects, Certs, Awards, Volunteers, Socials, Languages @ 2.5 each)
 */

import { User } from '../contexts/AuthContext';

export const APPLY_THRESHOLD = 60;

export interface TrustScoreBreakdown {
    identity: number;       // max 50
    coreExperience: number; // max 25
    essentials: number;     // max 10
    portfolio: number;      // max 15
    total: number;          // max 100
    missing: string[];      // human-readable tips (top 3)
}

export function calculateGlobalTrustScore(user: User | null): TrustScoreBreakdown {
    const missing: string[] = [];
    const avail = user?.data_availability ?? {};

    // ── 1. Identity Verification (max 50 pts) ──────────────────────────────
    const tierScores: Record<string, number> = {
        layer_3: 50,
        layer_2: 25,
        layer_1: 10,
        layer_0: 0,
    };
    const identity = tierScores[user?.tier ?? 'layer_0'] ?? 0;
    if (identity < 25) missing.push('Complete Liveness Check to boost your score (+15)');
    else if (identity < 50) missing.push('Complete Full KYC for maximum Identity score (+25)');

    // ── 2. Core Experience (max 25 pts) ────────────────────────────────────
    let coreExperience = 0;
    if (avail.experience) { coreExperience += 10; } else { missing.push('Add at least one Work Experience (+10)'); }
    if (avail.education) { coreExperience += 10; } else { missing.push('Add your Education (+10)'); }
    if (avail.skills) { coreExperience += 5; } else { missing.push('Add at least one Skill (+5)'); }

    // ── 3. Profile Essentials (max 10 pts, 2.5 each) ──────────────────────
    let essentials = 0;
    if (user?.first_name && user?.last_name) { essentials += 2.5; } else { missing.push('Add your First and Last Name (+2.5)'); }
    if (user?.profile_image_url) { essentials += 2.5; } else { missing.push('Upload a Profile Photo (+2.5)'); }
    if (user?.headline) { essentials += 2.5; } else { missing.push('Add a Professional Headline (+2.5)'); }
    if (user?.about && user.about.length > 20) { essentials += 2.5; } else { missing.push('Write an About / Bio section (+2.5)'); }

    // ── 4. Portfolio & Expertise (max 15 pts, 2.5 each) ──────────────────
    let portfolio = 0;
    const hasSocials = !!(user?.socials?.linkedin || user?.socials?.github || user?.socials?.twitter);

    if (avail.projects) portfolio += 2.5;
    if (avail.certifications) portfolio += 2.5;
    if (avail.awards) portfolio += 2.5;
    if (avail.volunteer) portfolio += 2.5;
    if (hasSocials) portfolio += 2.5;
    if (avail.languages) portfolio += 2.5;
    portfolio = Math.min(15, portfolio);

    const total = Math.round(identity + coreExperience + essentials + portfolio);

    return {
        identity,
        coreExperience,
        essentials,
        portfolio,
        total,
        missing: missing.slice(0, 3),
    };
}

export function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Incomplete';
}

export function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
}

export function getScoreGradient(score: number): string {
    if (score >= 80) return 'from-emerald-500 to-green-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-rose-500';
}
