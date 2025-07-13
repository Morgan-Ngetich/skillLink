// type Roles = "superuser" | "loggeduser" | "mentor"

// user_id => UUID from supabase
export interface UserSyncIn {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

import type { User } from '@supabase/supabase-js';
export type SupabaseUser = User;

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

export interface UserProfilePublic {
  user_id: number;
  uuid: string;
  bio?: string;
  location?: string;
  goals?: string[];
  interests?: string[];
  area_of_focus?: string[];
  social_links?: { [key: string]: string };
  is_profile_complete?: boolean;
  created_at?: string;
  updated_at?: string;
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

export interface UserPublic {
  id: number;
  uuid: string;
  full_name: string;
  email: string;
  avatar_url?: string;
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