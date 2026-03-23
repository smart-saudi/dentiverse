import Link from 'next/link';

import { Button } from '@/components/ui/button';

/**
 * Custom 404 page.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-bold">Page not found</h2>
        <p className="text-muted-foreground mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
