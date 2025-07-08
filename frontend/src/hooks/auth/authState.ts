import { supabase } from '../supabaseClient';
import { OpenAPI } from '@/client';
import {type SupabaseUser, UserService } from '@/client';

export async function isLoggedIn() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return Boolean(session?.user);
}

// This is used to set the OPENAPI client token before syncing the user
export const setApiToken = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("No access token available");
  OpenAPI.TOKEN = token;
};


export const syncUserToBackend = async (user: SupabaseUser) => {
    const { id: user_id, email, user_metadata } = user;

    if (!email) {
      throw new Error("User email is undefined");
    }

    const full_name = user_metadata?.full_name ?? email.split("@")[0];
    const avatar_url = user_metadata?.avatar_url ?? undefined;

    await UserService.syncUserFromSupabase({
      user_id,
      email,
      full_name,
      avatar_url,
    });
  };