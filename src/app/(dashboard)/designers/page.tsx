import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Designers',
};

export default function DesignersPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Find Designers</h1>
      <p className="mt-2 text-muted-foreground">
        Browse and search for dental design professionals.
      </p>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Designer marketplace — coming in M3: Designer Marketplace
      </div>
    </div>
  );
}
