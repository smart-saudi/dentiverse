import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your DentiVerse account
          </p>
        </div>
        {/* Auth form will be implemented in M1 */}
        <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Login form — coming in M1: Auth &amp; Users
        </div>
      </div>
    </main>
  );
}
