import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function initSupabase(): SupabaseClient | null {
  // Don't create on server
  if (typeof window === 'undefined') {
    return null;
  }

  // Create once on client
  if (!supabaseInstance) {
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    if (!url || !key) {
      console.error('Missing Supabase credentials');
      return null;
    }

    supabaseInstance = createClient(url, key);
  }

  return supabaseInstance;
}

// Export getter function instead of instance
export function getSupabase(): SupabaseClient {
  const client = initSupabase();
  if (!client) {
    throw new Error('Supabase is only available on client-side');
  }
  return client;
}

// Use Proxy for full backwards compatibility with proper typing
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    // Bind methods to maintain proper 'this' context
    return typeof value === 'function' ? value.bind(client) : value;
  }
});