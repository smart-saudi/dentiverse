'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { Database } from '@/lib/database.types';

type UserRow = Database['public']['Tables']['users']['Row'];

/**
 * Client-side auth hook. Provides the current user, loading state,
 * and auth actions (login, register, logout, etc.).
 *
 * @returns Auth state and action methods
 */
export function useAuth() {
  const router = useRouter();
  const { user, isLoaded, setUser, setLoaded, clear } = useAuthStore();
  const supabase = createClient();

  // Fetch the user profile on mount
  useEffect(() => {
    if (isLoaded) return;

    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(data as UserRow | null);
      }

      setLoaded();
    }

    loadUser();
  }, [isLoaded, supabase, setUser, setLoaded]);

  // Listen for auth state changes (sign in / sign out in another tab)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        clear();
        router.push('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          setUser(data as UserRow | null);
        }
        setLoaded();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, clear, setUser, setLoaded, router]);

  const login = useCallback(
    async (email: string, password: string, redirectTo = '/dashboard') => {
      const safeRedirectTo =
        redirectTo.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : '/dashboard';

      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as {
        data?: {
          user: { id: string };
          access_token: string;
          refresh_token: string;
        };
        message?: string;
      };

      if (!response.ok || !body.data) {
        throw new Error(body.message ?? 'Login failed');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: body.data.access_token,
        refresh_token: body.data.refresh_token,
      });

      if (sessionError) {
        throw sessionError;
      }

      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', body.data.user.id)
          .single();

        setUser(profile as UserRow | null);
      } finally {
        setLoaded();
      }

      router.push(safeRedirectTo);
      router.refresh();
    },
    [router, setLoaded, setUser, supabase],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: 'DENTIST' | 'LAB' | 'DESIGNER',
    ) => {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message ?? 'Registration failed');
      }
      router.push('/login');
    },
    [router],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    clear();
    router.push('/login');
    router.refresh();
  }, [supabase, clear, router]);

  const forgotPassword = useCallback(async (email: string) => {
    const res = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message ?? 'Request failed');
    }
  }, []);

  return {
    user,
    isLoaded,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
  };
}
