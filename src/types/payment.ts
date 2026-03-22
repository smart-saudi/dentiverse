import type { PaymentStatus } from '@/lib/constants';

/** Payment record for a case */
export interface Payment {
  id: string;
  case_id: string;
  proposal_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  platform_fee: number;
  stripe_payment_intent_id: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
