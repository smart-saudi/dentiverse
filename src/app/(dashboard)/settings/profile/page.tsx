import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile',
};

export default function ProfilePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Edit Profile</h1>
      <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
        Profile edit form — coming in M1: Auth &amp; Users
      </div>
    </div>
  );
}
