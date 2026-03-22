import { APP_NAME } from '@/lib/constants';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-heading text-5xl font-bold tracking-tight text-brand-600">
          {APP_NAME}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The marketplace connecting dental professionals with expert digital designers.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/login"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}
