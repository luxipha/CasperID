export interface UserProfile {
  _id?: string;
  wallet: string;
  human_id?: string;
  cns_name?: string;
  tier?: 'layer_0' | 'layer_1' | 'layer_2' | 'layer_3';
  is_verified?: boolean;
  credential_hash?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  headline?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  city?: string;
  country?: string;
  address?: string;
  website?: string;
  portfolio_links?: string[];
  about?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    [key: string]: string | undefined;
  };
  open_to_work?: {
    enabled: boolean;
    roles?: string[];
    employment_types?: string[];
    locations?: string[];
    remote_preference?: 'on-site' | 'hybrid' | 'remote' | 'any';
    salary_range?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    availability?: string;
  };
  industry?: string;
  seniority_level?: string;
  profile_completeness?: number;
  pronouns?: string;
  created_at?: string;
  updated_at?: string;
  did_address?: string;
  context_dids?: Array<{
    did: string;
    alias?: string;
    context: string;
    routing_type?: 'identity' | 'wallet';
    target_wallet?: string;
    disclosures?: Record<string, boolean>;
    tier_required?: string;
    created_at?: string;
  }>;
  cns_routing?: Array<{
    name: string;
    target_type: 'master_profile' | 'context_did' | 'wallet_only' | 'redirect';
    target_id?: string;
    redirect_url?: string;
    active: boolean;
  }>;
  linked_wallets?: Array<{
    chain: 'casper' | 'ethereum' | 'solana' | 'bitcoin';
    address: string;
    verified: boolean;
    verified_at?: string;
  }>;
  passkey_count?: number;
  account_created_at?: string;
}

export interface Experience {
  _id?: string;
  job_title: string;
  company_name: string;
  location?: string;
  start_date: { month: number | string; year: number | string };
  end_date?: { month: number | string; year: number | string; is_current?: boolean } | null;
  employment_type?: string;
  description?: string;
  skills_used?: string[];
  display_order?: number;
}

export interface Education {
  _id?: string;
  school: string;
  school_name?: string; // Matching backend schema
  degree: string;
  field_of_study?: string;
  start_date: { month: number | string; year: number | string };
  end_date?: { month: number | string; year: number | string };
  grade?: string;
  activities?: string;
  description?: string;
  display_order?: number;
}

export interface Certification {
  _id?: string;
  name: string;
  issuing_organization: string;
  issue_date: { month: number | string; year: number | string };
  expiration_date?: { month: number | string; year: number | string };
  credential_id?: string;
  credential_url?: string;
  display_order?: number;
}

export interface Skill {
  _id?: string;
  skill_name: string; // Changed from name to match potential schema but verified logic often uses name. Wait.
  // Schema (Snippet 2333): skill_name. Form uses name?
  // I'll stick to observed usage or fix. Snippet 2333 showed `skill_name`.
  // I'll update Skill to match schema just in case.
  category?: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  is_top_skill?: boolean;
  endorsements_count?: number; // Match schema
  display_order?: number;
}

export interface Language {
  _id?: string;
  language_name: string;
  proficiency: 'Elementary' | 'Limited Working' | 'Professional Working' | 'Full Professional' | 'Native or Bilingual';
  display_order?: number;
}

export interface Project {
  _id?: string;
  project_name: string; // Schema says project_name
  description?: string;
  project_url?: string; // Schema project_url
  start_date?: { month: number | string; year: number | string };
  end_date?: { month: number | string; year: number | string; is_ongoing?: boolean };
  contributors?: string[];
  skills_used?: string[];
  display_order?: number;
}

export interface Award {
  _id?: string;
  title: string;
  issuing_organization: string; // Schema
  issue_date: { month: number | string; year: number | string };
  description?: string;
  display_order?: number;
}

export interface Volunteer {
  _id?: string;
  organization: string;
  role: string;
  start_date: { month: number | string; year: number | string };
  end_date?: { month: number | string; year: number | string; is_current?: boolean };
  description?: string;
  display_order?: number;
}

export interface ProfileReview {
  id: string;
  type: 'endorsement' | 'recommendation' | 'testimonial';
  relationship: string;
  prompt_note?: string;
  reviewer_email?: string;
  reviewer_name?: string | null;
  reviewer_title?: string | null;
  reviewer_company?: string | null;
  rating?: number | null;
  review_text?: string;
  status: 'draft' | 'request_sent' | 'opened' | 'submitted' | 'approved' | 'rejected' | 'revoked' | 'expired' | 'archived';
  created_at?: string;
  invite_sent_at?: string;
  opened_at?: string;
  submitted_at?: string;
  approved_at?: string;
  archived_at?: string;
  expires_at?: string;
  last_accessed_at?: string;
  access_lock_until?: string;
  updated_at?: string;
}

// Navigation and UI types
export interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

export interface ActivityItem {
  id: string;
  event: string;
  application: string;
  subText: string;
  date: string;
  status: 'Active' | 'Pending' | 'Completed';
}

export interface ToolItem {
  title: string;
  description: string;
  icon: string;
  badge?: string;
  ready?: boolean;
  disabled?: boolean;
}
