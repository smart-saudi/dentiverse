import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Designer Profile',
};

interface DesignerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function DesignerProfilePage({ params }: DesignerProfilePageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Designer #{id}</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Designer profile — coming in M3: Designer Marketplace
      </div>
    </div>
  );
}
