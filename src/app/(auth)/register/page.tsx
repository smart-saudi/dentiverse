import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join DentiVerse as a dental professional or designer
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Registration form — coming in M1: Auth &amp; Users
        </div>
      </div>
    </main>
  );
}
