import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Messages',
};

interface CaseMessagesPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseMessagesPage({ params }: CaseMessagesPageProps) {
  const { id } = await params;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Messages — Case #{id}</h1>
      <div className="border-border bg-card text-muted-foreground mt-6 rounded-lg border p-12 text-center">
        Messaging UI — coming in M7: Messaging &amp; Notifications
      </div>
    </div>
  );
}
