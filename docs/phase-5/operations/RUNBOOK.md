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
   - `npm run build`
5. Confirm there is no active P1 or P2 incident.

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

### Production

1. Merge the approved pull request into `main`.
2. Watch the push-triggered `Deploy` workflow.
3. Confirm `Deploy Production` succeeds.
4. Smoke test production:
   - auth
   - case list/create flow
   - payment create-intent route
   - signed URL route

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

### Stripe Webhook Failures

- Check the Stripe dashboard logs.
- Verify `STRIPE_WEBHOOK_SECRET`.
- Replay failed events after the fix is deployed.

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
