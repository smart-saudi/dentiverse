'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getNavItems } from '@/components/layout/sidebar';

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile navigation drawer using Sheet component.
 * Displays the same nav items as Sidebar in a slide-out panel.
 *
 * @param props - Component props
 * @param props.open - Whether the sheet is open
 * @param props.onOpenChange - Callback when open state changes
 * @returns Mobile navigation sheet component
 */
export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const navItems = getNavItems(user?.role);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-border border-b px-6 py-4">
          <SheetTitle className="font-heading text-brand-600 text-lg font-bold">
            DentiVerse
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1 p-4" aria-label="Mobile navigation">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  );
}
