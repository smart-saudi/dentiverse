'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ProposalFormProps {
  caseId: string;
  onSubmitted?: () => void;
}

/**
 * Form for designers to submit a proposal on a case.
 *
 * @param props - Component props
 * @param props.caseId - The case ID to submit the proposal for
 * @param props.onSubmitted - Callback after successful submission
 * @returns Proposal submission form
 */
export function ProposalForm({ caseId, onSubmitted }: ProposalFormProps) {
  const [price, setPrice] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/cases/${caseId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(price),
          estimated_hours: Number(estimatedHours),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message ?? 'Failed to submit proposal');
      }

      setPrice('');
      setEstimatedHours('');
      setMessage('');
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  }, [caseId, price, estimatedHours, message, onSubmitted]);

  const canSubmit =
    Number(price) > 0 && Number(estimatedHours) > 0 && message.trim().length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Submit Proposal</CardTitle>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price ($)
            </label>
            <Input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hours" className="text-sm font-medium">
              Estimated Hours
            </label>
            <Input
              id="hours"
              type="number"
              min="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your approach, timeline, and why you're the right fit..."
            rows={4}
            className="border-input bg-background flex w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
        </Button>
      </CardFooter>
    </Card>
  );
}
