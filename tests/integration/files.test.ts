import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockAuth = {
  getUser: vi.fn(),
};

const mockCreateSignedUrl = vi.fn();
const mockStorageFrom = vi.fn().mockReturnValue({
  createSignedUrl: mockCreateSignedUrl,
});

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    storage: {
      from: mockStorageFrom,
    },
  })),
}));

const mockContext = {
  params: Promise.resolve({ bucket: 'design-files', filename: 'preview.stl' }),
};

describe('GET /api/v1/files/[bucket]/[filename]/signed-url', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a signed URL (200)', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://example.com/signed-url' },
      error: null,
    });

    const { GET } =
      await import('@/app/api/v1/files/[bucket]/[filename]/signed-url/route');
    const req = new NextRequest(
      'http://localhost:3000/api/v1/files/design-files/preview.stl/signed-url?expires_in=600',
      { method: 'GET' },
    );
    const res = await GET(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.signed_url).toBe('https://example.com/signed-url');
  });

  it('should reject invalid buckets (400)', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const { GET } =
      await import('@/app/api/v1/files/[bucket]/[filename]/signed-url/route');
    const req = new NextRequest(
      'http://localhost:3000/api/v1/files/invalid/preview.stl/signed-url',
      { method: 'GET' },
    );
    const res = await GET(req, {
      params: Promise.resolve({ bucket: 'invalid', filename: 'preview.stl' }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_ERROR');
  });
});
