import { cn } from '@/lib/utils';
import type { Database } from '@/lib/database.types';

type CaseStatus = Database['public']['Enums']['case_status'];

/** Ordered statuses for the normal flow. */
const TIMELINE_STEPS: { status: CaseStatus; label: string }[] = [
  { status: 'DRAFT', label: 'Draft' },
  { status: 'OPEN', label: 'Published' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'REVIEW', label: 'Review' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'COMPLETED', label: 'Completed' },
];

const STATUS_INDEX: Record<string, number> = {};
TIMELINE_STEPS.forEach((step, i) => {
  STATUS_INDEX[step.status] = i;
});

interface CaseStatusTimelineProps {
  currentStatus: CaseStatus;
  className?: string;
}

/**
 * Horizontal timeline showing the progress of a case through its lifecycle.
 *
 * @param props - Component props
 * @param props.currentStatus - The current status of the case
 * @param props.className - Additional CSS classes
 * @returns Timeline component
 */
export function CaseStatusTimeline({
  currentStatus,
  className,
}: CaseStatusTimelineProps) {
  const currentIndex = STATUS_INDEX[currentStatus] ?? -1;
  const isCancelled = currentStatus === 'CANCELLED';
  const isDisputed = currentStatus === 'DISPUTED';

  if (isCancelled || isDisputed) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-3 w-3 rounded-full bg-destructive" />
        <span className="text-sm font-medium text-destructive">
          {isCancelled ? 'Cancelled' : 'Disputed'}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isCompleted && !isCurrent && 'border-muted-foreground/30 text-muted-foreground/50',
                )}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={cn(
                  'mt-1 text-[10px] leading-tight',
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < TIMELINE_STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 w-6',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
