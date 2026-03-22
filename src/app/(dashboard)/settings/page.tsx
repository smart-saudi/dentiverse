import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        General settings — coming in M1: Auth &amp; Users
      </div>
    </div>
  );
}
