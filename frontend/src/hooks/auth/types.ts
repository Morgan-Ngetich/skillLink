import type { User, UserIdentity } from '@supabase/supabase-js';
export type SupabaseUser = User;
export type Identity = UserIdentity;

export type GoogleUserInfo = {
  name: string;
  email: string;
  avatar_url?: string;
}
