'use client';

import { useCallback } from 'react';

import { cn } from '@/lib/utils';

/**
 * FDI tooth numbering system layout.
 * Quadrants: 1 (upper right), 2 (upper left), 3 (lower left), 4 (lower right).
 * Teeth per quadrant: 1 (central incisor) to 8 (third molar).
 */
const QUADRANTS = [
  { id: 1, teeth: [18, 17, 16, 15, 14, 13, 12, 11], label: 'Upper Right' },
  { id: 2, teeth: [21, 22, 23, 24, 25, 26, 27, 28], label: 'Upper Left' },
  { id: 3, teeth: [38, 37, 36, 35, 34, 33, 32, 31], label: 'Lower Right' },
  { id: 4, teeth: [41, 42, 43, 44, 45, 46, 47, 48], label: 'Lower Left' },
];

interface ToothChartProps {
  /** Currently selected tooth numbers. */
  selected: number[];
  /** Callback when selection changes. */
  onChange: (selected: number[]) => void;
  /** Whether the component is read-only. */
  disabled?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Interactive FDI tooth number selector.
 * Displays a dental chart with clickable teeth organized by quadrant.
 *
 * @param props - Component props
 * @param props.selected - Currently selected tooth numbers
 * @param props.onChange - Selection change callback
 * @param props.disabled - Read-only mode
 * @param props.className - Additional CSS classes
 * @returns Interactive tooth chart
 */
export function ToothChart({
  selected,
  onChange,
  disabled = false,
  className,
}: ToothChartProps) {
  const toggleTooth = useCallback(
    (tooth: number) => {
      if (disabled) return;
      if (selected.includes(tooth)) {
        onChange(selected.filter((t) => t !== tooth));
      } else {
        onChange([...selected, tooth].sort((a, b) => a - b));
      }
    },
    [selected, onChange, disabled],
  );

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-sm font-medium">
        Tooth Chart (FDI)
        {selected.length > 0 && (
          <span className="ml-2 text-muted-foreground">
            Selected: {selected.join(', ')}
          </span>
        )}
      </div>

      {/* Upper jaw */}
      <div className="space-y-1">
        <div className="text-center text-xs text-muted-foreground">Upper</div>
        <div className="flex justify-center gap-0.5">
          {QUADRANTS[0].teeth.map((tooth) => (
            <ToothButton
              key={tooth}
              tooth={tooth}
              isSelected={selected.includes(tooth)}
              onClick={() => toggleTooth(tooth)}
              disabled={disabled}
            />
          ))}
          <div className="mx-1 w-px bg-border" />
          {QUADRANTS[1].teeth.map((tooth) => (
            <ToothButton
              key={tooth}
              tooth={tooth}
              isSelected={selected.includes(tooth)}
              onClick={() => toggleTooth(tooth)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Separator line */}
      <div className="mx-auto h-px w-3/4 bg-border" />

      {/* Lower jaw */}
      <div className="space-y-1">
        <div className="flex justify-center gap-0.5">
          {QUADRANTS[2].teeth.map((tooth) => (
            <ToothButton
              key={tooth}
              tooth={tooth}
              isSelected={selected.includes(tooth)}
              onClick={() => toggleTooth(tooth)}
              disabled={disabled}
            />
          ))}
          <div className="mx-1 w-px bg-border" />
          {QUADRANTS[3].teeth.map((tooth) => (
            <ToothButton
              key={tooth}
              tooth={tooth}
              isSelected={selected.includes(tooth)}
              onClick={() => toggleTooth(tooth)}
              disabled={disabled}
            />
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground">Lower</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: individual tooth button
// ---------------------------------------------------------------------------

interface ToothButtonProps {
  tooth: number;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

function ToothButton({ tooth, isSelected, onClick, disabled }: ToothButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Tooth ${tooth}`}
      aria-pressed={isSelected}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded border text-xs font-medium transition-colors',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      {tooth}
    </button>
  );
}
