'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock, FileIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StlViewer } from '@/components/viewer/stl-viewer';

interface LegacyDesignVersionFile {
  name: string;
  url: string;
}

interface ResolvedDesignVersionFile extends LegacyDesignVersionFile {
  bucket: string;
  expires_at: string | null;
  path: string;
  size: number;
  type: string;
}

interface DesignVersionListItem {
  id: string;
  version_number: number;
  status: string;
  notes: string | null;
  revision_feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
  file_urls: string[];
  files: ResolvedDesignVersionFile[];
}

const STATUS_CONFIG: Record<
  string,
  {
    icon: typeof CheckCircle;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string;
  }
> = {
  SUBMITTED: { icon: Clock, variant: 'outline', label: 'Submitted' },
  APPROVED: { icon: CheckCircle, variant: 'default', label: 'Approved' },
  REVISION_REQUESTED: {
    icon: AlertCircle,
    variant: 'destructive',
    label: 'Revision Requested',
  },
};

interface DesignVersionHistoryProps {
  caseId: string;
  canReview?: boolean;
  canSubmit?: boolean;
}

/**
 * Derive a readable file name from a URL when older rows do not have stored metadata.
 *
 * @param url - File URL
 * @returns A best-effort display name
 */
function getLegacyFileName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/');
    return decodeURIComponent(segments[segments.length - 1] ?? url);
  } catch {
    return url;
  }
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
export function DesignVersionHistory({
  caseId,
  canReview,
  canSubmit,
}: DesignVersionHistoryProps) {
  const [versions, setVersions] = useState<DesignVersionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/design-versions`);
      if (res.ok) {
        const json = await res.json();
        setVersions(json.data as DesignVersionListItem[]);
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

  const handleReview = useCallback(
    async (versionId: string, status: 'APPROVED' | 'REVISION_REQUESTED') => {
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
    },
    [feedback, fetchVersions],
  );

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading versions...</div>;
  }

  if (versions.length === 0 && !canSubmit) {
    return (
      <div className="text-muted-foreground text-sm">
        No design versions submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version) => {
        const config = STATUS_CONFIG[version.status] ?? {
          icon: Clock,
          variant: 'outline' as const,
          label: 'Submitted',
        };
        const StatusIcon = config.icon;
        const legacyFiles = (version.file_urls ?? []).map((url) => ({
          name: getLegacyFileName(url),
          url,
        })) satisfies LegacyDesignVersionFile[];
        const files = version.files.length > 0 ? version.files : legacyFiles;
        const stlFile = files.find(
          (file) =>
            file.name.toLowerCase().endsWith('.stl') ||
            file.name.toLowerCase().endsWith('.obj'),
        );

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
                <p className="text-muted-foreground text-sm">{version.notes}</p>
              )}

              {/* File list */}
              <div className="space-y-1">
                {files.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary flex items-center gap-2 text-sm hover:underline"
                  >
                    <FileIcon className="h-3.5 w-3.5" />
                    {file.name}
                  </a>
                ))}
              </div>

              {/* 3D preview */}
              {stlFile && <StlViewer url={stlFile.url} className="h-64" />}

              {/* Revision feedback */}
              {version.revision_feedback && (
                <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
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
                        className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
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
                          onClick={() => {
                            setReviewingId(null);
                            setFeedback('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(version.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewingId(version.id)}
                      >
                        Request Revision
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="text-muted-foreground text-xs">
                Submitted {new Date(version.created_at).toLocaleDateString()}
                {version.reviewed_at &&
                  ` · Reviewed ${new Date(version.reviewed_at).toLocaleDateString()}`}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
