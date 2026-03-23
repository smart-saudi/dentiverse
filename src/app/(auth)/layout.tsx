import { APP_NAME } from '@/lib/constants';

/**
 * Auth layout — centered card with no sidebar.
 * Used for login, register, forgot-password pages.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dental Design Marketplace
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
