import { Clock, DollarSign } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Database } from '@/lib/database.types';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

const STATUS_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  PENDING: { variant: 'outline', label: 'Pending' },
  ACCEPTED: { variant: 'default', label: 'Accepted' },
  REJECTED: { variant: 'destructive', label: 'Rejected' },
  WITHDRAWN: { variant: 'secondary', label: 'Withdrawn' },
};

interface ProposalCardProps {
  proposal: ProposalRow;
  showActions?: boolean;
  onAccept?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
}

/**
 * Card component displaying a proposal with price, hours, message, and action buttons.
 *
 * @param props - Component props
 * @param props.proposal - The proposal row data
 * @param props.showActions - Whether to show accept/reject buttons
 * @param props.onAccept - Callback when accept is clicked
 * @param props.onReject - Callback when reject is clicked
 * @returns Proposal card with optional action buttons
 */
export function ProposalCard({ proposal, showActions, onAccept, onReject }: ProposalCardProps) {
  const config = STATUS_CONFIG[proposal.status] ?? { variant: 'outline' as const, label: proposal.status };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            Proposal
          </CardTitle>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">${proposal.price}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{proposal.estimated_hours}h estimated</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{proposal.message}</p>

        <div className="text-xs text-muted-foreground">
          Submitted {new Date(proposal.created_at).toLocaleDateString()}
        </div>

        {showActions && proposal.status === 'PENDING' && (
          <div className="flex gap-2 pt-2">
            {onAccept && (
              <Button size="sm" onClick={() => onAccept(proposal.id)}>
                Accept
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="destructive" onClick={() => onReject(proposal.id)}>
                Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
