'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Palette,
  CreditCard,
  Bell,
  Settings,
  Send,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Cases', href: '/cases', icon: FileText },
  { label: 'Designers', href: '/designers', icon: Palette },
  { label: 'Proposals', href: '/proposals', icon: Send },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

/**
 * Main sidebar navigation for the dashboard.
 * Renders nav links with icons and highlights the active route.
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Sidebar navigation component
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('flex h-full flex-col', className)}>
      <div className="border-border flex h-16 items-center border-b px-6">
        <Link href="/" className="font-heading text-brand-600 text-lg font-bold">
          DentiVerse
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              data-active={isActive ? 'true' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { navItems };
export type { NavItem };
