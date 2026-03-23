import { APP_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';

/**
 * Auth layout — centered card with no sidebar.
 * Used for login, register, forgot-password pages.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="text-muted-foreground mt-1 text-sm">Dental Design Marketplace</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
