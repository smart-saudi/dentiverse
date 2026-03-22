import type { ProposalStatus } from '@/lib/constants';

/** Proposal submitted by a designer for a case */
export interface Proposal {
  id: string;
  case_id: string;
  designer_id: string;
  price: number;
  estimated_days: number;
  message: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}
