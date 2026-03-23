import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { admin: { listUsers: vi.fn() } },
    from: vi.fn(),
  })),
}));

describe('Supabase Admin Client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should export a createAdminClient function', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    expect(createAdminClient).toBeDefined();
    expect(typeof createAdminClient).toBe('function');
  });

  it('should return a Supabase admin client instance', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const client = createAdminClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });

  it('should call createClient with service role key', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { createAdminClient } = await import('@/lib/supabase/admin');
    createAdminClient();
    expect(createClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: false,
          persistSession: false,
        }),
      }),
    );
  });
});
