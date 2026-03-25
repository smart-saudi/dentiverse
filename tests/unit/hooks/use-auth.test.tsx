import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/auth-store';

const {
  mockPush,
  mockRefresh,
  mockGetUser,
  mockOnAuthStateChange,
  mockSetSession,
  mockSignOut,
  mockSingle,
  mockFrom,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockGetUser: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSetSession: vi.fn(),
  mockSignOut: vi.fn(),
  mockSingle: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      setSession: mockSetSession,
      signOut: mockSignOut,
    },
    from: mockFrom,
  })),
}));

import { useAuth } from '@/hooks/use-auth';

describe('useAuth', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clear();
    vi.stubGlobal('fetch', mockFetch);

    mockGetUser.mockResolvedValue({
      data: { user: null },
    });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
    mockSetSession.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockSingle.mockResolvedValue({
      data: {
        id: 'admin-1',
        full_name: 'Ops Admin',
        email: 'ops@test.com',
        role: 'ADMIN',
      },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSingle,
        })),
      })),
    });
  });

  it('should log in through the auth API and honor redirectTo', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: { id: 'admin-1' },
          access_token: 'access-123',
          refresh_token: 'refresh-123',
        },
      }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    await act(async () => {
      await result.current.login('ops@test.com', 'SecureP@ss1', '/admin');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'access-123',
      refresh_token: 'refresh-123',
    });
    expect(useAuthStore.getState().user).toMatchObject({
      id: 'admin-1',
      role: 'ADMIN',
    });
    expect(mockPush).toHaveBeenCalledWith('/admin');
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it('should surface login API errors without setting a session', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'This account has been deactivated. Contact support.',
      }),
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });

    await expect(
      result.current.login('ops@test.com', 'SecureP@ss1', '/admin'),
    ).rejects.toThrow('This account has been deactivated. Contact support.');

    expect(mockSetSession).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
