# Logging Strategy

## Goal

Make production failures diagnosable quickly without exposing patient-sensitive or payment-sensitive data.

## Destinations

### Application Logs

- Primary sink: Vercel runtime logs
- Use for: request lifecycle, route failures, webhook processing, provider retry diagnostics

### Error Tracking

- Primary sink: Sentry
- Use for: uncaught exceptions, React rendering errors, API failures, webhook failures

### Platform Logs

- Supabase: auth, database, RLS, and storage events
- Stripe: payment intents, webhook retries, payout failures
- Resend: delivery failures and bounce events

## Levels

- `error`: customer-visible failure or data-path interruption
- `warn`: degraded but recoverable behavior
- `info`: deploy markers, critical workflow transitions, background job start and finish
- `debug`: local development only

## Server Log Shape

```json
{
  "timestamp": "2026-03-24T12:00:00.000Z",
  "level": "error",
  "service": "dentiverse-web",
  "environment": "production",
  "route": "/api/v1/payments",
  "request_id": "req_123",
  "user_id": "uuid-or-null",
  "message": "Stripe create payment intent failed",
  "context": {
    "case_id": "uuid",
    "provider": "stripe"
  }
}
```

## Redaction Rules

Never log:

- file contents or patient scans
- auth tokens or API keys
- Stripe secrets or payment method details
- full request bodies for uploads

Log only IDs and compact metadata:

- case IDs
- proposal IDs
- payment intent IDs
- storage bucket and path
- user role when needed

## Alert Priorities

- P1: production deploy unavailable, auth outage, payment outage, webhook failure spike
- P2: elevated API error rate, signed URL failures, email delivery degradation
- P3: latency regression, non-blocking UI errors, flaky provider responses

## Implementation Notes

- Keep `console.error` server-side only.
- Add request correlation metadata to route and webhook failures.
- Wire Sentry before public launch when `NEXT_PUBLIC_SENTRY_DSN` is present.
- Treat audit logging and observability logging as separate systems with different purposes.

Current launch-candidate wiring:

- Sentry runtime init lives in `instrumentation-client.ts`, `instrumentation.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
- Structured JSON server logs live in `src/lib/observability/server.ts`.
- Request IDs are attached to route/webhook failure logs and echoed on selected error responses.
- Current high-value captured paths include the global app error boundary, auth route failures, Stripe webhook failures, and audit-log write failures.
