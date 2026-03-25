import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

const { mockUseAuthStore } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn(
    (selector: (state: { user: { role: string } | null }) => unknown) =>
      selector({ user: null }),
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: mockUseAuthStore,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { Sidebar } from '@/components/layout/sidebar';

describe('Sidebar', () => {
  it('should render the DentiVerse logo/brand name', () => {
    render(<Sidebar />);
    expect(screen.getByText('DentiVerse')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cases')).toBeInTheDocument();
    expect(screen.getByText('Designers')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render links with correct href attributes', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(screen.getByText('Cases').closest('a')).toHaveAttribute('href', '/cases');
    expect(screen.getByText('Designers').closest('a')).toHaveAttribute(
      'href',
      '/designers',
    );
  });

  it('should have an accessible navigation landmark', () => {
    render(<Sidebar />);
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });

  it('should highlight the active link based on pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/cases');
    render(<Sidebar />);
    const casesLink = screen.getByText('Cases').closest('a');
    expect(casesLink).toHaveAttribute('data-active', 'true');
  });

  it('should show the admin link for admin users', () => {
    mockUseAuthStore.mockImplementation(
      (selector: (state: { user: { role: string } | null }) => unknown) =>
        selector({ user: { role: 'ADMIN' } }),
    );

    render(<Sidebar />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Admin').closest('a')).toHaveAttribute('href', '/admin');
  });

  it('should hide the admin link for non-admin users', () => {
    mockUseAuthStore.mockImplementation(
      (selector: (state: { user: { role: string } | null }) => unknown) =>
        selector({ user: { role: 'DENTIST' } }),
    );

    render(<Sidebar />);

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
