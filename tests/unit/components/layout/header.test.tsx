import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

// Mock Supabase browser client for useRealtime
vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  })),
}));

// Mock fetch for NotificationBell's useNotifications hook
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 0 } }),
});

import { Header } from '@/components/layout/header';

describe('Header', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  it('should render the header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render the mobile menu trigger button', () => {
    render(<Header />);
    expect(
      screen.getByRole('button', { name: /toggle menu/i }),
    ).toBeInTheDocument();
  });

  it('should render a search input', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should render notification bell button', () => {
    render(<Header />);
    expect(
      screen.getByRole('button', { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it('should render user menu trigger', () => {
    render(<Header />);
    expect(
      screen.getByRole('button', { name: /user menu/i }),
    ).toBeInTheDocument();
  });
});
