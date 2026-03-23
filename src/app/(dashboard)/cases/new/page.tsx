'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ToothChart } from '@/components/shared/tooth-chart';

const CASE_TYPES = [
  'CROWN',
  'BRIDGE',
  'IMPLANT',
  'VENEER',
  'INLAY',
  'ONLAY',
  'DENTURE',
  'OTHER',
] as const;

const URGENCY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'rush', label: 'Rush' },
] as const;

/**
 * Multi-step case creation form.
 * Steps: Details → Tooth Selection → Budget & Deadline → Review → Submit
 */
export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [caseType, setCaseType] = useState<(typeof CASE_TYPES)[number]>('CROWN');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [toothNumbers, setToothNumbers] = useState<number[]>([]);
  const [materialPreference, setMaterialPreference] = useState('');
  const [shade, setShade] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'rush'>('normal');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [softwareRequired, setSoftwareRequired] = useState('');

  const steps = ['Details', 'Teeth', 'Budget', 'Review'];

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return toothNumbers.length > 0;
    return true;
  };

  const handleSubmit = useCallback(async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        case_type: caseType,
        title: title.trim(),
        tooth_numbers: toothNumbers,
        urgency,
      };
      if (description) body.description = description;
      if (materialPreference) body.material_preference = materialPreference;
      if (shade) body.shade = shade;
      if (budgetMin) body.budget_min = Number(budgetMin);
      if (budgetMax) body.budget_max = Number(budgetMax);
      if (deadline) body.deadline = new Date(deadline).toISOString();
      if (specialInstructions) body.special_instructions = specialInstructions;
      if (softwareRequired) body.software_required = softwareRequired;

      const res = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message ?? 'Failed to create case');
      }

      const json = await res.json();
      router.push(`/cases/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    caseType, title, description, toothNumbers, materialPreference, shade,
    budgetMin, budgetMax, deadline, urgency, specialInstructions, softwareRequired,
    router,
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Case</h1>
        <p className="text-muted-foreground">
          Step {step + 1} of {steps.length}: {steps[step]}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step 0: Details */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            <CardDescription>Basic information about the case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="caseType" className="text-sm font-medium">Case Type</label>
              <select
                id="caseType"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value as typeof caseType)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                {CASE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full Zirconia Crown #14"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the case requirements..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="material" className="text-sm font-medium">Material Preference</label>
                <Input
                  id="material"
                  value={materialPreference}
                  onChange={(e) => setMaterialPreference(e.target.value)}
                  placeholder="e.g. Zirconia"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="shade" className="text-sm font-medium">Shade</label>
                <Input
                  id="shade"
                  value={shade}
                  onChange={(e) => setShade(e.target.value)}
                  placeholder="e.g. A2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Tooth Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Teeth</CardTitle>
            <CardDescription>Click on the teeth involved in this case</CardDescription>
          </CardHeader>
          <CardContent>
            <ToothChart selected={toothNumbers} onChange={setToothNumbers} />
          </CardContent>
        </Card>
      )}

      {/* Step 2: Budget & Timeline */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget & Timeline</CardTitle>
            <CardDescription>Set pricing and delivery expectations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="budgetMin" className="text-sm font-medium">Min Budget ($)</label>
                <Input
                  id="budgetMin"
                  type="number"
                  min="0"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="budgetMax" className="text-sm font-medium">Max Budget ($)</label>
                <Input
                  id="budgetMax"
                  type="number"
                  min="0"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium">Deadline</label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Urgency</legend>
              <div className="flex gap-3">
                {URGENCY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="urgency"
                      value={opt.value}
                      checked={urgency === opt.value}
                      onChange={() => setUrgency(opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <label htmlFor="software" className="text-sm font-medium">Software Required</label>
              <Input
                id="software"
                value={softwareRequired}
                onChange={(e) => setSoftwareRequired(e.target.value)}
                placeholder="e.g. exocad, 3Shape"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="instructions" className="text-sm font-medium">Special Instructions</label>
              <textarea
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any additional notes for the designer..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>Confirm your case details before creating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><strong>Type:</strong> {caseType}</div>
            <div><strong>Title:</strong> {title}</div>
            {description && <div><strong>Description:</strong> {description}</div>}
            <div><strong>Teeth:</strong> {toothNumbers.join(', ')}</div>
            {materialPreference && <div><strong>Material:</strong> {materialPreference}</div>}
            {shade && <div><strong>Shade:</strong> {shade}</div>}
            {(budgetMin || budgetMax) && (
              <div><strong>Budget:</strong> ${budgetMin || '0'} – ${budgetMax || '∞'}</div>
            )}
            {deadline && <div><strong>Deadline:</strong> {deadline}</div>}
            <div><strong>Urgency:</strong> {urgency}</div>
            {softwareRequired && <div><strong>Software:</strong> {softwareRequired}</div>}
            {specialInstructions && <div><strong>Instructions:</strong> {specialInstructions}</div>}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            The case will be created as a Draft. You can publish it after reviewing.
          </CardFooter>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Case'}
          </Button>
        )}
      </div>
    </div>
  );
}
