# Deployment Runbook

## Purpose

This runbook documents how to deploy, verify, and roll back DentiVerse safely.

## Pre-Deploy Checklist

1. Confirm the target release is on `main`.
2. Confirm GitHub secrets exist:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
3. Confirm Terraform-managed runtime variables are current.
4. Run locally:
   - `npm run check`
   - `npm test`
   - `npm run test:e2e`
   - `npm run build`
5. Confirm there is no active P1 or P2 incident.

## Admin Operations Model

- DentiVerse v1 launches without an in-product admin panel.
- Support, moderation, refunds, and break-glass data corrections are manual operations.
- The full operating model, permissions, and reversible SQL procedures live in [ADMIN_OPERATING_MODEL.md](./ADMIN_OPERATING_MODEL.md).

Before any sensitive manual intervention:

1. Open or update a support or finance ticket.
2. Confirm the operator has the correct dashboard or SQL permissions for the action.
3. Prefer reversible state changes over destructive edits.
4. Mirror the action in `public.audit_log`.

## Local E2E Prerequisites

- `npm run test:e2e` uses a dedicated Playwright dev server at `http://127.0.0.1:3100` so it does not fight with the usual local app on port `3000`.
- Override the default E2E server with `PLAYWRIGHT_PORT`, `PLAYWRIGHT_HOST`, `PLAYWRIGHT_PROTOCOL`, or `PLAYWRIGHT_BASE_URL` when needed.
- Local runs default to Chromium for reliability. CI installs Chromium, Firefox, and WebKit before running the full multi-browser suite.
- If Playwright reports missing local browsers, run `npx playwright install chromium` for the local gate or `npx playwright install chromium firefox webkit` for full cross-browser coverage.

## Standard Deployment

### Preview

1. Open or update a pull request to `main`.
2. Wait for the `Deploy` workflow to pass `Validate App` and `Validate Terraform`.
3. Confirm `Deploy Preview` succeeds.
4. Smoke test:
   - landing page
   - login/register
   - designer browse
   - signed file access for authenticated users
   - `npm run test:e2e` passes on the preview-ready branch before sign-off
5. Observability smoke test on preview:
   - Client path: open the preview in a browser, then run `setTimeout(() => { throw new Error('Sentry client smoke test'); }, 0)` in DevTools and confirm a client event lands in Sentry.
   - Server path: send an invalid Stripe webhook request to the preview deployment and confirm a server event lands in Sentry with the route tag `/api/v1/webhooks/stripe`.

### Production

1. Merge the approved pull request into `main`.
2. Watch the push-triggered `Deploy` workflow.
3. Confirm `Deploy Production` succeeds.
4. Smoke test production:
   - auth
   - case list/create flow
   - payment create-intent route
   - signed URL route
5. Confirm no unexpected P1/P2 Sentry alerts fired during rollout.

## Rollback

### Application Rollback

1. Identify the last healthy Vercel production deployment.
2. Promote it back to production.
3. Re-run smoke tests.
4. Record the failing commit SHA and rollback deployment ID.

### Configuration Rollback

1. Revert the Terraform change in git.
2. Run `terraform plan`.
3. Apply the rollback from a trusted environment.
4. Re-deploy if runtime variables changed.

## Common Failures

### GitHub Actions Validation Fails

- Review `npm run check`, `npm test`, or `npm run build` output in the workflow logs.
- Fix in branch and push again.

### Vercel Deploy Fails

- Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
- Confirm the Vercel project still exists and is linked to the correct branch.
- If Vercel is degraded, pause rollout and redeploy when healthy.

### Signed URL Failures

- Check Supabase storage health.
- Confirm private buckets still exist.
- Confirm runtime keys are current.
- Review recent changes to file upload and design-version flows.

### Transactional Email Disabled Or Failing

- Confirm `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` are set in the target environment. `EMAIL_REPLY_TO` is optional but recommended.
- When either required value is missing, DentiVerse intentionally skips transactional email and records a structured info log instead of blocking the marketplace flow.
- Proposal, design-submission, and payment lifecycle changes still continue in-app even when email delivery is disabled.
- Review Sentry and runtime logs for `provider: resend` if delivery failures are reported.
- Before preview or production sign-off, verify at least one real proposal, design-submitted, payment-confirmed, and payment-released email lands in the configured inboxes.

### Manual Admin Action Needed

- Use [ADMIN_OPERATING_MODEL.md](./ADMIN_OPERATING_MODEL.md) as the source of truth.
- For refunds: Stripe first, then reconcile `public.payments`.
- For moderation: prefer `is_active = false` and `is_available = false` over deleting records.
- For disputes: move the case and payment rows into `DISPUTED` before further handling.
- Record the ticket ID and operator in `public.audit_log`.

### Stripe Webhook Failures

- Check the Stripe dashboard logs.
- Verify `STRIPE_WEBHOOK_SECRET`.
- Replay failed events after the fix is deployed.
- Use the request ID from the webhook response or runtime logs to correlate the failure across Vercel logs and Sentry.

### Observability Validation

- Client smoke test:
  - Open the deployment in a browser.
  - In DevTools, run `setTimeout(() => { throw new Error('Sentry client smoke test'); }, 0)`.
  - Confirm the event appears in Sentry tagged as client-side.
- Server smoke test:
  - Run:
    ```bash
    curl -X POST "$DEPLOY_URL/api/v1/webhooks/stripe" \
      -H "Content-Type: application/json" \
      -H "stripe-signature: invalid" \
      -d '{}'
    ```
  - Confirm the response includes `X-Request-Id`.
  - Confirm the matching server event appears in Sentry and the structured runtime log includes the same request ID.

### Supabase Outage

- Confirm via Supabase dashboard or status page.
- Pause risky deploys.
- Communicate degraded service internally until recovery.

## Recovery If the Primary Operator Is Unavailable

1. Read this runbook.
2. Inspect the latest `Deploy` workflow run.
3. Check Vercel deployment history.
4. Check Sentry and Supabase logs.
5. Roll back to the last healthy production deployment if impact is active.
