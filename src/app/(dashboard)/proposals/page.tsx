import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Proposals',
};

export default function ProposalsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">My Proposals</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Proposals list — coming in M4: Proposals &amp; Matching
      </div>
    </div>
  );
}
