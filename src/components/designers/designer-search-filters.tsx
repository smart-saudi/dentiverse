'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CASE_TYPES } from '@/lib/validations/case';

const SOFTWARE_OPTIONS = [
  'Exocad',
  '3Shape',
  'Zirkonzahn',
  'DentalCAD',
  'Medit',
  'inLab',
] as const;

const SORT_OPTIONS = [
  { value: 'avg_rating', label: 'Top Rated' },
  { value: 'completed_cases', label: 'Most Cases' },
  { value: 'years_experience', label: 'Most Experienced' },
  { value: 'hourly_rate', label: 'Lowest Rate' },
] as const;

interface DesignerSearchFiltersProps {
  query: string;
  specialization: string;
  software: string;
  sortBy: string;
  onQueryChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;
  onSoftwareChange: (value: string) => void;
  onSortByChange: (value: string) => void;
}

/**
 * Filter bar for the designer browse/search page.
 *
 * @param props - Component props with filter values and change handlers
 * @returns Filter controls for specialization, software, sort, and text search
 */
export function DesignerSearchFilters({
  query,
  specialization,
  software,
  sortBy,
  onQueryChange,
  onSpecializationChange,
  onSoftwareChange,
  onSortByChange,
}: DesignerSearchFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <Input
        placeholder="Search designers..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      {/* Specialization filter */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Specialization</span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={specialization === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSpecializationChange('')}
          >
            All
          </Button>
          {CASE_TYPES.map((type) => (
            <Button
              key={type}
              variant={specialization === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSpecializationChange(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Software filter */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Software</span>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={software === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSoftwareChange('')}
          >
            All
          </Button>
          {SOFTWARE_OPTIONS.map((sw) => (
            <Button
              key={sw}
              variant={software === sw ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSoftwareChange(sw)}
            >
              {sw}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Sort By</span>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={sortBy === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortByChange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
