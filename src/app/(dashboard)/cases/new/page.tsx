import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Case',
};

export default function NewCasePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Create New Case</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Case creation form — coming in M2: Case Management
      </div>
    </div>
  );
}
