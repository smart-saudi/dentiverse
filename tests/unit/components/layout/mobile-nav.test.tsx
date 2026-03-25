import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mockUseAuthStore } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn(
    (selector: (state: { user: { role: string } | null }) => unknown) =>
      selector({ user: null }),
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
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

import { MobileNav } from '@/components/layout/mobile-nav';

describe('MobileNav', () => {
  it('should render navigation links when open', () => {
    render(<MobileNav open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cases')).toBeInTheDocument();
    expect(screen.getByText('Designers')).toBeInTheDocument();
  });

  it('should render the DentiVerse brand name', () => {
    render(<MobileNav open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText('DentiVerse')).toBeInTheDocument();
  });

  it('should call onOpenChange when a link is clicked', async () => {
    const onOpenChange = vi.fn();
    render(<MobileNav open={true} onOpenChange={onOpenChange} />);
    const dashboardLink = screen.getByText('Dashboard');
    dashboardLink.click();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show the admin link for admin users', () => {
    mockUseAuthStore.mockImplementation(
      (selector: (state: { user: { role: string } | null }) => unknown) =>
        selector({ user: { role: 'ADMIN' } }),
    );

    render(<MobileNav open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should hide the admin link for non-admin users', () => {
    mockUseAuthStore.mockImplementation(
      (selector: (state: { user: { role: string } | null }) => unknown) =>
        selector({ user: { role: 'LAB' } }),
    );

    render(<MobileNav open={true} onOpenChange={vi.fn()} />);

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
