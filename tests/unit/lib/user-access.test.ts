import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountDisabledError, ForbiddenError, UnauthorizedError } from '@/lib/errors';
import type { AppSupabaseClient } from '@/lib/supabase/types';
import {
  getAuthenticatedAdminContext,
  getAuthenticatedUserContext,
  getUserProfileById,
} from '@/lib/user-access';

function createMockClient() {
  const mockGetUser = vi.fn();
  const mockProfileSingle = vi.fn();

  return {
    client: {
      auth: {
        getUser: mockGetUser,
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: mockProfileSingle,
          })),
        })),
      })),
    } as unknown as AppSupabaseClient,
    mockGetUser,
    mockProfileSingle,
  };
}

describe('user access helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load a user profile by ID', async () => {
    const { client, mockProfileSingle } = createMockClient();
    mockProfileSingle.mockResolvedValue({
      data: { id: 'user-1', role: 'ADMIN', is_active: true },
      error: null,
    });

    const result = await getUserProfileById(client, 'user-1');

    expect(result.id).toBe('user-1');
  });

  it('should return authenticated user context for active users', async () => {
    const { client, mockGetUser, mockProfileSingle } = createMockClient();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'admin@test.com' } },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: { id: 'user-1', role: 'ADMIN', is_active: true },
      error: null,
    });

    const result = await getAuthenticatedUserContext(client);

    expect(result.authUser.id).toBe('user-1');
    expect(result.profile.role).toBe('ADMIN');
  });

  it('should reject unauthenticated requests', async () => {
    const { client, mockGetUser } = createMockClient();
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    await expect(getAuthenticatedUserContext(client)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('should reject inactive users', async () => {
    const { client, mockGetUser, mockProfileSingle } = createMockClient();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'admin@test.com' } },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: { id: 'user-1', role: 'ADMIN', is_active: false },
      error: null,
    });

    await expect(getAuthenticatedUserContext(client)).rejects.toBeInstanceOf(
      AccountDisabledError,
    );
  });

  it('should reject non-admin users from admin access', async () => {
    const { client, mockGetUser, mockProfileSingle } = createMockClient();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-2', email: 'dentist@test.com' } },
      error: null,
    });
    mockProfileSingle.mockResolvedValue({
      data: { id: 'user-2', role: 'DENTIST', is_active: true },
      error: null,
    });

    await expect(getAuthenticatedAdminContext(client)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
