'use client';

import { create } from 'zustand';

import type { Database } from '@/lib/database.types';

type UserRow = Database['public']['Tables']['users']['Row'];

interface AuthState {
  /** The currently authenticated user profile (from public.users). */
  user: UserRow | null;
  /** Whether the initial auth check has completed. */
  isLoaded: boolean;
  /** Set the authenticated user. */
  setUser: (user: UserRow | null) => void;
  /** Mark the initial auth check as complete. */
  setLoaded: () => void;
  /** Clear user state on logout. */
  clear: () => void;
}

/**
 * Client-side auth state. Holds the user profile row (not tokens or secrets).
 * Populated by the `useAuth` hook after the initial server-side check.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoaded: false,
  setUser: (user) => set({ user }),
  setLoaded: () => set({ isLoaded: true }),
  clear: () => set({ user: null, isLoaded: false }),
}));
