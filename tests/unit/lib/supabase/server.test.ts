import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    getAll: vi.fn(() => []),
    set: vi.fn(),
  })),
}));

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  })),
}));

describe('Supabase Server Client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should export a createServerSupabaseClient function', async () => {
    const { createServerSupabaseClient } = await import(
      '@/lib/supabase/server'
    );
    expect(createServerSupabaseClient).toBeDefined();
    expect(typeof createServerSupabaseClient).toBe('function');
  });

  it('should return a Supabase client instance', async () => {
    const { createServerSupabaseClient } = await import(
      '@/lib/supabase/server'
    );
    const client = await createServerSupabaseClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });

  it('should call createServerClient from @supabase/ssr', async () => {
    const { createServerClient } = await import('@supabase/ssr');
    const { createServerSupabaseClient } = await import(
      '@/lib/supabase/server'
    );
    await createServerSupabaseClient();
    expect(createServerClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        cookies: expect.any(Object),
      }),
    );
  });
});
