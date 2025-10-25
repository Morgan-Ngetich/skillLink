// ========== USER TYPES ==========
export interface UserSyncIn {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface UserCreate {
  full_name: string;
  email: string;
  password: string;
  is_active: boolean;
}

export interface UserUpdate {
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean;
  email?: string;
}

export interface Education {
  institution: string;
  logo?: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
}

export interface Experience {
  company: string;
  logo?: string;
  position?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface UserProfilePublic {
  user_id: number;
  uuid: string;
  title?: string;
  about?: string;
  location?: string;
  goals?: string[];
  education?: Education[];
  experience?: Experience[];
  skills?: string[];
  contact_details?: { [key: string]: string };
  interests?: string[];
  area_of_focus?: string[];
  social_links?: { [key: string]: string };
  is_profile_setup_complete?: boolean;
  is_profile_complete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileCreate {
  title?: string;
  about?: string;
  contact_details?: { [key: string]: string };
  skills?: string[];
  location?: string;
  goals?: string[];
  interests?: string[];
  experience?: Experience[];
  education?: Education[];
  area_of_focus?: string[];
  social_links?: { [key: string]: string };
}

export interface UserProfileUpdate {
  title?: string;
  about?: string;
  contact_details?: { [key: string]: string };
  skills?: string[];
  location?: string;
  goals?: string[];
  interests?: string[];
  experience?: Experience[];
  education?: Education[];
  area_of_focus?: string[];
  social_links?: { [key: string]: string };
}

export interface UserPublic {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  cover_image?: string;
  is_superuser: boolean;
  is_mentor: boolean;
  is_mentee: boolean;
  profile?: UserProfilePublic;
  mentor_profile?: MentorProfilePublic;
  created_at?: string;
  updated_at?: string;
}

export interface UsersPublic {
  data: UserPublic[];
  count: number;
}

export type GoogleUserInfo = {
  name: string;
  email: string;
  avatar_url?: string;
}

// ========== MENTOR PROFILE TYPES ==========

export interface PricingInfo {
  [duration: string]: number | string | undefined // e.g., { "30min": 50, "60min": 100 }
  currency?: string;
}

// type PricingInfo = Record<string, number> & { currency?: string };


export interface WeeklySchedule {
  [day: string]: Array<{
    start: string; // e.g., "09:00"
    end: string;   // e.g., "17:00"
  }>;
}

export const ExperienceLevel = {
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
}

export const MentorApproach = {
  CAREER_COACH: 'career_coach',
  TECHNICAL_MENTOR: 'technical_mentor',
  INDUSTRY_EXPERT: 'industry_expert',
  LEADERSHIP_COACH: 'leadership_coach',
  ENTREPRENEUR: 'entrepreneur',
}

export const SessionApproach = {
  ONE_ON_ONE: '1-on-1 Video Call',
  CODE_REVIEW: 'Code Review',
  RESUME_REVIEW: 'Resume Review',
  MOCK_INTERVIEW: 'Mock Interview',
  CAREER_ADVICE: 'Career Advice',
  PORTFOLIO_REVIEW: 'Portfolio Review',
}

type ExperienceLevelType = typeof ExperienceLevel[keyof typeof ExperienceLevel];
type MentorType = typeof MentorApproach[keyof typeof MentorApproach];
type SessionType = typeof SessionApproach[keyof typeof SessionApproach];

// Base Mentor Profile
export interface MentorProfileBase {
  user_id: number;
  title: string;
  industries: string[];
  expertise: string[];
  experience_level: ExperienceLevelType | string;
  mentor_type?: MentorType[] | string[];
  tags?: string[];
  badges?: string[];
}


// Update Mentor Profile (for PATCH requests - all optional)
export interface MentorProfileUpdate {
  title?: string;
  industries?: string[];
  expertise?: string[];
  experience_level?: ExperienceLevelType | string;
  mentor_type?: MentorType[] | string[];
  tags?: string[];
  badges?: string[];
}

// Public Mentor Profile (returned from API)
export interface MentorProfilePublic extends MentorProfileBase {
  total_sessions: number;
  total_mentees: number;
  average_rating: number | null;
  currently_open_to_mentees?: boolean;
  created_at: string;
  updated_at: string;

  sessions: MentorSessionPublic[]
  services: MentorServicePublic[]
  settings?: MentorSettingsPublic[]
}

// Mentor Session Types
export interface MentorSessionBase {
  mentor_id: number;
  title: string;
  description?: string;
  session_type: SessionType | string;
  duration_minutes: number;
  price_usd?: number;
  tags?: string[];
}



export interface MentorSessionUpdate {
  title?: string;
  description?: string;
  session_type?: SessionType | string;
  duration_minutes?: number;
  price_usd?: number;
  is_active?: boolean;
  max_bookings_per_week?: number;
  tags?: string[];
}

export interface MentorSessionPublic extends MentorSessionBase {
  id: number;
  uuid: string;
  is_active: boolean;
  max_bookings_per_week?: number;
  created_at: string;
  updated_at: string;
}

// Mentor Service Types
export interface MentorServiceBase {
  mentor_id: number;
  title: string;
  description?: string;
  banner_url?: string;
  price_usd?: number;
  estimated_duration_minutes?: number;
  category?: string;
  highlights?: string[];
}


export interface MentorServiceUpdate {
  title?: string;
  description?: string;
  price_usd?: number;
  estimated_duration_minutes?: number;
  category?: string;
  highlights?: string[];
  is_active?: boolean;
}

export interface MentorServicePublic extends MentorServiceBase {
  id: number;
  uuid: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mentor Settings Types
export interface MentorSettingsBase {
  mentor_id: number;
  currently_open_to_mentees: boolean;
  profile_visibility: boolean;
  auto_accept_bookings: boolean;
  require_intro_message: boolean;
  timezone?: string;
  available_times?: string[];
  weekly_schedule?: WeeklySchedule;
  booking_buffer_hours: number;
  session_gap_minutes: number;
  max_mentees?: number;
  mentorship_philosophy?: string;
  ideal_mentee_description?: string;
  communication_style?: string[];
  response_time_hours: number;
}


export interface MentorSettingsUpdate {
  currently_open_to_mentees?: boolean;
  profile_visibility?: boolean;
  auto_accept_bookings?: boolean;
  require_intro_message?: boolean;
  timezone?: string;
  available_times?: string[];
  weekly_schedule?: WeeklySchedule;
  booking_buffer_hours?: number;
  session_gap_minutes?: number;
  max_mentees?: number;
  mentorship_philosophy?: string;
  ideal_mentee_description?: string;
  communication_style?: string[];
  response_time_hours?: number;
}

export interface MentorSettingsPublic extends MentorSettingsBase {
  created_at: string;
  updated_at: string;
}

// ========== API RESPONSE TYPES ==========

export interface ProfileCompletionStatus {
  is_complete: boolean;
  is_setup_complete: boolean;
  completion_percentage: number;
  missing_fields: Array<{
    field: string;
    label: string;
    step: string;
  }>;
  completed_count: number;
  total_fields: number;
}

export interface MentorStats {
  total_sessions: number;
  total_mentees: number;
  average_rating?: number | null;
  completion_percentage: number;
  is_complete: boolean;
}


/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface MentorProfileCreate extends MentorProfileBase { }
export interface MentorSessionCreate extends MentorSessionBase { }
export interface MentorServiceCreate extends MentorServiceBase { }
export interface MentorSettingsCreate extends MentorSettingsBase { }

/* eslint-enable @typescript-eslint/no-empty-object-type */

// ========== SUPABASE TYPES ==========
import type { User, UserIdentity } from '@supabase/supabase-js';
export type SupabaseUser = User;
export type Identity = UserIdentity;