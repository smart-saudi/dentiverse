'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, FileIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StlViewer } from '@/components/viewer/stl-viewer';
import type { Database } from '@/lib/database.types';

type DesignVersionRow = Database['public']['Tables']['design_versions']['Row'];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  SUBMITTED: { icon: Clock, variant: 'outline', label: 'Submitted' },
  APPROVED: { icon: CheckCircle, variant: 'default', label: 'Approved' },
  REVISION_REQUESTED: { icon: AlertCircle, variant: 'destructive', label: 'Revision Requested' },
};

interface DesignVersionHistoryProps {
  caseId: string;
  canReview?: boolean;
  canSubmit?: boolean;
}

/**
 * Design version history showing all submissions with review actions.
 *
 * @param props - Component props
 * @param props.caseId - Case ID to fetch versions for
 * @param props.canReview - Whether the user can approve/request revision
 * @param props.canSubmit - Whether the user can submit new versions
 * @returns Design version timeline with review controls
 */
export function DesignVersionHistory({ caseId, canReview, canSubmit }: DesignVersionHistoryProps) {
  const [versions, setVersions] = useState<DesignVersionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/design-versions`);
      if (res.ok) {
        const json = await res.json();
        setVersions(json.data);
      }
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleReview = useCallback(async (versionId: string, status: 'APPROVED' | 'REVISION_REQUESTED') => {
    try {
      const body: Record<string, string> = { status };
      if (status === 'REVISION_REQUESTED' && feedback) {
        body.revision_feedback = feedback;
      }

      const res = await fetch(`/api/v1/design-versions/${versionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFeedback('');
        setReviewingId(null);
        fetchVersions();
      }
    } catch {
      // silently ignore
    }
  }, [feedback, fetchVersions]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading versions...</div>;
  }

  if (versions.length === 0 && !canSubmit) {
    return <div className="text-sm text-muted-foreground">No design versions submitted yet.</div>;
  }

  return (
    <div className="space-y-4">
      {versions.map((version) => {
        const config = STATUS_CONFIG[version.status] ?? { icon: Clock, variant: 'outline' as const, label: 'Submitted' };
        const StatusIcon = config.icon;
        const fileUrls = (version.file_urls as string[]) ?? [];
        const stlFile = fileUrls.find((u) => u.endsWith('.stl') || u.endsWith('.obj'));

        return (
          <Card key={version.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <CardTitle className="text-base">
                    Version {version.version_number}
                  </CardTitle>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {version.notes && (
                <p className="text-sm text-muted-foreground">{version.notes}</p>
              )}

              {/* File list */}
              <div className="space-y-1">
                {fileUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileIcon className="h-3.5 w-3.5" />
                    {url.split('/').pop()}
                  </a>
                ))}
              </div>

              {/* 3D preview */}
              {stlFile && (
                <StlViewer url={stlFile} className="h-64" />
              )}

              {/* Revision feedback */}
              {version.revision_feedback && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <strong>Feedback:</strong> {version.revision_feedback}
                </div>
              )}

              {/* Review actions */}
              {canReview && version.status === 'SUBMITTED' && (
                <div className="space-y-2 pt-2">
                  {reviewingId === version.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Describe what needs to be revised..."
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(version.id, 'REVISION_REQUESTED')}
                        >
                          Request Revision
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setReviewingId(null); setFeedback(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleReview(version.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setReviewingId(version.id)}>
                        Request Revision
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Submitted {new Date(version.created_at).toLocaleDateString()}
                {version.reviewed_at && ` · Reviewed ${new Date(version.reviewed_at).toLocaleDateString()}`}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
