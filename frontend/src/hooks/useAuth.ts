import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { UserPublic } from '../client';
import { UserService, OpenAPI } from '../client';

export function useAuth() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchBackendUser(token: string) {
    try {
      OpenAPI.TOKEN = token; // set auth token globally for this session
      const data = await UserService.getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch backend user", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const token = session?.access_token;
      if (token) {
        await fetchBackendUser(token);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const token = session?.access_token;
      if (token) {
        await fetchBackendUser(token);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
