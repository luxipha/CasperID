
export interface UserProfile {
  wallet: string;
  human_id?: string;
  cns_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  headline?: string;
  profile_image_url?: string;
  cover_image_url?: string;
  city?: string;
  country?: string;
  website?: string;
  portfolio_links?: string[];
  about?: string;
  socials?: Record<string, string>;
  open_to_work?: boolean;
  industry?: string;
  seniority_level?: string;
  profile_completeness?: number;
  pronouns?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Experience {
  _id?: string;
  title: string;
  company: string;
  location?: string;
  start_date: { month: string; year: string };
  end_date?: { month: string; year: string } | null; // null if current
  current: boolean;
  description?: string;
  skills_used?: string[];
  display_order?: number;
}

export interface Education {
  _id?: string;
  school: string;
  degree: string;
  field_of_study?: string;
  start_date: { month: string; year: string };
  end_date?: { month: string; year: string };
  grade?: string;
  activities?: string;
  description?: string;
  display_order?: number;
}

export interface Certification {
  _id?: string;
  name: string;
  issuing_organization: string;
  issue_date: { month: string; year: string };
  expiration_date?: { month: string; year: string };
  credential_id?: string;
  credential_url?: string;
  display_order?: number;
}

export interface Skill {
  _id?: string;
  name: string;
  category?: string; // 'Technical', 'Soft', 'Language', etc.
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  is_top_skill?: boolean;
  endorsements?: number;
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
  name: string;
  description?: string;
  url?: string;
  start_date?: { month: string; year: string };
  end_date?: { month: string; year: string };
  contributors?: string[]; // List of user IDs or names
  skills_used?: string[];
  display_order?: number;
}

export interface Award {
  _id?: string;
  title: string;
  issuer: string;
  issue_date: { month: string; year: string };
  description?: string;
  display_order?: number;
}

export interface Volunteer {
  _id?: string;
  organization: string;
  role: string;
  start_date: { month: string; year: string };
  end_date?: { month: string; year: string };
  current?: boolean;
  description?: string;
  display_order?: number;
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
