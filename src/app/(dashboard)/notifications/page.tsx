import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Notifications</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Notification center — coming in M7: Messaging &amp; Notifications
      </div>
    </div>
  );
}
