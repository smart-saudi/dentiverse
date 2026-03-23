import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

import { Header } from '@/components/layout/header';

describe('Header', () => {
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
