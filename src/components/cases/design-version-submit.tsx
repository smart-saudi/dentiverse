'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileUploader, type UploadedFile } from '@/components/shared/file-uploader';

interface DesignVersionSubmitProps {
  caseId: string;
  onSubmitted?: () => void;
}

/**
 * Form for designers to submit a new design version with file uploads.
 *
 * @param props - Component props
 * @param props.caseId - The case ID to submit the version for
 * @param props.onSubmitted - Callback after successful submission
 * @returns Design version submission form with file uploader
 */
export function DesignVersionSubmit({ caseId, onSubmitted }: DesignVersionSubmitProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (files.length === 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/cases/${caseId}/design-versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map((file) => ({
            bucket: file.bucket,
            path: file.path,
            name: file.name,
            size: file.size,
            type: file.type,
          })),
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message ?? 'Failed to submit version');
      }

      setFiles([]);
      setNotes('');
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [caseId, files, notes, onSubmitted]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Submit New Design Version</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div
            role="alert"
            className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}

        <FileUploader bucket="design-files" onFilesUploaded={setFiles} />

        <div className="space-y-2">
          <label htmlFor="version-notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="version-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what changed in this version..."
            rows={3}
            className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || files.length === 0}>
          {isSubmitting ? 'Submitting...' : 'Submit Version'}
        </Button>
      </CardFooter>
    </Card>
  );
}
