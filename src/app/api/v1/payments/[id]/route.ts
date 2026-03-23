import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PaymentService } from '@/services/payment.service';

const paymentService = new PaymentService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/payments/[id] — Fetch a single payment by ID.
 *
 * @param _req - Next.js request
 * @param context - Route context with payment ID
 * @returns The payment record
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const payment = await paymentService.getPayment(supabase, id);
    return NextResponse.json({ data: payment });
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Payment not found' }, { status: 404 });
    }
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to fetch payment' },
      { status: 500 },
    );
  }
}
