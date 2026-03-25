import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const { mockLogout, mockUseAuth } = vi.hoisted(() => {
  const mockLogout = vi.fn();
  const mockUseAuth = vi.fn();

  return {
    mockLogout,
    mockUseAuth,
  };
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({
    children,
    asChild,
    onSelect,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    onSelect?: (event: { preventDefault: () => void }) => void;
  }) =>
    asChild ? (
      <>{children}</>
    ) : (
      <button
        type="button"
        onClick={() =>
          onSelect?.({
            preventDefault: () => undefined,
          })
        }
      >
        {children}
      </button>
    ),
}));

vi.mock('@/components/layout/notification-bell', () => ({
  NotificationBell: () => <button aria-label="Notifications">Notifications</button>,
}));

// Mock Supabase browser client for useRealtime
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
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
  json: () =>
    Promise.resolve({
      data: [],
      meta: { page: 1, per_page: 20, total: 0, total_pages: 0 },
    }),
});

import { Header } from '@/components/layout/header';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    mockUseAuth.mockReturnValue({
      user: null,
      isLoaded: true,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      forgotPassword: vi.fn(),
    });
  });

  it('should render the header element', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render the mobile menu trigger button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
  });

  it('should render a search input', () => {
    render(<Header />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should render notification bell button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('should render user menu trigger', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
  });

  it('should show admin navigation and allow logout for admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'ADMIN' },
      isLoaded: true,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: mockLogout,
      forgotPassword: vi.fn(),
    });

    render(<Header />);

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Log out'));

    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
