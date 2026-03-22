import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cases',
};

export default function CasesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Cases</h1>
        <a
          href="/cases/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          New Case
        </a>
      </div>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Case list — coming in M2: Case Management
      </div>
    </div>
  );
}
