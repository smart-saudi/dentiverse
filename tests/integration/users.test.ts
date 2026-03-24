import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockAuth = {
  getUser: vi.fn(),
};

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: mockFrom,
  })),
}));

describe('User API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/users/me/dashboard', () => {
    it('should return dashboard statistics (200)', async () => {
      let caseCallCount = 0;
      let paymentCallCount = 0;

      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === 'cases') {
          caseCallCount += 1;

          if (caseCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                or: vi.fn().mockReturnValue({
                  in: vi.fn().mockResolvedValue({ count: 2 }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 1 }),
              }),
            }),
          };
        }

        if (table === 'proposals') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 3 }),
              }),
            }),
          };
        }

        if (table === 'payments') {
          paymentCallCount += 1;

          if (paymentCallCount === 1) {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  in: vi.fn().mockResolvedValue({
                    data: [{ amount: 100 }, { amount: 50 }],
                  }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ designer_payout: 88 }],
                }),
              }),
            }),
          };
        }

        if (table === 'reviews') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ overall_rating: 4 }, { overall_rating: 5 }],
              }),
            }),
          };
        }

        if (table === 'messages') {
          return {
            select: vi.fn().mockReturnValue({
              neq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ count: 4 }),
              }),
            }),
          };
        }

        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 5 }),
            }),
          }),
        };
      });

      const { GET } = await import('@/app/api/v1/users/me/dashboard/route');
      const res = await GET();
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.active_cases).toBe(2);
      expect(json.data.completed_cases).toBe(1);
      expect(json.data.pending_proposals).toBe(3);
      expect(json.data.total_spent).toBe(150);
      expect(json.data.total_earned).toBe(88);
      expect(json.data.avg_rating).toBe(4.5);
      expect(json.data.unread_messages).toBe(4);
      expect(json.data.unread_notifications).toBe(5);
    });
  });

  describe('GET /api/v1/users/[id]', () => {
    it('should return a public user profile (200)', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'user-2',
          full_name: 'Dr. Sarah Chen',
          avatar_url: null,
          role: 'DESIGNER',
          created_at: '2026-03-24T00:00:00Z',
        },
        error: null,
      });

      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      mockFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ single: mockSingle }),
        }),
      }));

      const { GET } = await import('@/app/api/v1/users/[id]/route');
      const req = new NextRequest('http://localhost:3000/api/v1/users/user-2', {
        method: 'GET',
      });
      const res = await GET(req, { params: Promise.resolve({ id: 'user-2' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.id).toBe('user-2');
      expect(json.data.full_name).toBe('Dr. Sarah Chen');
    });

    it('should return 401 for unauthenticated users', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No session' },
      });

      const { GET } = await import('@/app/api/v1/users/[id]/route');
      const req = new NextRequest('http://localhost:3000/api/v1/users/user-2', {
        method: 'GET',
      });
      const res = await GET(req, { params: Promise.resolve({ id: 'user-2' }) });

      expect(res.status).toBe(401);
    });
  });
});
