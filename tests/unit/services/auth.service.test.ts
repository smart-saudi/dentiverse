import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthService } from '@/services/auth.service';

// ---------------------------------------------------------------------------
// Helpers — build a fake Supabase client with chainable auth methods
// ---------------------------------------------------------------------------

function createMockSupabaseClient(overrides: {
  signUp?: ReturnType<typeof vi.fn>;
  signInWithPassword?: ReturnType<typeof vi.fn>;
  signOut?: ReturnType<typeof vi.fn>;
  resetPasswordForEmail?: ReturnType<typeof vi.fn>;
  updateUser?: ReturnType<typeof vi.fn>;
  getUser?: ReturnType<typeof vi.fn>;
} = {}) {
  return {
    auth: {
      signUp: overrides.signUp ?? vi.fn(),
      signInWithPassword: overrides.signInWithPassword ?? vi.fn(),
      signOut: overrides.signOut ?? vi.fn(),
      resetPasswordForEmail: overrides.resetPasswordForEmail ?? vi.fn(),
      updateUser: overrides.updateUser ?? vi.fn(),
      getUser: overrides.getUser ?? vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  } as unknown as Parameters<typeof AuthService.prototype.register>[0] extends never
    ? never
    : ReturnType<typeof import('@/lib/supabase/server').createServerSupabaseClient> extends Promise<infer C>
      ? C
      : never;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  // ---- register -----------------------------------------------------------
  describe('register', () => {
    it('should call supabase.auth.signUp with email, password, and metadata', async () => {
      const signUp = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'dentist@example.com' },
          session: { access_token: 'token' },
        },
        error: null,
      });

      const fromInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'user-1',
              email: 'dentist@example.com',
              full_name: 'Dr. Sarah Chen',
              role: 'DENTIST',
            },
            error: null,
          }),
        }),
      });

      const mockClient = createMockSupabaseClient({ signUp }) as any;
      mockClient.from = vi.fn().mockReturnValue({
        insert: fromInsert,
        select: vi.fn(),
      });

      const result = await service.register(mockClient, {
        email: 'dentist@example.com',
        password: 'SecureP@ss1',
        full_name: 'Dr. Sarah Chen',
        role: 'DENTIST',
      });

      expect(signUp).toHaveBeenCalledWith({
        email: 'dentist@example.com',
        password: 'SecureP@ss1',
        options: {
          data: {
            full_name: 'Dr. Sarah Chen',
            role: 'DENTIST',
          },
        },
      });
      expect(result.user).toBeDefined();
      expect(result.user!.email).toBe('dentist@example.com');
    });

    it('should throw when supabase signUp returns an error', async () => {
      const signUp = vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', status: 400 },
      });

      const mockClient = createMockSupabaseClient({ signUp }) as any;

      await expect(
        service.register(mockClient, {
          email: 'existing@example.com',
          password: 'SecureP@ss1',
          full_name: 'Test User',
          role: 'DENTIST',
        }),
      ).rejects.toThrow('User already registered');
    });

    it('should insert a row into the users table after signup', async () => {
      const signUp = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'lab@example.com' },
          session: { access_token: 'token' },
        },
        error: null,
      });

      const singleFn = vi.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          email: 'lab@example.com',
          full_name: 'Lab Tech',
          role: 'LAB',
        },
        error: null,
      });
      const selectFn = vi.fn().mockReturnValue({ single: singleFn });
      const insertFn = vi.fn().mockReturnValue({ select: selectFn });
      const fromFn = vi.fn().mockReturnValue({ insert: insertFn });

      const mockClient = createMockSupabaseClient({ signUp }) as any;
      mockClient.from = fromFn;

      await service.register(mockClient, {
        email: 'lab@example.com',
        password: 'SecureP@ss1',
        full_name: 'Lab Tech',
        role: 'LAB',
      });

      expect(fromFn).toHaveBeenCalledWith('users');
      expect(insertFn).toHaveBeenCalledWith({
        id: 'user-1',
        email: 'lab@example.com',
        full_name: 'Lab Tech',
        role: 'LAB',
      });
    });
  });

  // ---- login --------------------------------------------------------------
  describe('login', () => {
    it('should call supabase.auth.signInWithPassword', async () => {
      const signInWithPassword = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'dentist@example.com' },
          session: { access_token: 'token' },
        },
        error: null,
      });

      const mockClient = createMockSupabaseClient({ signInWithPassword }) as any;

      const result = await service.login(mockClient, {
        email: 'dentist@example.com',
        password: 'SecureP@ss1',
      });

      expect(signInWithPassword).toHaveBeenCalledWith({
        email: 'dentist@example.com',
        password: 'SecureP@ss1',
      });
      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should throw when credentials are invalid', async () => {
      const signInWithPassword = vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      });

      const mockClient = createMockSupabaseClient({ signInWithPassword }) as any;

      await expect(
        service.login(mockClient, {
          email: 'wrong@example.com',
          password: 'badpassword',
        }),
      ).rejects.toThrow('Invalid login credentials');
    });
  });

  // ---- logout -------------------------------------------------------------
  describe('logout', () => {
    it('should call supabase.auth.signOut', async () => {
      const signOut = vi.fn().mockResolvedValue({ error: null });
      const mockClient = createMockSupabaseClient({ signOut }) as any;

      await service.logout(mockClient);

      expect(signOut).toHaveBeenCalled();
    });

    it('should throw when signOut returns an error', async () => {
      const signOut = vi.fn().mockResolvedValue({
        error: { message: 'Sign out failed' },
      });
      const mockClient = createMockSupabaseClient({ signOut }) as any;

      await expect(service.logout(mockClient)).rejects.toThrow('Sign out failed');
    });
  });

  // ---- forgotPassword -----------------------------------------------------
  describe('forgotPassword', () => {
    it('should call supabase.auth.resetPasswordForEmail', async () => {
      const resetPasswordForEmail = vi.fn().mockResolvedValue({
        data: {},
        error: null,
      });
      const mockClient = createMockSupabaseClient({ resetPasswordForEmail }) as any;

      await service.forgotPassword(mockClient, { email: 'user@example.com' });

      expect(resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
        redirectTo: expect.stringContaining('/reset-password'),
      });
    });

    it('should not throw even if email does not exist (security)', async () => {
      const resetPasswordForEmail = vi.fn().mockResolvedValue({
        data: {},
        error: null,
      });
      const mockClient = createMockSupabaseClient({ resetPasswordForEmail }) as any;

      await expect(
        service.forgotPassword(mockClient, { email: 'nonexistent@example.com' }),
      ).resolves.not.toThrow();
    });
  });

  // ---- resetPassword ------------------------------------------------------
  describe('resetPassword', () => {
    it('should call supabase.auth.updateUser with new password', async () => {
      const updateUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      const mockClient = createMockSupabaseClient({ updateUser }) as any;

      await service.resetPassword(mockClient, {
        password: 'NewSecure1!',
      });

      expect(updateUser).toHaveBeenCalledWith({ password: 'NewSecure1!' });
    });

    it('should throw when updateUser returns an error', async () => {
      const updateUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });
      const mockClient = createMockSupabaseClient({ updateUser }) as any;

      await expect(
        service.resetPassword(mockClient, { password: 'NewSecure1!' }),
      ).rejects.toThrow('Token expired');
    });
  });

  // ---- getCurrentUser -----------------------------------------------------
  describe('getCurrentUser', () => {
    it('should return the authenticated user', async () => {
      const getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'dentist@example.com' } },
        error: null,
      });
      const mockClient = createMockSupabaseClient({ getUser }) as any;

      const user = await service.getCurrentUser(mockClient);

      expect(getUser).toHaveBeenCalled();
      expect(user).toBeDefined();
      expect(user!.id).toBe('user-1');
    });

    it('should return null when no user is authenticated', async () => {
      const getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      });
      const mockClient = createMockSupabaseClient({ getUser }) as any;

      const user = await service.getCurrentUser(mockClient);

      expect(user).toBeNull();
    });

    it('should throw when getUser returns an error', async () => {
      const getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired' },
      });
      const mockClient = createMockSupabaseClient({ getUser }) as any;

      await expect(service.getCurrentUser(mockClient)).rejects.toThrow('Session expired');
    });
  });
});
