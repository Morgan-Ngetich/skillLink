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

  /**
   * Sign up a new user with full name as metadata
   */
  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
      return { error };
    }

    const token = data.session?.access_token;
    if (token) {
      await fetchBackendUser(token);
    }

    return { data };
  }


    /**
   * Log in an existing user
   */
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return { error };
    }

    const token = data.session?.access_token;
    if (token) {
      await fetchBackendUser(token);
    }

    return { data };
  }

   /**
   * Log out the current user
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    setUser(null);
    OpenAPI.TOKEN = ''; // clear backend token
  }

    return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}