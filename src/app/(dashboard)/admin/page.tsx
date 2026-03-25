import { AdminPanel } from '@/components/admin/admin-panel';

/**
 * Admin workspace landing page.
 *
 * @returns The admin operations surface
 */
export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground max-w-3xl text-sm sm:text-base">
          Manage launch-critical support, moderation, dispute handling, refunds, and audit
          visibility from one operational workspace.
        </p>
      </div>

      <AdminPanel />
    </div>
  );
}
