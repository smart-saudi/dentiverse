import { NextRequest, NextResponse } from 'next/server';

import {
  buildRequestLogContext,
  captureServerException,
  logServerEvent,
} from '@/lib/observability/server';
import { constructWebhookEvent } from '@/lib/stripe/webhooks';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/v1/webhooks/stripe — Handle Stripe webhook events.
 *
 * Uses the service role client since webhooks are not authenticated
 * by Supabase Auth — they are authenticated by Stripe signature verification.
 *
 * @param req - Next.js request with raw Stripe event body
 * @returns Acknowledgment response
 */
export async function POST(req: NextRequest) {
  const requestContext = buildRequestLogContext(req, '/api/v1/webhooks/stripe');
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    logServerEvent('warn', 'Stripe webhook missing signature header', {
      request: requestContext,
      context: {
        provider: 'stripe',
      },
    });

    return NextResponse.json(
      { code: 'BAD_REQUEST', message: 'Missing stripe-signature header' },
      {
        status: 400,
        headers: {
          'X-Request-Id': requestContext.requestId,
        },
      },
    );
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    captureServerException(err, 'Stripe webhook verification failed', {
      request: requestContext,
      context: {
        provider: 'stripe',
      },
    });

    return NextResponse.json(
      {
        code: 'BAD_REQUEST',
        message: err instanceof Error ? err.message : 'Webhook verification failed',
      },
      {
        status: 400,
        headers: {
          'X-Request-Id': requestContext.requestId,
        },
      },
    );
  }

  // Use service role client to bypass RLS for webhook operations
  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        const paymentId = intent.metadata?.payment_id;
        if (paymentId) {
          await supabase
            .from('payments')
            .update({
              status: 'HELD',
              stripe_charge_id:
                typeof intent.latest_charge === 'string' ? intent.latest_charge : null,
              held_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentId);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        const paymentId = intent.metadata?.payment_id;
        if (paymentId) {
          await supabase
            .from('payments')
            .update({
              failure_reason: intent.last_payment_error?.message ?? 'Payment failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentId);
        }
        break;
      }

      case 'transfer.created': {
        const transfer = event.data.object;
        const paymentId = transfer.metadata?.payment_id;
        if (paymentId) {
          await supabase
            .from('payments')
            .update({
              status: 'RELEASED',
              stripe_transfer_id: transfer.id,
              released_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentId);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId =
          typeof charge.payment_intent === 'string' ? charge.payment_intent : null;
        if (paymentIntentId) {
          await supabase
            .from('payments')
            .update({
              status: 'REFUNDED',
              refunded_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntentId);
        }
        break;
      }

      default:
        logServerEvent('info', 'Stripe webhook event acknowledged without handler', {
          request: requestContext,
          context: {
            provider: 'stripe',
            event_id: event.id,
            event_type: event.type,
          },
        });
        break;
    }
  } catch (err) {
    captureServerException(err, 'Stripe webhook handler error', {
      request: requestContext,
      context: {
        provider: 'stripe',
        event_id: event.id,
        event_type: event.type,
      },
    });
  }

  return NextResponse.json(
    { received: true },
    {
      headers: {
        'X-Request-Id': requestContext.requestId,
      },
    },
  );
}
