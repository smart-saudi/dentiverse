import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | DentiVerse',
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — will be implemented in M0-7 */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="font-heading text-lg font-bold text-brand-600">
            DentiVerse
          </span>
        </div>
        <nav className="p-4">
          <p className="text-xs text-muted-foreground">Sidebar — M0-7</p>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header — will be implemented in M0-7 */}
        <header className="flex h-16 items-center border-b border-border px-6">
          <p className="text-sm text-muted-foreground">Header — M0-7</p>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
