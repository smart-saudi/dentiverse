'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Users, Wallet, Workflow } from 'lucide-react';

import { AdminAuditLogTab } from '@/components/admin/admin-audit-log-tab';
import { AdminCasesTab } from '@/components/admin/admin-cases-tab';
import { AdminOverviewTab } from '@/components/admin/admin-overview-tab';
import { AdminPaymentsTab } from '@/components/admin/admin-payments-tab';
import { AdminUsersTab } from '@/components/admin/admin-users-tab';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const adminTabValues = ['overview', 'users', 'cases', 'payments', 'audit-log'] as const;

type AdminTabValue = (typeof adminTabValues)[number];

const adminTabConfig: Record<
  AdminTabValue,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  overview: { label: 'Overview', icon: ShieldCheck },
  users: { label: 'Users', icon: Users },
  cases: { label: 'Cases', icon: Workflow },
  payments: { label: 'Payments', icon: Wallet },
  'audit-log': { label: 'Audit Log', icon: ShieldCheck },
};

/**
 * Validate a tab value coming from the URL.
 *
 * @param value - Candidate tab value
 * @returns True when the value matches a supported admin tab
 */
function isAdminTabValue(value: string | null): value is AdminTabValue {
  return value !== null && adminTabValues.includes(value as AdminTabValue);
}

/**
 * Main admin workspace with tabbed operational controls.
 *
 * @returns Tabbed admin control surface
 */
export function AdminPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTab = searchParams.get('tab');
  const activeTab: AdminTabValue = isAdminTabValue(searchTab) ? searchTab : 'overview';

  function handleTabChange(nextTab: string) {
    if (!isAdminTabValue(nextTab)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextTab === 'overview') {
      nextSearchParams.delete('tab');
    } else {
      nextSearchParams.set('tab', nextTab);
    }

    const query = nextSearchParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <Card className="border-brand-100 bg-brand-50/50">
        <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Launch operations workspace</p>
            <p className="text-muted-foreground text-sm">
              Every support, moderation, and payment action here is recorded in the audit
              log.
            </p>
          </div>
          <div className="text-muted-foreground text-sm">
            Use a ticket reference for every manual intervention.
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {adminTabValues.map((tabValue) => {
            const { label, icon: Icon } = adminTabConfig[tabValue];

            return (
              <TabsTrigger
                key={tabValue}
                value={tabValue}
                className="border-border data-[state=active]:border-brand-200 data-[state=active]:bg-brand-50 data-[state=active]:text-brand-700 h-10 border px-4"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="overview">
          <AdminOverviewTab />
        </TabsContent>
        <TabsContent value="users">
          <AdminUsersTab />
        </TabsContent>
        <TabsContent value="cases">
          <AdminCasesTab />
        </TabsContent>
        <TabsContent value="payments">
          <AdminPaymentsTab />
        </TabsContent>
        <TabsContent value="audit-log">
          <AdminAuditLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
