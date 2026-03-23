import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
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
      '/',
    );
    expect(screen.getByText('Cases').closest('a')).toHaveAttribute(
      'href',
      '/cases',
    );
    expect(screen.getByText('Designers').closest('a')).toHaveAttribute(
      'href',
      '/designers',
    );
  });

  it('should have an accessible navigation landmark', () => {
    render(<Sidebar />);
    expect(
      screen.getByRole('navigation', { name: /main/i }),
    ).toBeInTheDocument();
  });

  it('should highlight the active link based on pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/cases');
    render(<Sidebar />);
    const casesLink = screen.getByText('Cases').closest('a');
    expect(casesLink).toHaveAttribute('data-active', 'true');
  });
});
