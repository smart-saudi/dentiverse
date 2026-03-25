import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockLogin, mockSearchParams } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: mockSearchParams,
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoaded: true,
    isAuthenticated: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
  })),
}));

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('should show the disabled-account message when redirected from middleware', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('disabled=1'));

    render(<LoginPage />);

    expect(screen.getByText(/this account has been deactivated/i)).toBeInTheDocument();
  });

  it('should submit the validated redirect target to the auth hook', async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('redirectTo=%2Fadmin'));

    render(<LoginPage />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'ops@test.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'SecureP@ss1' },
      });
      fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!);
    });

    expect(mockLogin).toHaveBeenCalledWith('ops@test.com', 'SecureP@ss1', '/admin');
  });
});
