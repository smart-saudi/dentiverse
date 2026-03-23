'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseStatusBadge } from '@/components/cases/case-status-badge';
import { CaseStatusTimeline } from '@/components/cases/case-status-timeline';
import { ToothChart } from '@/components/shared/tooth-chart';
import { ProposalCard } from '@/components/proposals/proposal-card';
import { ProposalForm } from '@/components/proposals/proposal-form';
import { DesignVersionHistory } from '@/components/cases/design-version-history';
import { DesignVersionSubmit } from '@/components/cases/design-version-submit';
import { ChatThread } from '@/components/cases/chat-thread';
import type { Database } from '@/lib/database.types';

type CaseRow = Database['public']['Tables']['cases']['Row'];
type ProposalRow = Database['public']['Tables']['proposals']['Row'];

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Case detail page with status timeline, details, and actions.
 */
export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseRow | null>(null);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Resolve params
  useEffect(() => {
    params.then((p) => setCaseId(p.id));
  }, [params]);

  // Fetch current user ID for chat
  useEffect(() => {
    fetch('/api/v1/users/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data?.id) setCurrentUserId(json.data.id);
      })
      .catch(() => {});
  }, []);

  const fetchCase = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}`);
      if (!res.ok) throw new Error('Failed to load case');
      const json = await res.json();
      setCaseData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  const fetchProposals = useCallback(async () => {
    if (!caseId) return;
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/proposals`);
      if (res.ok) {
        const json = await res.json();
        setProposals(json.data);
      }
    } catch {
      // Silently ignore proposal fetch errors
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();
    fetchProposals();
  }, [fetchCase, fetchProposals]);

  const handleAcceptProposal = useCallback(
    async (proposalId: string) => {
      try {
        const res = await fetch(`/api/v1/proposals/${proposalId}/accept`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to accept');
        fetchProposals();
        fetchCase();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Accept failed');
      }
    },
    [fetchProposals, fetchCase],
  );

  const handleRejectProposal = useCallback(
    async (proposalId: string) => {
      try {
        const res = await fetch(`/api/v1/proposals/${proposalId}/reject`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to reject');
        fetchProposals();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reject failed');
      }
    },
    [fetchProposals],
  );

  const handlePublish = useCallback(async () => {
    if (!caseId) return;
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to publish');
      fetchCase();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    }
  }, [caseId, fetchCase]);

  const handleCancel = useCallback(async () => {
    if (!caseId) return;
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by user' }),
      });
      if (!res.ok) throw new Error('Failed to cancel');
      fetchCase();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    }
  }, [caseId, fetchCase]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error ?? 'Case not found'}
        </div>
        <Link href="/cases">
          <Button variant="outline">Back to cases</Button>
        </Link>
      </div>
    );
  }

  const toothNumbers = (caseData.tooth_numbers as number[]) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
              <CaseStatusBadge status={caseData.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              {caseData.case_type} &middot; Created{' '}
              {new Date(caseData.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {caseData.status === 'DRAFT' && (
            <Button onClick={handlePublish}>Publish</Button>
          )}
          {['DRAFT', 'OPEN'].includes(caseData.status) && (
            <Button variant="destructive" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <CaseStatusTimeline currentStatus={caseData.status} />

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {caseData.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-muted-foreground mt-1">{caseData.description}</p>
              </div>
            )}
            {caseData.material_preference && (
              <div>
                <span className="font-medium">Material:</span>{' '}
                {caseData.material_preference}
              </div>
            )}
            {caseData.shade && (
              <div>
                <span className="font-medium">Shade:</span> {caseData.shade}
              </div>
            )}
            <div>
              <span className="font-medium">Urgency:</span> {caseData.urgency}
            </div>
            <div>
              <span className="font-medium">Output Format:</span> {caseData.output_format}
            </div>
            <div>
              <span className="font-medium">Max Revisions:</span> {caseData.max_revisions}
            </div>
            {caseData.software_required && (
              <div>
                <span className="font-medium">Software:</span>{' '}
                {caseData.software_required}
              </div>
            )}
            {caseData.special_instructions && (
              <div>
                <span className="font-medium">Instructions:</span>
                <p className="text-muted-foreground mt-1">
                  {caseData.special_instructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(caseData.budget_min || caseData.budget_max) && (
              <div>
                <span className="font-medium">Budget:</span>{' '}
                {caseData.budget_min && caseData.budget_max
                  ? `$${caseData.budget_min} – $${caseData.budget_max}`
                  : caseData.budget_max
                    ? `Up to $${caseData.budget_max}`
                    : `From $${caseData.budget_min}`}
              </div>
            )}
            {caseData.agreed_price && (
              <div>
                <span className="font-medium">Agreed Price:</span> $
                {caseData.agreed_price}
              </div>
            )}
            {caseData.deadline && (
              <div>
                <span className="font-medium">Deadline:</span>{' '}
                {new Date(caseData.deadline).toLocaleDateString()}
              </div>
            )}
            <div>
              <span className="font-medium">Currency:</span> {caseData.currency}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tooth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selected Teeth</CardTitle>
          <CardDescription>FDI numbering system</CardDescription>
        </CardHeader>
        <CardContent>
          <ToothChart selected={toothNumbers} onChange={() => {}} disabled />
        </CardContent>
      </Card>

      {/* Proposals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Proposals ({proposals.length})</h2>
        {proposals.length === 0 && caseData.status === 'OPEN' && (
          <p className="text-muted-foreground text-sm">No proposals yet.</p>
        )}
        {proposals.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            showActions={caseData.status === 'OPEN'}
            onAccept={handleAcceptProposal}
            onReject={handleRejectProposal}
          />
        ))}
        {caseData.status === 'OPEN' && (
          <ProposalForm caseId={caseData.id} onSubmitted={fetchProposals} />
        )}
      </div>

      {/* Design Versions */}
      {[
        'ASSIGNED',
        'IN_PROGRESS',
        'REVIEW',
        'REVISION',
        'APPROVED',
        'COMPLETED',
      ].includes(caseData.status) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Design Versions</h2>
          <DesignVersionHistory
            caseId={caseData.id}
            canReview={['REVIEW'].includes(caseData.status)}
          />
          {['ASSIGNED', 'IN_PROGRESS', 'REVISION'].includes(caseData.status) && (
            <DesignVersionSubmit caseId={caseData.id} />
          )}
        </div>
      )}

      {/* Messages */}
      {[
        'ASSIGNED',
        'IN_PROGRESS',
        'REVIEW',
        'REVISION',
        'APPROVED',
        'COMPLETED',
      ].includes(caseData.status) &&
        currentUserId && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <ChatThread caseId={caseData.id} currentUserId={currentUserId} />
          </div>
        )}
    </div>
  );
}
