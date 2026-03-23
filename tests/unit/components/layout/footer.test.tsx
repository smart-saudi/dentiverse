import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Footer } from '@/components/layout/footer';

describe('Footer', () => {
  it('should render the footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should display the copyright text with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('should display the DentiVerse brand name', () => {
    render(<Footer />);
    expect(screen.getByText(/DentiVerse/)).toBeInTheDocument();
  });
});
