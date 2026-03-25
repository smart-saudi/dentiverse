import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockReplace, mockSearchParams } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/admin'),
  useRouter: vi.fn(() => ({
    replace: mockReplace,
  })),
  useSearchParams: mockSearchParams,
}));

import { AdminPanel } from '@/components/admin/admin-panel';

describe('AdminPanel', () => {
  const mockFetch = vi.fn((input: string) => {
    if (input.startsWith('/api/v1/admin/dashboard')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            total_users: 12,
            suspended_users: 1,
            active_cases: 5,
            disputed_cases: 1,
            held_payments: 2,
            disputed_payments: 0,
            held_payment_value: 880,
            recent_audit_entries: [],
          },
        }),
      });
    }

    if (input.startsWith('/api/v1/admin/audit-log')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: [],
          meta: { page: 1, per_page: 20, total: 0, total_pages: 1 },
        }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({
        data: [],
        meta: { page: 1, per_page: 20, total: 0, total_pages: 1 },
      }),
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('should render the admin workspace tabs', () => {
    render(<AdminPanel />);

    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /cases/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /payments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /audit log/i })).toBeInTheDocument();
  });

  it('should honor the current tab from the URL query string', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('tab=audit-log'));

    render(<AdminPanel />);

    expect(screen.getByText('Audit log')).toBeInTheDocument();
    expect(screen.getByLabelText(/entity type/i)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
