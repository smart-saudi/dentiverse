import type { CASE_STATUSES, CASE_TYPES } from '@/lib/validations/case';

type CaseStatus = (typeof CASE_STATUSES)[number];
type CaseType = (typeof CASE_TYPES)[number];

/** Dental case as returned from the API */
export interface Case {
  id: string;
  client_id: string;
  title: string;
  description: string;
  case_type: CaseType;
  status: CaseStatus;
  tooth_numbers: number[];
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}
