import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { type Session } from '@supabase/supabase-js';

export function Session() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return session;
}

// use useSession for lightWork auth checkup.
export function useSession() {
  const session = Session(); // local
  const isLoading = session === undefined;
  const user = session?.user;

  return {
    session,
    user,
    isLoading,
    isAuthenticated: Boolean(user),
  };
}
