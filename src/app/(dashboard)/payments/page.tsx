import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payments',
};

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Payment History</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Payment history — coming in M6: Payments &amp; Escrow
      </div>
    </div>
  );
}
