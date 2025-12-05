import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useSupabaseSessionReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(() => setReady(true));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => setReady(true));
    return () => subscription.unsubscribe();
  }, []);

  return ready;
}
