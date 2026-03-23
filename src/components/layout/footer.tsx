import { APP_NAME } from '@/lib/constants';

interface FooterProps {
  className?: string;
}

/**
 * Application footer with copyright notice.
 *
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Footer component
 */
export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={className} role="contentinfo">
      <div className="border-border border-t px-6 py-4">
        <p className="text-muted-foreground text-center text-sm">
          &copy; {year} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
