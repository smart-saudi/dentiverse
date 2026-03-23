import { Badge } from '@/components/ui/badge';
import type { Database } from '@/lib/database.types';

type CaseStatus = Database['public']['Enums']['case_status'];

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  OPEN: { label: 'Open', variant: 'default' },
  ASSIGNED: { label: 'Assigned', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  REVIEW: { label: 'In Review', variant: 'warning' },
  REVISION: { label: 'Revision', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  DISPUTED: { label: 'Disputed', variant: 'destructive' },
};

interface CaseStatusBadgeProps {
  status: CaseStatus;
}

/**
 * Colored badge displaying a case's current status.
 *
 * @param props - Component props
 * @param props.status - The case status enum value
 * @returns A styled Badge component
 */
export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
