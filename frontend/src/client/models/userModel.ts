// type Roles = "superuser" | "loggeduser" | "mentor"

// user_id => UUID from supabase
export interface UserSyncIn {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

import type { User, UserIdentity } from '@supabase/supabase-js';
export type SupabaseUser = User;
export type Identity = UserIdentity;

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
  start_date?: string;  // ISO date string
  end_date?: string;    // ISO date string
}

export interface Experience {
  company: string;
  logo?: string;
  position?: string;
  description?: string;
  start_date?: string;  // ISO date string
  end_date?: string;    // ISO date string
}

export interface UserProfilePublic {
  user_id: number;
  uuid: string;
  bio?: string;
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
  bio?: string;
  contact_details?: { [key: string]: string };
  skills: string[],
  location?: string;
  goals?: string[]
  interests?: string[]
  experience?: Experience[];
  education?: Education[];
  area_of_focus?: string[]
  social_links?: { [key: string]: string };
}

export interface UserProfileUpdate {
  bio?: string;
  contact_details?: { [key: string]: string };
  skills: string[],
  location?: string;
  goals?: string[]
  interests?: string[]
  experience?: Experience[];
  education?: Education[];
  area_of_focus?: string[]
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
  avatar_url?: string
}


export interface MentorProfilePublic {
  user_id: number;
  uuid: string;
  industry?: string;
  expertise?: string[];
  experience_level?: string;
  available_times?: string[];
  currently_open_to_mentees: boolean;
  contact_details?: { [key: string]: string };
  is_mentor_profile_complete?: boolean;
  created_at: string;
  updated_at: string;
}


export interface MentorProfileCreate {
  user_id: number;
  industry?: string;
  expertise?: string[];
  experience_level?: string;
  available_times?: string[];
  currently_open_to_mentees?: boolean;
  contact_details?: { [key: string]: string };
}

export interface MentorProfileUpdate {
  industry?: string;
  expertise?: string[];
  experience_level?: string;
  available_times?: string[];
  currently_open_to_mentees?: boolean;
  contact_details?: { [key: string]: string };
}

/*

export interface UserPublic {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  is_superuser: boolean;
  is_mentor: boolean;
  is_mentee: boolean;

  // Shared user profile (for both mentees & mentors)
  profile?: UserProfilePublic;

  // Only present if the user is a mentor
  mentor_profile?: MentorProfilePublic;

  created_at?: string;
  updated_at?: string;
}

export interface UserProfilePublic {
  user_id: number;
  uuid: string;
  bio?: string;
  location?: string;
  goals?: string[];
  interests?: string[];
  area_of_focus?: string[];
  social_links?: { [key: string]: string };
  contact_details?: { [key: string]: string };
  is_profile_setup_complete?: boolean;
  is_profile_complete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MentorProfilePublic {
  user_id: number;
  uuid: string;

  // Mentor-specific fields
  title?: string;                        // e.g. "Product Manager · Startup Coach"
  industry?: string;                    // e.g. "Tech", "Finance"
  expertise?: string[];                 // e.g. ["Agile", "UX", "Startup Coaching"]
  skills?: string[];                    // optional extra — can mirror or extend expertise
  experience_level?: string;            // e.g. "Senior", "Mid-Level"
  available_times?: string[];           // time slots
  currently_open_to_mentees: boolean;
  rate?: string;                        // e.g. "Free", "$50/hr"
  rating?: number;
  reviews?: Reviews[];                // array of reviews
  sessions?: number;
  tags?: string[];                      // for badges, filters
  badges?: string[];            // e.g. ["Ex-Google", "Y Combinator Advisor"]
  cover_image_url?: string;
  is_mentor_profile_complete?: boolean;

  created_at: string;
  updated_at: string;
}

interface Reviews {
  rating: number;
  comment: string;
  reviewer: UserPublic;
  created_at: string;
}

*/