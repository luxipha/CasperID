const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface VerificationRequest {
    wallet: string;
    tier: 'basic' | 'full_kyc';
    email?: string;

    // Extended Basic
    first_name?: string;
    last_name?: string;
    name?: string; // Backwards compatibility
    date_of_birth?: string; // ISO date
    age?: number;
    phone_number?: string;
    home_address?: string;
    location?: string;

    // Professional
    education?: string;
    work_history?: string;
    job_title?: string;
    skills?: string[];
    info?: string;
    image_url?: string;

    // Socials
    socials?: {
        linkedin?: string;
        twitter?: string;
        google?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };

    // CNS
    cns_name?: string; // Requested domain name

    metadata?: Record<string, any>;
}

export interface IdentityStatus {
    wallet: string;
    human_id?: string;
    verified: boolean;
    tier: string | null;
    last_kyc_at: number | null;
    last_liveness_at: number | null;
    issuer: string | null;
    pending_request?: boolean;
    request_status?: string | null;
    profile?: Partial<VerificationRequest>;
    extended_profile?: {
        basic: UserProfile;
        experiences: Experience[];
        education: Education[];
        certifications: Certification[];
        skills: Skill[];
        projects: Project[];
        awards: Award[];
        languages: Language[];
        volunteering: Volunteer[];
    };
}

export interface EvaluateRequirementsRequest {
    wallet: string;
    requirements: {
        kyc_full?: boolean;
        liveness_max_age_days?: number;
    };
}

export interface EvaluateRequirementsResponse {
    meets_requirements: boolean;
    needs_liveness_refresh: boolean;
    credential?: {
        tier: string;
        last_kyc_at: number;
        last_liveness_at: number;
    };
}

// ============================================
// LINKEDIN-STYLE PROFILE INTERFACES
// ============================================

export interface UserProfile {
    _id?: string;
    wallet: string;
    human_id?: string;
    cns_name?: string;

    // Header Info
    first_name?: string;
    last_name?: string;
    pronouns?: string;
    headline?: string;
    profile_image_url?: string;
    cover_image_url?: string;

    // Location
    city?: string;
    country?: string;

    // Contact
    email?: string;
    phone_number?: string;
    website?: string;
    portfolio_links?: string[];

    // About
    about?: string;

    // Socials
    socials?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
        website?: string;
    };

    // Open to Work
    open_to_work?: {
        enabled: boolean;
        job_titles?: string[];
        employment_types?: ('full-time' | 'part-time' | 'contract' | 'freelance' | 'internship')[];
        locations?: string[];
        remote_preference?: 'on-site' | 'hybrid' | 'remote' | 'any';
        salary_range?: {
            min?: number;
            max?: number;
            currency?: string;
        };
        availability?: string;
    };

    // Privacy
    privacy_settings?: {
        allow_email: boolean;
        allow_phone: boolean;
        allow_address: boolean;
        allow_birth_date: boolean;
        alert_on_view: boolean;
        show_open_to_work: boolean;
    };

    // Metadata
    profile_completeness?: number;
    industry?: string;
    seniority_level?: 'entry' | 'mid' | 'senior' | 'executive' | 'director';

    created_at?: Date;
    updated_at?: Date;
}

export interface Experience {
    _id?: string;
    wallet: string;
    company_name: string;
    company_linkedin_url?: string;
    job_title: string;
    employment_type: 'full-time' | 'part-time' | 'self-employed' | 'freelance' | 'contract' | 'internship' | 'seasonal';
    location?: string;
    location_type?: 'on-site' | 'hybrid' | 'remote';
    start_date?: {
        month?: number;
        year?: number;
    };
    end_date?: {
        month?: number;
        year?: number;
        is_current?: boolean;
    };
    description?: string;
    media_attachments?: {
        type: 'image' | 'video' | 'document' | 'link';
        url: string;
        title?: string;
    }[];
    display_order?: number;
    created_at?: Date;
}

export interface Education {
    _id?: string;
    wallet: string;
    school_name: string;
    school_linkedin_url?: string;
    degree?: string;
    field_of_study?: string;
    start_date?: {
        month?: number;
        year?: number;
    };
    end_date?: {
        month?: number;
        year?: number;
    };
    grade?: string;
    activities?: string;
    description?: string;
    media_attachments?: {
        type: 'image' | 'document' | 'link';
        url: string;
        title?: string;
    }[];
    display_order?: number;
    created_at?: Date;
}

export interface Certification {
    _id?: string;
    wallet: string;
    name: string;
    issuing_organization: string;
    issue_date?: {
        month?: number;
        year?: number;
    };
    expiration_date?: {
        month?: number;
        year?: number;
        does_not_expire?: boolean;
    };
    credential_id?: string;
    credential_url?: string;
    display_order?: number;
    created_at?: Date;
}

export interface Skill {
    _id?: string;
    wallet: string;
    skill_name: string;
    endorsements_count?: number;
    endorsed_by?: {
        wallet: string;
        cns_name?: string;
        date?: Date;
    }[];
    display_order?: number;
    is_top_skill?: boolean;
    created_at?: Date;
}

export interface Project {
    _id?: string;
    wallet: string;
    project_name: string;
    associated_with?: {
        type: 'job' | 'education' | 'standalone';
        reference_id?: string;
    };
    start_date?: {
        month?: number;
        year?: number;
    };
    end_date?: {
        month?: number;
        year?: number;
        is_ongoing?: boolean;
    };
    description?: string;
    project_url?: string;
    media_attachments?: {
        type: 'image' | 'video' | 'document' | 'link';
        url: string;
        title?: string;
    }[];
    display_order?: number;
    created_at?: Date;
}

export interface Award {
    _id?: string;
    wallet: string;
    title: string;
    issuing_organization?: string;
    issue_date?: {
        month?: number;
        year?: number;
    };
    description?: string;
    display_order?: number;
    created_at?: Date;
}

export interface Language {
    _id?: string;
    wallet: string;
    language_name: string;
    proficiency: 'elementary' | 'limited-working' | 'professional-working' | 'full-professional' | 'native';
    display_order?: number;
    created_at?: Date;
}

export interface Volunteer {
    _id?: string;
    wallet: string;
    organization: string;
    role: string;
    cause?: string;
    start_date?: {
        month?: number;
        year?: number;
    };
    end_date?: {
        month?: number;
        year?: number;
        is_current?: boolean;
    };
    description?: string;
    display_order?: number;
    created_at?: Date;
}

class APIClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    // Request verification
    async requestVerification(data: VerificationRequest) {
        const response = await fetch(`${this.baseURL}/api/request-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        return handleResponse(response);
    }

    // Get identity status
    async getIdentityStatus(wallet: string): Promise<IdentityStatus> {
        const response = await fetch(
            `${this.baseURL}/api/identity-status?wallet=${encodeURIComponent(wallet)}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get identity status');
        }

        return response.json();
    }

    // Evaluate requirements
    async evaluateRequirements(
        data: EvaluateRequirementsRequest
    ): Promise<EvaluateRequirementsResponse> {
        const response = await fetch(`${this.baseURL}/api/evaluate-requirements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to evaluate requirements');
        }

        return response.json();
    }

    // Admin: Get verification requests
    async getVerificationRequests(adminPassword: string, status?: string) {
        const url = status
            ? `${this.baseURL}/api/admin/verification-requests?status=${status}`
            : `${this.baseURL}/api/admin/verification-requests`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${adminPassword}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get verification requests');
        }

        return response.json();
    }

    // Admin: Issue credential
    async issueCredential(
        adminPassword: string,
        requestId: string,
        approve: boolean
    ) {
        const response = await fetch(`${this.baseURL}/api/admin/issue-credential`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminPassword}`,
            },
            body: JSON.stringify({ request_id: requestId, approve }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to issue credential');
        }

        return response.json();
    }

    // Admin: Revoke credential
    async revokeCredential(
        adminPassword: string,
        wallet: string,
        reason: string
    ) {
        const response = await fetch(`${this.baseURL}/api/admin/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminPassword}`,
            },
            body: JSON.stringify({ wallet, reason }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to revoke credential');
        }

        return response.json();
    }

    // Admin: Sync verified profiles
    async syncVerifiedProfiles(adminPassword: string) {
        const response = await fetch(`${this.baseURL}/api/admin/sync-verified-profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminPassword}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to sync verified profiles');
        }

        return response.json();
    }

    // ============================================
    // PROFILE API METHODS
    // ============================================

    // User Profile
    async getProfile(wallet: string): Promise<UserProfile> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get profile');
        }
        return response.json();
    }

    async updateProfile(wallet: string, data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async uploadProfileImage(wallet: string, file: File): Promise<{ profile: UserProfile; imageUrl: string }> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/upload-avatar`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload image');
        }
        return response.json();
    }

    async getRandomBanner(): Promise<{ imageUrl: string }> {
        const response = await fetch(`${this.baseURL}/api/profile/random-banner`);
        return handleResponse(response);
    }


    // Experience
    async getExperiences(wallet: string): Promise<Experience[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/experience`);
        return handleResponse(response);
    }

    async addExperience(wallet: string, data: Omit<Experience, '_id' | 'wallet' | 'created_at'>): Promise<Experience> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/experience`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateExperience(wallet: string, id: string, data: Partial<Experience>): Promise<Experience> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/experience/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteExperience(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/experience/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }

    // Education
    async getEducation(wallet: string): Promise<Education[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/education`);
        return handleResponse(response);
    }

    async addEducation(wallet: string, data: Omit<Education, '_id' | 'wallet' | 'created_at'>): Promise<Education> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/education`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateEducation(wallet: string, id: string, data: Partial<Education>): Promise<Education> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/education/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteEducation(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/education/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }

    // Certifications
    async getCertifications(wallet: string): Promise<Certification[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/certifications`);
        return handleResponse(response);
    }

    async addCertification(wallet: string, data: Omit<Certification, '_id' | 'wallet' | 'created_at'>): Promise<Certification> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/certifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateCertification(wallet: string, id: string, data: Partial<Certification>): Promise<Certification> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/certifications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteCertification(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/certifications/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }

    // Skills
    async getSkills(wallet: string): Promise<Skill[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/skills`);
        return handleResponse(response);
    }

    async addSkill(wallet: string, data: Omit<Skill, '_id' | 'wallet' | 'created_at'>): Promise<Skill> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateSkill(wallet: string, id: string, data: Partial<Skill>): Promise<Skill> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/skills/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteSkill(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/skills/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }

    // Projects
    async getProjects(wallet: string): Promise<Project[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/projects`);
        return handleResponse(response);
    }

    async addProject(wallet: string, data: Omit<Project, '_id' | 'wallet' | 'created_at'>): Promise<Project> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateProject(wallet: string, id: string, data: Partial<Project>): Promise<Project> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteProject(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/projects/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }

    // Awards
    async getAwards(wallet: string): Promise<Award[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/awards`);
        return handleResponse(response);
    }

    async addAward(wallet: string, data: Omit<Award, '_id' | 'wallet' | 'created_at'>): Promise<Award> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/awards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateAward(wallet: string, id: string, data: Partial<Award>): Promise<Award> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/awards/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteAward(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/awards/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }

    // Languages
    async getLanguages(wallet: string): Promise<Language[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/languages`);
        return handleResponse(response);
    }

    async addLanguage(wallet: string, data: Omit<Language, '_id' | 'wallet' | 'created_at'>): Promise<Language> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/languages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateLanguage(wallet: string, id: string, data: Partial<Language>): Promise<Language> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/languages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteLanguage(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/languages/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }

    // Volunteer
    async getVolunteer(wallet: string): Promise<Volunteer[]> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/volunteer`);
        return handleResponse(response);
    }

    async addVolunteer(wallet: string, data: Omit<Volunteer, '_id' | 'wallet' | 'created_at'>): Promise<Volunteer> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/volunteer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async updateVolunteer(wallet: string, id: string, data: Partial<Volunteer>): Promise<Volunteer> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/volunteer/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    }

    async deleteVolunteer(wallet: string, id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/profile/${wallet}/volunteer/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    }
}

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
    }
    return response.json();
}

export const apiClient = new APIClient(API_URL);
