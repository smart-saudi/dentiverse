import Link from 'next/link';
import { Clock, DollarSign, Wrench } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CaseStatusBadge } from '@/components/cases/case-status-badge';
import type { Database } from '@/lib/database.types';

type CaseRow = Database['public']['Tables']['cases']['Row'];

interface CaseCardProps {
  caseData: CaseRow;
}

/**
 * Card component for displaying a case summary in list views.
 *
 * @param props - Component props
 * @param props.caseData - The case row data
 * @returns A clickable card linking to the case detail page
 */
export function CaseCard({ caseData }: CaseCardProps) {
  const toothNumbers = (caseData.tooth_numbers as number[]) ?? [];

  return (
    <Link href={`/cases/${caseData.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base">
                {caseData.title}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {caseData.description ?? 'No description'}
              </CardDescription>
            </div>
            <CaseStatusBadge status={caseData.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wrench className="h-3.5 w-3.5" />
              <span>{caseData.case_type}</span>
            </div>
            {toothNumbers.length > 0 && (
              <div className="flex items-center gap-1">
                <span>
                  Teeth: {toothNumbers.join(', ')}
                </span>
              </div>
            )}
            {(caseData.budget_min || caseData.budget_max) && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span>
                  {caseData.budget_min && caseData.budget_max
                    ? `$${caseData.budget_min}–$${caseData.budget_max}`
                    : caseData.budget_max
                      ? `Up to $${caseData.budget_max}`
                      : `From $${caseData.budget_min}`}
                </span>
              </div>
            )}
            {caseData.deadline && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {new Date(caseData.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
