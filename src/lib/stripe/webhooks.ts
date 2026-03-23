import type Stripe from 'stripe';

import { getStripeClient } from '@/lib/stripe/client';

/**
 * Verify and construct a Stripe webhook event from a raw request body.
 *
 * @param body - Raw request body as string
 * @param signature - Stripe-Signature header value
 * @returns Verified Stripe event
 * @throws Error if signature verification fails
 */
export function constructWebhookEvent(body: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');

  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(body, signature, secret);
}
