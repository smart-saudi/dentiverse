import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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
});
