import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @supabase/ssr before importing
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  })),
}));

describe('Supabase Browser Client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should export a createClient function', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    expect(createClient).toBeDefined();
    expect(typeof createClient).toBe('function');
  });

  it('should return a Supabase client instance', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.from).toBeDefined();
  });

  it('should call createBrowserClient with env variables', async () => {
    const { createBrowserClient } = await import('@supabase/ssr');
    const { createClient } = await import('@/lib/supabase/client');
    createClient();
    expect(createBrowserClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
  });
});
