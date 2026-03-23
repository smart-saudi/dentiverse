import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPaymentSchema, paymentListQuerySchema } from '@/lib/validations/payment';
import { PaymentService } from '@/services/payment.service';

const paymentService = new PaymentService();

/**
 * POST /api/v1/payments — Create a payment record (escrow hold initiation).
 *
 * @param req - Next.js request with payment body
 * @returns The created payment record
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const payment = await paymentService.createPayment(supabase, user.id, parsed.data);
    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to create payment' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/payments — List payments for the current user.
 *
 * @param req - Next.js request with optional query params
 * @returns Paginated list of payments
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = paymentListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Invalid query', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await paymentService.listPaymentsByUser(supabase, user.id, parsed.data);
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to list payments' },
      { status: 500 },
    );
  }
}
