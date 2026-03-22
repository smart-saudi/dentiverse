import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Detail',
};

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Case #{id}</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Case detail view — coming in M2: Case Management
      </div>
    </div>
  );
}
