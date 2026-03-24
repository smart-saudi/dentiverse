# Launch Readiness Backlog

This document is the living source of truth for launch readiness.

Use it to track:

- what is blocking launch right now
- who owns each blocker
- what order we should fix things in
- the exact commit-sized tasks for each workstream
- the most recent evidence, so we do not need to repeat a full audit every session

Last verified: 2026-03-24

---

## How To Use This Document

At the start of every launch-readiness session:

1. Read [TODO.md](../../../TODO.md)
2. Read this file
3. Re-run only the checks needed for the task you are touching
4. Update the status, evidence, and session notes before ending the session

Update rules:

- Change `Last verified` whenever you re-check launch status
- Move one item at a time into `IN PROGRESS`
- Record the exact commands used for verification
- Link to the affected files when a blocker changes state
- Mirror the top-level status in [TODO.md](../../../TODO.md)

Status labels:

- `TODO`: not started
- `IN PROGRESS`: actively being worked
- `BLOCKED`: waiting on an external decision, secret, or environment
- `DONE`: completed and verified

Owner labels:

- `App`: application code and tests
- `Ops`: deployment, observability, infrastructure, secrets
- `Product`: scope decisions and launch tradeoffs
- `Shared`: coordinated work across App, Ops, and Product

---

## Current Snapshot

| Gate                          | Current State        | Last Evidence                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run check`               | Passing              | `npm.cmd run check` passed on 2026-03-24 after regenerating DB types and normalizing shared Supabase client typing                                                                                                                                                                                                                                                       |
| `npm test`                    | Passing              | `npm.cmd test` passed with `335` tests green on 2026-03-24 after the preview-CI follow-up fixes                                                                                                                                                                                                                                                                          |
| `npm run build`               | Passing with warning | `npm.cmd run build` passed on 2026-03-24; non-fatal OpenTelemetry dependency warnings from `@sentry/nextjs` and the standalone traced-file copy warning for `(dashboard)/page_client-reference-manifest.js` remain                                                                                                                                                       |
| `npm run test:e2e`            | Passing              | `npm.cmd run test:e2e` passed with `11` Chromium specs on 2026-03-24 using the dedicated Playwright server at `http://127.0.0.1:3100`; CI now installs browsers and runs the suite in `.github/workflows/deploy.yml`                                                                                                                                                     |
| Release candidate cleanliness | Passing              | Completed launch-readiness work is committed on `main`; only unrelated local `.claude/worktrees/eager-boyd` dirt remains in the workspace during active development                                                                                                                                                                                                      |
| Observability wiring          | Passing              | Sentry runtime init and structured server logging are active in the launch candidate, with coverage in `tests/unit/lib/observability/server.test.ts`                                                                                                                                                                                                                     |
| Auth abuse protection         | Passing              | Auth throttling and login lockout now live in [src/lib/auth-abuse.ts](../../../src/lib/auth-abuse.ts), with coverage in `auth.test.ts`, `auth-refresh.test.ts`, and `auth-abuse.test.ts`                                                                                                                                                                                 |
| Admin operations model        | Passing              | v1 launch now uses the documented manual-ops model in `docs/phase-5/operations/ADMIN_OPERATING_MODEL.md`, and the system architecture diagram no longer promises an in-product admin panel                                                                                                                                                                               |
| Transactional email           | Passing              | Resend-backed delivery now lives in [src/services/email.service.ts](../../../src/services/email.service.ts), with proposal/design hooks and webhook-triggered payment emails covered by unit and integration tests on 2026-03-24                                                                                                                                         |
| Preview smoke validation      | Blocked              | PR #3 workflow run `23507861542` now passes `Validate App`, `Validate Terraform`, and `Deploy Preview` after scoping standalone output to Docker builds, lazy-loading Resend in `EmailService`, and moving the dashboard home to `/dashboard`; hosted smoke is still blocked because `/api/v1/designers` fails until Vercel runtime secrets point at real cloud services |
| Rollback rehearsal            | Passing with caveat  | Preview rollback is invalid because preview deployments never served production traffic; a real production rollback back to `dpl_C7R7GM1wSWdqaT2KFQ8pekPLmUKh` succeeded in about `6.66s`, and the production landing page stayed healthy after the alias move                                                                                                           |

---

## Launch Exit Criteria

DentiVerse is launch-ready only when all of the following are true:

1. `npm run check` passes
2. `npm test` passes
3. `npm run build` passes
4. `npm run test:e2e` passes reliably
5. The release candidate is committed, reviewed, and deployable from `main`
6. Sentry receives test events from UI and API paths
7. Auth abuse controls are enabled and tested
8. Preview deploy smoke tests pass
9. Rollback steps are rehearsed and recorded
10. Launch-facing docs match shipped behavior

---

## Sequenced Backlog

### Wave 1: Restore Release Health

| ID      | Title                                                  | Priority | Owner  | Status | Depends On | Success Signal                                        |
| ------- | ------------------------------------------------------ | -------- | ------ | ------ | ---------- | ----------------------------------------------------- |
| `LR-01` | Fix Supabase typing regression and restore green build | `P0`     | App    | `DONE` | -          | `check` and `build` both pass                         |
| `LR-02` | Cut a clean, committed release candidate               | `P0`     | Shared | `DONE` | `LR-01`    | Launch-related changes are committed and reproducible |

### Wave 2: Launch-Safety Hardening

| ID      | Title                         | Priority | Owner  | Status | Depends On | Success Signal                                                  |
| ------- | ----------------------------- | -------- | ------ | ------ | ---------- | --------------------------------------------------------------- |
| `LR-03` | Add auth abuse protection     | `P1`     | App    | `DONE` | `LR-01`    | Login, forgot-password, and refresh are rate-limited and tested |
| `LR-04` | Wire production observability | `P1`     | Shared | `DONE` | `LR-01`    | Sentry and structured logs receive real runtime errors          |
| `LR-05` | Make E2E validation reliable  | `P1`     | App    | `DONE` | `LR-01`    | Playwright runs clean locally and in CI                         |

### Wave 3: Operational Launch Gaps

| ID      | Title                                          | Priority | Owner   | Status | Depends On | Success Signal                                                          |
| ------- | ---------------------------------------------- | -------- | ------- | ------ | ---------- | ----------------------------------------------------------------------- |
| `LR-06` | Define and implement the admin operating model | `P1`     | Shared  | `DONE` | `LR-02`    | Support, refunds, and moderation have an owned operational path         |
| `LR-07` | Implement transactional email                  | `P2`     | App     | `DONE` | `LR-02`    | Proposal, design, and payment email flows work in non-local envs        |
| `LR-08` | Resolve auth scope drift                       | `P2`     | Product | `DONE` | `LR-02`    | OAuth/Magic Link are either implemented or explicitly de-scoped in docs |

### Wave 4: Go-Live Validation

| ID      | Title                                      | Priority | Owner  | Status    | Depends On                         | Success Signal                                         |
| ------- | ------------------------------------------ | -------- | ------ | --------- | ---------------------------------- | ------------------------------------------------------ |
| `LR-09` | Run preview smoke tests and rollback drill | `P1`     | Shared | `DONE`    | `LR-02`, `LR-03`, `LR-04`, `LR-05` | Preview and rollback runbooks are validated end-to-end |
| `LR-10` | Final launch sign-off and doc lock         | `P1`     | Shared | `BLOCKED` | `LR-06`, `LR-07`, `LR-08`, `LR-09` | Docs, tracker, and release candidate all agree         |

---

## Commit-Sized Task Breakdown

### `LR-01` Fix Supabase Typing Regression

Objective:

- restore `npm run check`
- restore `npm run build`
- re-establish one authoritative Supabase typing contract across routes and services

Evidence:

- [src/lib/database.types.ts](../../../src/lib/database.types.ts) was regenerated from local Supabase on 2026-03-24 and is no longer a placeholder
- Shared client typing now lives in [src/lib/supabase/types.ts](../../../src/lib/supabase/types.ts) and is used by [src/lib/supabase/server.ts](../../../src/lib/supabase/server.ts), [src/lib/supabase/middleware.ts](../../../src/lib/supabase/middleware.ts), [src/lib/supabase/admin.ts](../../../src/lib/supabase/admin.ts), and [src/lib/supabase/client.ts](../../../src/lib/supabase/client.ts)
- `npm.cmd run check`, `npm.cmd test`, and `npm.cmd run build` all passed on 2026-03-24 after the typing cleanup

Tasks:

- [x] `LR-01a` Regenerate [src/lib/database.types.ts](../../../src/lib/database.types.ts) from the local Supabase schema.
- [x] `LR-01b` Introduce one shared app-level Supabase client type and migrate service signatures away from route-local generic drift.
- [x] `LR-01c` Fix route handlers and UI call sites that collapsed to `never` or nullable field errors after type regeneration.
- [x] `LR-01d` Type the cookie callback parameters in [src/lib/supabase/server.ts](../../../src/lib/supabase/server.ts), [src/lib/supabase/middleware.ts](../../../src/lib/supabase/middleware.ts), and [src/middleware.ts](../../../src/middleware.ts).
- [x] `LR-01e` Verify with `npm run check`, `npm test`, and `npm run build`, then record the exact result in this doc and [TODO.md](../../../TODO.md).

Recommended commit sequence:

1. `fix: regenerate supabase database types`
2. `refactor: standardize supabase client typing`
3. `fix: restore api route type safety`
4. `docs: update launch backlog status for typing recovery`

### `LR-02` Cut A Clean Release Candidate

Objective:

- make the launch candidate reproducible from git

Tasks:

- [x] `LR-02a` Separate launch-related repo changes from unrelated local dirtiness.
- [x] `LR-02b` Commit the Phase 5 assets, design-version hardening, and Supabase typing recovery after `LR-01` returned the release gates to green.
- [x] `LR-02c` Record the release candidate SHA in [TODO.md](../../../TODO.md) session notes and this document.
- [x] `LR-02d` Confirm the deploy workflow in [.github/workflows/deploy.yml](../../../.github/workflows/deploy.yml) is present in the candidate and can validate the repo as committed.

Release candidate SHA:

- `0dae88681d4ae0fabd811e9c708735c251606752` (`chore: commit launch-readiness changes`)

Recommended commit sequence:

1. `chore: commit launch-readiness changes`
2. `docs: record release candidate status`

### `LR-03` Add Auth Abuse Protection

Objective:

- close the gap between documented auth security controls and runtime behavior

Tasks:

- [x] `LR-03a` Decide the enforcement layer for rate limiting and lockout behavior.
- [x] `LR-03b` Implement login throttling.
- [x] `LR-03c` Extend protection to forgot-password and refresh endpoints.
- [x] `LR-03d` Add integration tests for throttled, repeated, and recovery paths.
- [x] `LR-03e` Update security docs and environment/config notes.

Evidence:

- Auth abuse protection is enforced in [src/lib/auth-abuse.ts](../../../src/lib/auth-abuse.ts).
- [src/app/api/v1/auth/login/route.ts](../../../src/app/api/v1/auth/login/route.ts), [src/app/api/v1/auth/forgot-password/route.ts](../../../src/app/api/v1/auth/forgot-password/route.ts), and [src/app/api/v1/auth/refresh/route.ts](../../../src/app/api/v1/auth/refresh/route.ts) now consume the shared limiter.
- Coverage was added in [tests/unit/lib/auth-abuse.test.ts](../../../tests/unit/lib/auth-abuse.test.ts), [tests/integration/auth.test.ts](../../../tests/integration/auth.test.ts), and [tests/integration/auth-refresh.test.ts](../../../tests/integration/auth-refresh.test.ts).

Recommended commit sequence:

1. `test: add auth abuse protection coverage`
2. `feat: rate limit auth endpoints`
3. `docs: align security docs with auth protections`

### `LR-04` Wire Production Observability

Objective:

- make failures visible before public launch

Evidence:

- Sentry runtime initialization now lives in [instrumentation.ts](../../../instrumentation.ts), [instrumentation-client.ts](../../../instrumentation-client.ts), [sentry.server.config.ts](../../../sentry.server.config.ts), and [sentry.edge.config.ts](../../../sentry.edge.config.ts).
- Structured server logging and exception capture now live in [src/lib/observability/server.ts](../../../src/lib/observability/server.ts), with client-side error capture in [src/lib/observability/client.ts](../../../src/lib/observability/client.ts).
- High-value runtime paths now report through the shared observability layer in [src/app/error.tsx](../../../src/app/error.tsx), [src/app/api/v1/webhooks/stripe/route.ts](../../../src/app/api/v1/webhooks/stripe/route.ts), [src/services/audit.service.ts](../../../src/services/audit.service.ts), and the auth routes under [src/app/api/v1/auth](../../../src/app/api/v1/auth).
- Coverage was added in [tests/unit/lib/observability/server.test.ts](../../../tests/unit/lib/observability/server.test.ts), and the auth/audit regressions remain covered by [tests/integration/auth.test.ts](../../../tests/integration/auth.test.ts), [tests/integration/auth-refresh.test.ts](../../../tests/integration/auth-refresh.test.ts), and [tests/unit/services/audit.service.test.ts](../../../tests/unit/services/audit.service.test.ts).

Tasks:

- [x] `LR-04a` Install and configure Sentry for Next.js runtime paths.
- [x] `LR-04b` Add a small structured logger utility for API routes and webhooks.
- [x] `LR-04c` Replace raw `console.error` fallback paths where runtime observability is required.
- [x] `LR-04d` Add request correlation metadata for route and webhook failures.
- [x] `LR-04e` Update the runbook with smoke-test steps for Sentry validation.

Recommended commit sequence:

1. `chore: install sentry runtime support`
2. `feat: wire structured error reporting`
3. `docs: update observability runbook`

### `LR-05` Make E2E Validation Reliable

Objective:

- make browser-level validation part of the real release gate

Evidence:

- Shared Playwright runtime alignment now lives in [playwright.config.helpers.ts](../../../playwright.config.helpers.ts), with coverage in [tests/unit/lib/playwright-config.test.ts](../../../tests/unit/lib/playwright-config.test.ts).
- [playwright.config.ts](../../../playwright.config.ts) now uses a dedicated local E2E server on `127.0.0.1:3100`, keeps `baseURL` and `webServer.url` aligned, and runs Chromium locally while reserving the multi-browser matrix for CI.
- The E2E specs in [tests/e2e/auth.spec.ts](../../../tests/e2e/auth.spec.ts), [tests/e2e/create-case.spec.ts](../../../tests/e2e/create-case.spec.ts), and [tests/e2e/designer-flow.spec.ts](../../../tests/e2e/designer-flow.spec.ts) now assert current route behavior instead of stale conditional redirects.
- The CI gate in [.github/workflows/deploy.yml](../../../.github/workflows/deploy.yml) now installs Playwright browsers and runs `npm run test:e2e`.
- Local prerequisites and release-checklist expectations are documented in [docs/phase-5/operations/RUNBOOK.md](./RUNBOOK.md).

Tasks:

- [x] `LR-05a` Fix [playwright.config.ts](../../../playwright.config.ts) so the base URL and web server stay aligned even when the default port is taken.
- [x] `LR-05b` Stabilize any selectors or setup assumptions needed for auth and dashboard flows.
- [x] `LR-05c` Run E2E locally against a clean environment and document prerequisites.
- [x] `LR-05d` Add E2E validation expectations to the launch checklist.

Recommended commit sequence:

1. `test: stabilize playwright server configuration`
2. `test: harden critical e2e flows`
3. `docs: document e2e release gate`

### `LR-06` Define And Implement The Admin Operating Model

Objective:

- make support, refunds, and moderation operationally safe

Evidence:

- The launch decision is now explicit in [docs/phase-5/operations/ADMIN_OPERATING_MODEL.md](./ADMIN_OPERATING_MODEL.md): DentiVerse v1 ships without an in-product admin panel and uses manual ops for support, moderation, refunds, and break-glass corrections.
- [docs/phase-5/operations/RUNBOOK.md](./RUNBOOK.md) now references the manual-ops model and includes admin-intervention guardrails for tickets, permissions, and audit logging.
- [docs/diagrams/system-architecture.mmd](../../diagrams/system-architecture.mmd) now models manual ops and external consoles instead of a shipped admin panel.
- Internal contributor guidance in [AGENTS.md](../../../AGENTS.md) and [CLAUDE.md](../../../CLAUDE.md) now clarifies that `ADMIN` is manual-ops-only in the current launch candidate.

Tasks:

- [x] `LR-06a` Decide whether launch uses a minimal admin UI or a documented manual-ops flow.
- [x] `LR-06b` If manual for v1, update [docs/phase-5/operations/RUNBOOK.md](./RUNBOOK.md) with exact procedures and permissions.
- [x] `LR-06c` If UI is required, create the minimum admin routes and guarded actions needed for launch.
- [x] `LR-06d` Remove or update any architecture docs that over-promise beyond the chosen v1 path.

### `LR-07` Implement Transactional Email

Objective:

- deliver critical marketplace state changes outside the browser

Evidence:

- Resend delivery now lives in [src/services/email.service.ts](../../../src/services/email.service.ts), which sends proposal-received, design-submitted, payment-confirmed, and payment-released emails without blocking the primary workflow.
- Proposal and design-submission hooks now call the email service from [src/app/api/v1/cases/[id]/proposals/route.ts](../../../src/app/api/v1/cases/%5Bid%5D/proposals/route.ts) and [src/app/api/v1/cases/[id]/design-versions/route.ts](../../../src/app/api/v1/cases/%5Bid%5D/design-versions/route.ts).
- Stripe payment lifecycle emails now trigger from [src/app/api/v1/webhooks/stripe/route.ts](../../../src/app/api/v1/webhooks/stripe/route.ts), with duplicate-send protection based on `stripe_charge_id` and `stripe_transfer_id`.
- Coverage was added in [tests/unit/services/email.service.test.ts](../../../tests/unit/services/email.service.test.ts), [tests/integration/proposals.test.ts](../../../tests/integration/proposals.test.ts), [tests/integration/design-versions.test.ts](../../../tests/integration/design-versions.test.ts), and [tests/integration/stripe-webhook.test.ts](../../../tests/integration/stripe-webhook.test.ts).
- Operational fallback behavior is documented in [docs/phase-5/operations/RUNBOOK.md](./RUNBOOK.md), and the required sender env vars are documented in [.env.example](../../../.env.example), [AGENTS.md](../../../AGENTS.md), and [CLAUDE.md](../../../CLAUDE.md).

Tasks:

- [x] `LR-07a` Define the minimum launch event set: proposal received, design submitted, payment confirmed/released.
- [x] `LR-07b` Add a small email service around Resend.
- [x] `LR-07c` Trigger emails from the relevant business events with failure-safe logging.
- [x] `LR-07d` Add tests and runbook notes for disabled-email fallback behavior.

Recommended commit sequence:

1. `test: add transactional email coverage`
2. `feat: send transactional marketplace emails`
3. `docs: record launch email operations`

### `LR-08` Resolve Auth Scope Drift

Objective:

- align the launch promise with the shipped auth surface

Evidence:

- The active contributor docs in [AGENTS.md](../../../AGENTS.md) and [CLAUDE.md](../../../CLAUDE.md) now define the v1 launch auth surface as Supabase Auth with email/password plus password reset only.
- The public-facing stack summary in [README.md](../../../README.md), the security posture in [SECURITY.md](../../../SECURITY.md) and [docs/phase-4/security/SECURITY.md](../../phase-4/security/SECURITY.md), and the architecture diagram in [docs/diagrams/system-architecture.mmd](../../diagrams/system-architecture.mmd) no longer promise Google OAuth or Magic Link for the current launch candidate.
- The product and launch trackers in [TODO.md](../../../TODO.md) and this document now record the decision to de-scope Google OAuth and Magic Link from v1 launch.

Tasks:

- [x] `LR-08a` Product decision: keep email/password only for launch, or add Google OAuth and/or Magic Link.
- [x] `LR-08b` If de-scoped, update product, security, and architecture docs.
- [x] `LR-08c` If in scope, implement and test the missing auth flows.

Decision:

- DentiVerse v1 launch scope is email/password plus password reset only.
- Google OAuth and Magic Link are intentionally de-scoped until a later product milestone reintroduces them.

Recommended commit sequence:

1. `docs: align launch auth scope`

### `LR-09` Run Preview Smoke Tests And Rollback Drill

Objective:

- validate the actual release path before launch

Evidence:

- GitHub repository environments `preview` and `production` now exist, and deploy secrets were populated so the `Deploy` workflow can evaluate preview and production jobs instead of failing at parse time.
- [.github/workflows/deploy.yml](../../../.github/workflows/deploy.yml) now validates deploy secrets in-job and uses `vercel deploy --prebuilt --archive=tgz` for both preview and production. The archive flag is required because the non-archived prebuilt upload path dropped dynamic route folders such as `[id]` during rehearsal.
- Preview CI run `23507861542` is now fully green in GitHub Actions, including `Deploy Preview`, after follow-up fixes in [next.config.ts](../../../next.config.ts), [Dockerfile](../../../Dockerfile), [src/services/email.service.ts](../../../src/services/email.service.ts), and the dashboard route move to [src/app/(dashboard)/dashboard/page.tsx](../../../src/app/%28dashboard%29/dashboard/page.tsx).
- Preview deployment `dpl_9mrkoSB8wceBsVjiw4EaUjBGLetv` at `https://dentiverse-js5txv6t5-h-amris-projects.vercel.app` reached `Ready`.
- Preview smoke via `vercel curl` confirmed the public shell on `/`, `/login`, and `/designers`, but `/api/v1/designers` returned `{"code":"INTERNAL_ERROR","message":"TypeError: fetch failed"}` because hosted runtime secrets still point at placeholder or local-only service values.
- Raw preview URL access returned `401` while preview protection was enabled, so rehearsal smoke required `vercel curl` or an authenticated browser session.
- Production deployments `dpl_C7R7GM1wSWdqaT2KFQ8pekPLmUKh` and `dpl_CQJyjThrMuE7JvVxDku2KNUizDS8` both reached `Ready`.
- `vercel rollback dentiverse-8prrdq2dl-h-amris-projects.vercel.app --yes` succeeded in about `6.66s` and rolled production traffic back to `dpl_C7R7GM1wSWdqaT2KFQ8pekPLmUKh`. Alias inspection was slightly inconsistent immediately after the command, so the healthy landing-page response was used as the source of truth for post-rollback validation.
- Hosted metadata still drifts when placeholder values are used. During rehearsal, some production HTML still rendered `NEXT_PUBLIC_APP_URL` as `http://localhost:3000`, which means the hosted environment is not yet launch-correct even though the shell deploys.

Tasks:

- [x] `LR-09a` Deploy a clean preview candidate.
- [x] `LR-09b` Run the smoke checklist from [RUNBOOK.md](./RUNBOOK.md).
- [x] `LR-09c` Trigger one rollback rehearsal and record timings and steps.
- [x] `LR-09d` Update this doc with the result and any follow-up blockers.

Follow-up blockers handed to `LR-10`:

- Replace placeholder Vercel runtime secrets with real cloud values for Supabase, Stripe, Resend, Sentry, and `NEXT_PUBLIC_APP_URL`.
- Re-run hosted preview smoke against at least one data-backed route after the real envs are present.
- Re-run hosted Sentry smoke tests against the preview deployment with the real DSN and record the event IDs.

### `LR-10` Final Launch Sign-Off And Doc Lock

Objective:

- avoid drifting back into “green in docs, red in code”

Tasks:

- `LR-10a` Confirm all exit criteria are met.
- `LR-10b` Mark completed launch items in [TODO.md](../../../TODO.md).
- `LR-10c` Freeze launch docs to the final shipped behavior.
- `LR-10d` Record the launch SHA, deployment ID, and operator checklist location.

Blockers:

- Hosted preview and production deployments are still using placeholder or local-only runtime values, so data-backed smoke tests do not yet pass from Vercel.
- Final sign-off cannot happen until the hosted `NEXT_PUBLIC_APP_URL` and third-party service credentials match the real launch environment.

---

## Open Decisions

| ID     | Decision                                             | Owner   | Status | Notes                                                                                                                                        |
| ------ | ---------------------------------------------------- | ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `D-01` | Where auth rate limiting should live                 | Shared  | `DONE` | Current launch candidate uses an app-route wrapper with an in-memory store; move to an external shared store before broader horizontal scale |
| `D-02` | Whether launch needs a real admin UI                 | Shared  | `DONE` | Chosen v1 path is manual ops for a controlled launch; no in-product admin UI ships before launch                                             |
| `D-03` | Whether Google OAuth and Magic Link are launch scope | Product | `DONE` | Chosen v1 path is email/password plus password reset only; Google OAuth and Magic Link are explicitly de-scoped from launch                  |

---

## Audit Evidence Pointers

These are the core files that justified the current backlog:

- [src/lib/database.types.ts](../../../src/lib/database.types.ts)
- [src/app/api/v1/auth/register/route.ts](../../../src/app/api/v1/auth/register/route.ts)
- [src/lib/supabase/server.ts](../../../src/lib/supabase/server.ts)
- [src/lib/supabase/middleware.ts](../../../src/lib/supabase/middleware.ts)
- [src/middleware.ts](../../../src/middleware.ts)
- [src/app/error.tsx](../../../src/app/error.tsx)
- [src/app/api/v1/webhooks/stripe/route.ts](../../../src/app/api/v1/webhooks/stripe/route.ts)
- [src/services/audit.service.ts](../../../src/services/audit.service.ts)
- [playwright.config.ts](../../../playwright.config.ts)
- [docs/phase-4/security/SECURITY.md](../../phase-4/security/SECURITY.md)
- [docs/phase-5/observability/LOGGING_STRATEGY.md](../observability/LOGGING_STRATEGY.md)

---

## Session Notes

### 2026-03-24

- Created this launch backlog from the latest production-readiness audit.
- Declared `LR-01` as the next required engineering task.
- Linked this document from [TODO.md](../../../TODO.md) and the Phase 5 docs so future sessions can resume from one place.
- Completed `LR-01`: regenerated [src/lib/database.types.ts](../../../src/lib/database.types.ts) from local Supabase, introduced the shared [src/lib/supabase/types.ts](../../../src/lib/supabase/types.ts) contract, normalized Supabase factory and service typing, and fixed nullable designer rating call sites.
- Verification commands:
  - `npm.cmd run typecheck`
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run build`
- Result: release health is restored. Remaining launch blockers are now `LR-02` onward, plus the known non-fatal Next standalone traced-file copy warning during build.
- Completed `LR-02`: committed the release candidate as `0dae88681d4ae0fabd811e9c708735c251606752`, including the Phase 5 IaC/docs/workflow assets, design-version file-reference hardening, and the Supabase typing recovery. The only remaining local dirt is the unrelated `.claude/worktrees/eager-boyd` change, which is intentionally excluded from the candidate.
- Completed `LR-03`: added app-layer auth abuse protection with configurable route throttling and failed-login lockout for `login`, `forgot-password`, and `refresh`, plus integration and unit coverage for throttled and recovery paths.
- `LR-03` verification commands:
  - `npm.cmd test -- tests/unit/lib/auth-abuse.test.ts tests/integration/auth.test.ts tests/integration/auth-refresh.test.ts`
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run build`
- `LR-03` result: auth abuse protection is now active and verified. `check`, `test`, and `build` all pass; the pre-existing non-fatal Next standalone traced-file copy warning remains unchanged.
- Completed `LR-04`: wired Sentry runtime initialization, structured server logging, and request-correlated error reporting across auth routes, the Stripe webhook, the global error boundary, and audit fallback paths.
- `LR-04` verification commands:
  - `npm.cmd test -- tests/unit/lib/observability/server.test.ts tests/unit/services/audit.service.test.ts tests/integration/auth.test.ts tests/integration/auth-refresh.test.ts`
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run build`
- `LR-04` result: observability wiring is now active and verified. `check`, `test`, and `build` all pass; `npm run build` now also emits non-fatal `@sentry/nextjs` OpenTelemetry warnings alongside the pre-existing standalone traced-file copy warning.
- Completed `LR-05`: stabilized the Playwright release gate with a dedicated E2E port, shared runtime config, updated auth/designer protection assertions, and CI browser installation plus E2E execution in the deploy workflow.
- `LR-05` verification commands:
  - `npm.cmd test -- tests/unit/lib/playwright-config.test.ts`
  - `npm.cmd run test:e2e`
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run build`
- `LR-05` result: local `npm run test:e2e` now passes reliably on Chromium using the dedicated Playwright server at `127.0.0.1:3100`, while CI is configured to install Chromium, Firefox, and WebKit before running the suite.
- Completed `LR-06`: selected the v1 manual-ops path for admin work, documented the operator roles and reversible procedures for support, moderation, disputes, and refunds, and removed the architecture-level promise of a shipped admin panel.
- `LR-06` verification commands:
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run test:e2e`
  - `npm.cmd run build`
- `LR-06` result: support, refund, and moderation operations now have an explicit owner model and runbook path; the next launch blocker is `LR-07` for transactional email.
- Completed `LR-07`: added Resend-backed transactional delivery for proposal-received, design-submitted, payment-confirmed, and payment-released events, plus safe skip/failure logging and duplicate-send guards in the Stripe webhook flow.
- `LR-07` verification commands:
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run test:e2e`
  - `npm.cmd run build`
- `LR-07` result: transactional email is now part of the launch candidate, all release gates remain green, and the next blocker is `LR-08` for the launch auth-scope decision.
- Completed `LR-08`: de-scoped Google OAuth and Magic Link from the v1 launch candidate, updated the active contributor, security, and architecture docs to email/password plus password reset only, and closed decision `D-03`.
- `LR-08` verification commands:
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run test:e2e`
  - `npm.cmd run build`
- `LR-08` result: launch-facing auth docs now match the shipped runtime auth surface, and the next blocker is `LR-09` for preview smoke tests and rollback rehearsal.
- Completed `LR-09`: fixed the invalid deploy workflow conditions, linked the repo to Vercel, created preview and production GitHub environments plus deploy secrets, ran real preview and production prebuilt deploy rehearsals, and validated rollback behavior with a production alias rollback drill.
- `LR-09` verification commands:
  - `gh auth status`
  - `gh run list --workflow deploy.yml --limit 5`
  - `cmd /c npx vercel link --yes --team h-amris-projects --project dentiverse`
  - `gh secret list`
  - `npm.cmd run check`
  - `cmd /c npx vercel build --target=preview --yes`
  - `cmd /c npx vercel deploy --prebuilt --archive=tgz --target=preview --yes --no-wait --logs --scope h-amris-projects`
  - `cmd /c npx vercel inspect dentiverse-js5txv6t5-h-amris-projects.vercel.app --wait --timeout 180s --scope h-amris-projects`
  - `cmd /c npx vercel curl / --deployment https://dentiverse-js5txv6t5-h-amris-projects.vercel.app --scope h-amris-projects`
  - `cmd /c npx vercel curl /api/v1/designers --deployment https://dentiverse-js5txv6t5-h-amris-projects.vercel.app --scope h-amris-projects`
  - `cmd /c npx vercel build --prod --yes`
  - `cmd /c npx vercel deploy --prebuilt --archive=tgz --prod --yes --no-wait --logs --scope h-amris-projects`
  - `Measure-Command { cmd /c npx vercel rollback dentiverse-8prrdq2dl-h-amris-projects.vercel.app --yes }`
- `LR-09` result: the deploy and rollback procedures are now rehearsed and documented, but final launch sign-off remains blocked until hosted runtime config is replaced with real cloud values and the preview smoke test passes on data-backed routes.
- `LR-09` local gate note: run `npm.cmd test`, `npm.cmd run build`, and `npm.cmd run test:e2e` sequentially when re-checking release health. Parallel runs produced false negatives because Vitest, Next build, and the Playwright dev server contended for the same workspace artifacts.
- `LR-09` follow-up verification commands:
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run build`
  - `npm.cmd run test:e2e`
  - `cmd /c npx vercel build --target=preview --yes`
  - `docker build -t dentiverse-lr09-check .`
  - `gh run watch 23507861542 --exit-status`
- `LR-09` follow-up result: PR #3 is now fully green in GitHub Actions. `Deploy Preview` passes after scoping standalone output to Docker builds, lazy-loading Resend so env-less build phases do not crash, and moving the authenticated dashboard home from the conflicting root route to `/dashboard`.
- Continued `LR-10` hardening locally: public marketplace pages and auth pages no longer depend on middleware auth refresh, and the public designer APIs now return `503 SERVICE_UNAVAILABLE` instead of raw `500` responses when Supabase connectivity is unavailable.
- `LR-10` local hardening verification commands:
  - `npm.cmd test -- tests/unit/middleware.test.ts tests/integration/designers.test.ts`
  - `npm.cmd run check`
  - `npm.cmd test`
  - `npm.cmd run build`
  - `npm.cmd run test:e2e`
- `LR-10` local hardening result: regression coverage now protects the public-route failure path, and all local release gates are green again (`340` tests, `11` E2E specs). Final launch sign-off is still blocked on deploying the fix with real hosted runtime values and rerunning production smoke on `/login`, `/designers`, and `/api/v1/designers`.
