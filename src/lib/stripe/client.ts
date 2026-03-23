import Stripe from 'stripe';

/**
 * Server-side Stripe client instance.
 * Uses the secret key from environment variables.
 *
 * @throws Error if STRIPE_SECRET_KEY is not configured
 */
export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');

  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  });
}
