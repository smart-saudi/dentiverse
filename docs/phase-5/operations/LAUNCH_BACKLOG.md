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

| Gate                          | Current State        | Last Evidence                                                                                                                                                                            |
| ----------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`               | Passing              | `npm.cmd run check` passed on 2026-03-24 after regenerating DB types and normalizing shared Supabase client typing                                                                       |
| `npm test`                    | Passing              | `npm.cmd test` passed with `322` tests green on 2026-03-24                                                                                                                               |
| `npm run build`               | Passing with warning | `npm.cmd run build` passed on 2026-03-24; standalone traced-file copy warning for `(dashboard)/page_client-reference-manifest.js` remains non-fatal                                      |
| `npm run test:e2e`            | Failing              | Playwright timed out because port `3000` was already occupied                                                                                                                            |
| Release candidate cleanliness | Passing              | Launch-ready changes were committed in `0dae88681d4ae0fabd811e9c708735c251606752`; only unrelated local `.claude/worktrees/eager-boyd` dirt remains                                      |
| Observability wiring          | Incomplete           | Docs present, Sentry runtime integration absent                                                                                                                                          |
| Auth abuse protection         | Passing              | Auth throttling and login lockout now live in [src/lib/auth-abuse.ts](../../../src/lib/auth-abuse.ts), with coverage in `auth.test.ts`, `auth-refresh.test.ts`, and `auth-abuse.test.ts` |
| Admin operations model        | Incomplete           | Diagram mentions admin panel, app has no admin surface                                                                                                                                   |
| Transactional email           | Incomplete           | `resend` dependency exists, no runtime usage under `src/`                                                                                                                                |

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
| `LR-04` | Wire production observability | `P1`     | Shared | `TODO` | `LR-01`    | Sentry and structured logs receive real runtime errors          |
| `LR-05` | Make E2E validation reliable  | `P1`     | App    | `TODO` | `LR-01`    | Playwright runs clean locally and in CI                         |

### Wave 3: Operational Launch Gaps

| ID      | Title                                          | Priority | Owner   | Status | Depends On | Success Signal                                                          |
| ------- | ---------------------------------------------- | -------- | ------- | ------ | ---------- | ----------------------------------------------------------------------- |
| `LR-06` | Define and implement the admin operating model | `P1`     | Shared  | `TODO` | `LR-02`    | Support, refunds, and moderation have an owned operational path         |
| `LR-07` | Implement transactional email                  | `P2`     | App     | `TODO` | `LR-02`    | Proposal, design, and payment email flows work in non-local envs        |
| `LR-08` | Resolve auth scope drift                       | `P2`     | Product | `TODO` | `LR-02`    | OAuth/Magic Link are either implemented or explicitly de-scoped in docs |

### Wave 4: Go-Live Validation

| ID      | Title                                      | Priority | Owner  | Status | Depends On                         | Success Signal                                         |
| ------- | ------------------------------------------ | -------- | ------ | ------ | ---------------------------------- | ------------------------------------------------------ |
| `LR-09` | Run preview smoke tests and rollback drill | `P1`     | Shared | `TODO` | `LR-02`, `LR-03`, `LR-04`, `LR-05` | Preview and rollback runbooks are validated end-to-end |
| `LR-10` | Final launch sign-off and doc lock         | `P1`     | Shared | `TODO` | `LR-06`, `LR-07`, `LR-08`, `LR-09` | Docs, tracker, and release candidate all agree         |

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

Tasks:

- `LR-04a` Install and configure Sentry for Next.js runtime paths.
- `LR-04b` Add a small structured logger utility for API routes and webhooks.
- `LR-04c` Replace raw `console.error` fallback paths where runtime observability is required.
- `LR-04d` Add request correlation metadata for route and webhook failures.
- `LR-04e` Update the runbook with smoke-test steps for Sentry validation.

Recommended commit sequence:

1. `chore: install sentry runtime support`
2. `feat: wire structured error reporting`
3. `docs: update observability runbook`

### `LR-05` Make E2E Validation Reliable

Objective:

- make browser-level validation part of the real release gate

Tasks:

- `LR-05a` Fix [playwright.config.ts](../../../playwright.config.ts) so the base URL and web server stay aligned even when the default port is taken.
- `LR-05b` Stabilize any selectors or setup assumptions needed for auth and dashboard flows.
- `LR-05c` Run E2E locally against a clean environment and document prerequisites.
- `LR-05d` Add E2E validation expectations to the launch checklist.

Recommended commit sequence:

1. `test: stabilize playwright server configuration`
2. `test: harden critical e2e flows`
3. `docs: document e2e release gate`

### `LR-06` Define And Implement The Admin Operating Model

Objective:

- make support, refunds, and moderation operationally safe

Tasks:

- `LR-06a` Decide whether launch uses a minimal admin UI or a documented manual-ops flow.
- `LR-06b` If manual for v1, update [docs/phase-5/operations/RUNBOOK.md](./RUNBOOK.md) with exact procedures and permissions.
- `LR-06c` If UI is required, create the minimum admin routes and guarded actions needed for launch.
- `LR-06d` Remove or update any architecture docs that over-promise beyond the chosen v1 path.

### `LR-07` Implement Transactional Email

Objective:

- deliver critical marketplace state changes outside the browser

Tasks:

- `LR-07a` Define the minimum launch event set: proposal received, design submitted, payment confirmed/released.
- `LR-07b` Add a small email service around Resend.
- `LR-07c` Trigger emails from the relevant business events with failure-safe logging.
- `LR-07d` Add tests and runbook notes for disabled-email fallback behavior.

### `LR-08` Resolve Auth Scope Drift

Objective:

- align the launch promise with the shipped auth surface

Tasks:

- `LR-08a` Product decision: keep email/password only for launch, or add Google OAuth and/or Magic Link.
- `LR-08b` If de-scoped, update product, security, and architecture docs.
- `LR-08c` If in scope, implement and test the missing auth flows.

### `LR-09` Run Preview Smoke Tests And Rollback Drill

Objective:

- validate the actual release path before launch

Tasks:

- `LR-09a` Deploy a clean preview candidate.
- `LR-09b` Run the smoke checklist from [RUNBOOK.md](./RUNBOOK.md).
- `LR-09c` Trigger one rollback rehearsal and record timings and steps.
- `LR-09d` Update this doc with the result and any follow-up blockers.

### `LR-10` Final Launch Sign-Off And Doc Lock

Objective:

- avoid drifting back into “green in docs, red in code”

Tasks:

- `LR-10a` Confirm all exit criteria are met.
- `LR-10b` Mark completed launch items in [TODO.md](../../../TODO.md).
- `LR-10c` Freeze launch docs to the final shipped behavior.
- `LR-10d` Record the launch SHA, deployment ID, and operator checklist location.

---

## Open Decisions

| ID     | Decision                                             | Owner   | Status | Notes                                                                                                                                        |
| ------ | ---------------------------------------------------- | ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `D-01` | Where auth rate limiting should live                 | Shared  | `DONE` | Current launch candidate uses an app-route wrapper with an in-memory store; move to an external shared store before broader horizontal scale |
| `D-02` | Whether launch needs a real admin UI                 | Shared  | `TODO` | Manual ops may be acceptable for a controlled launch                                                                                         |
| `D-03` | Whether Google OAuth and Magic Link are launch scope | Product | `TODO` | Current runtime is email/password only                                                                                                       |

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
