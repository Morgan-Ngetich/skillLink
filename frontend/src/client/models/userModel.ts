type Roles = "superuser" | "loggeduser" | "mentor"

export type UserPublic =  {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string;
  role: Roles
}

// user_id => UUID from supabase
export type UserSyncIn =  {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url?: string | null;
}

import type { User } from '@supabase/supabase-js';
export type SupabaseUser = User;