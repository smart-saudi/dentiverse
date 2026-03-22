import type { CaseStatus, CaseType } from '@/lib/constants';

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
