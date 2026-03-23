import type { Metadata } from 'next';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const dynamic = 'force-dynamic';

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
      {/* Sidebar — hidden on mobile, visible on lg+ */}
      <div className="border-border bg-card hidden w-64 shrink-0 border-r lg:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <Header />

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
