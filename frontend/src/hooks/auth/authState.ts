import { supabase } from '../supabaseClient';

export async function isLoggedIn() {
  const { data, error } = await supabase.auth.getUser();
  return Boolean(data?.user) && !error;
}
