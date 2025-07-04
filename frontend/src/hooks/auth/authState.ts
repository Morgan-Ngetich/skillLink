import { supabase } from '../supabaseClient';

export async function isLoggedIn() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return Boolean(session?.user);
}

