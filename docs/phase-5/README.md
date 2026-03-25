# Phase 5: Deployment & Operations

Phase 5 moves DentiVerse from feature completeness into repeatable delivery and stable operations.

## Deliverables

### Step 14: Infrastructure as Code

- [Dockerfile](../../Dockerfile)
- [docker-compose.yml](../../docker-compose.yml)
- [infra/terraform](../../infra/terraform)
- [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml)

### Step 15: Observability

- [LOGGING_STRATEGY.md](./observability/LOGGING_STRATEGY.md)
- [SLA_SLO.md](./observability/SLA_SLO.md)

### Step 16: Deployment & Launch

- [RUNBOOK.md](./operations/RUNBOOK.md)
- [ADMIN_OPERATING_MODEL.md](./operations/ADMIN_OPERATING_MODEL.md)
- [LAUNCH_BACKLOG.md](./operations/LAUNCH_BACKLOG.md)

Admin Panel v1 now ships at `/admin` and is the primary operator surface for launch-critical support, moderation, payment intervention, and audit review. The operating-model document now covers both the in-product workflows and the external-console fallback path.

## GitHub Secrets Required for Deployment

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Runtime Dependencies Managed Outside This Repo

- Supabase
- Stripe
- Resend
- Sentry

## Working Agreement

When launch-readiness work is active, use [LAUNCH_BACKLOG.md](./operations/LAUNCH_BACKLOG.md) as the live tracker for blockers, owners, and verification status. [TODO.md](../../TODO.md) should keep only the top-level summary and session notes.
