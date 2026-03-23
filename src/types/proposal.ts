import type { PROPOSAL_STATUSES } from '@/lib/validations/proposal';

type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

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
