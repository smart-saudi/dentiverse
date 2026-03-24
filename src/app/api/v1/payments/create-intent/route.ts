import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AuditService, extractRequestMeta } from '@/services/audit.service';
import { PaymentService } from '@/services/payment.service';

const audit = new AuditService();

const createIntentSchema = z.object({
  case_id: z.string().uuid(),
  proposal_id: z.string().uuid(),
});

const paymentService = new PaymentService();

/**
 * POST /api/v1/payments/create-intent — Create a Stripe PaymentIntent for escrow.
 *
 * Looks up the accepted proposal, creates a payment record, and initiates
 * a Stripe PaymentIntent with manual capture (escrow hold).
 *
 * @param req - Next.js request with case_id and proposal_id
 * @returns Stripe client_secret and payment record ID
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const body = await req.json();
  const parsed = createIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  // Fetch the accepted proposal to get price and designer
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('id, case_id, designer_id, price, status')
    .eq('id', parsed.data.proposal_id)
    .eq('case_id', parsed.data.case_id)
    .eq('status', 'ACCEPTED')
    .single();

  if (proposalError || !proposal) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'No accepted proposal found for this case' },
      { status: 404 },
    );
  }

  // Verify the user is the case owner
  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select('client_id')
    .eq('id', parsed.data.case_id)
    .single();

  if (caseError || !caseRow) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Case not found' },
      { status: 404 },
    );
  }

  if (caseRow.client_id !== user.id) {
    return NextResponse.json(
      { code: 'FORBIDDEN', message: 'Only the case owner can create payment intents' },
      { status: 403 },
    );
  }

  try {
    // Create payment record via service
    const payment = await paymentService.createPayment(supabase, user.id, {
      case_id: proposal.case_id,
      designer_id: proposal.designer_id,
      amount: proposal.price,
      currency: 'usd',
    });

    // Hold via Stripe (amount in cents)
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2025-02-24.acacia',
    });

    const held = await paymentService.holdPayment(
      supabase,
      stripe,
      payment.id,
      Math.round(proposal.price * 100),
      'usd',
    );

    const meta = extractRequestMeta(req);
    audit.log({
      userId: user.id,
      action: 'payment.intent_created',
      entityType: 'payment',
      entityId: held.id,
      newData: { amount: proposal.price, case_id: proposal.case_id, status: 'HELD' },
      ...meta,
    });

    return NextResponse.json({
      data: {
        client_secret: held.stripe_payment_intent_id,
        payment_id: held.id,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to create payment intent',
      },
      { status: 500 },
    );
  }
}
