import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { CreatePaymentInput, PaymentListQuery } from '@/lib/validations/payment';
import { PLATFORM_FEE_PERCENT } from '@/lib/constants';
import { NotFoundError } from '@/lib/errors';

type Client = SupabaseClient<Database>;
type PaymentRow = Database['public']['Tables']['payments']['Row'];

/**
 * Service for payment operations (create, hold, release, refund).
 */
export class PaymentService {
  /**
   * Create a payment record with calculated platform fee and designer payout.
   *
   * @param client - Supabase client
   * @param clientId - The paying client's user ID
   * @param input - Payment creation data
   * @returns The created payment record
   */
  async createPayment(
    client: Client,
    clientId: string,
    input: CreatePaymentInput,
  ): Promise<PaymentRow> {
    const platformFee = Math.round(input.amount * PLATFORM_FEE_PERCENT) / 100;
    const designerPayout = input.amount - platformFee;

    const { data, error } = await client
      .from('payments')
      .insert({
        case_id: input.case_id,
        client_id: clientId,
        designer_id: input.designer_id,
        amount: input.amount,
        platform_fee: platformFee,
        designer_payout: designerPayout,
        fee_percentage: PLATFORM_FEE_PERCENT,
        currency: input.currency,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create payment');
    return data;
  }

  /**
   * Create a Stripe PaymentIntent and update payment status to HELD.
   *
   * @param client - Supabase client
   * @param stripe - Stripe client
   * @param paymentId - Payment record ID
   * @param amountCents - Amount in cents
   * @param currency - Currency code
   * @returns The updated payment record
   */
  async holdPayment(
    client: Client,
    stripe: Stripe,
    paymentId: string,
    amountCents: number,
    currency: string,
  ): Promise<PaymentRow> {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      capture_method: 'manual',
      metadata: { payment_id: paymentId },
    });

    const { data, error } = await client
      .from('payments')
      .update({
        status: 'HELD',
        stripe_payment_intent_id: intent.id,
        held_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to hold payment');
    return data;
  }

  /**
   * Release escrowed payment to the designer via Stripe Transfer.
   *
   * @param client - Supabase client
   * @param stripe - Stripe client
   * @param paymentId - Payment record ID
   * @param payoutCents - Designer payout amount in cents
   * @param designerAccountId - Designer's Stripe Connect account ID
   * @param currency - Currency code
   * @returns The updated payment record
   */
  async releasePayment(
    client: Client,
    stripe: Stripe,
    paymentId: string,
    payoutCents: number,
    designerAccountId: string,
    currency: string,
  ): Promise<PaymentRow> {
    const transfer = await stripe.transfers.create({
      amount: payoutCents,
      currency: currency.toLowerCase(),
      destination: designerAccountId,
      metadata: { payment_id: paymentId },
    });

    const { data, error } = await client
      .from('payments')
      .update({
        status: 'RELEASED',
        stripe_transfer_id: transfer.id,
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to release payment');
    return data;
  }

  /**
   * Refund a payment via Stripe.
   *
   * @param client - Supabase client
   * @param stripe - Stripe client
   * @param paymentId - Payment record ID
   * @param paymentIntentId - Stripe PaymentIntent ID to refund
   * @returns The updated payment record
   */
  async refundPayment(
    client: Client,
    stripe: Stripe,
    paymentId: string,
    paymentIntentId: string,
  ): Promise<PaymentRow> {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    const { data, error } = await client
      .from('payments')
      .update({
        status: 'REFUNDED',
        stripe_refund_id: refund.id,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to refund payment');
    return data;
  }

  /**
   * Fetch a single payment by ID.
   *
   * @param client - Supabase client
   * @param paymentId - Payment ID
   * @returns The payment row
   * @throws NotFoundError if not found
   */
  async getPayment(client: Client, paymentId: string): Promise<PaymentRow> {
    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error || !data) throw new NotFoundError('Payment not found');
    return data;
  }

  /**
   * List payments for a user (as client or designer) with pagination.
   *
   * @param client - Supabase client
   * @param userId - User ID
   * @param query - Pagination and filter params
   * @returns Paginated payment list
   */
  async listPaymentsByUser(
    client: Client,
    userId: string,
    query: PaymentListQuery,
  ): Promise<{
    data: PaymentRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    const offset = (query.page - 1) * query.per_page;

    let q = client
      .from('payments')
      .select('*', { count: 'exact' })
      .or(`client_id.eq.${userId},designer_id.eq.${userId}`);

    if (query.status) {
      q = q.eq('status', query.status);
    }

    const { data, error, count } = await q
      .order('created_at', { ascending: false })
      .range(offset, offset + query.per_page - 1);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: data ?? [],
      meta: {
        page: query.page,
        per_page: query.per_page,
        total,
        total_pages: Math.ceil(total / query.per_page),
      },
    };
  }
}
