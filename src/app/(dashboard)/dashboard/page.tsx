import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome to DentiVerse. Your overview will appear here.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(['Active Cases', 'Pending Proposals', 'Completed', 'Earnings'] as const).map(
          (label) => (
            <div key={label} className="border-border bg-card rounded-lg border p-6">
              <p className="text-muted-foreground text-sm">{label}</p>
              <p className="mt-2 text-2xl font-bold">-</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
