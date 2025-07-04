type Roles = "superuser" | "loggeduser" | "mentor"

export type UserPublic =  {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string;
  role: Roles
}

export type UserSyncIn =  {
  user_uuid: string;
  email: string;
  full_name: string | null;
  avatar_url?: string;
}

import type { User } from '@supabase/supabase-js';
export type SupabaseUser = User;