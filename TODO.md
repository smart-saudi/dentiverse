# DentiVerse â€” Development Task Tracker

> **Read this at the start of every Claude Code session.**
> Move tasks between sections as work progresses.
> Last updated: 2026-03-24

> Launch-readiness work is now tracked in [docs/phase-5/operations/LAUNCH_BACKLOG.md](docs/phase-5/operations/LAUNCH_BACKLOG.md). Read that file after this one whenever the goal is release readiness.

---

## ðŸ“Š Progress Summary

| Milestone                     | Tasks | Done | Progress                            |
| ----------------------------- | ----- | ---- | ----------------------------------- |
| M0: Project Setup             | 8     | 8    | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M1: Auth & Users              | 10    | 10   | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M2: Case Management           | 12    | 12   | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M3: Designer Marketplace      | 8     | 8    | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M4: Proposals & Matching      | 8     | 8    | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M5: Design Review & 3D        | 6     | 6    | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M6: Payments & Escrow         | 8     | 8    | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M7: Messaging & Notifications | 6     | 6    | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M8: Polish & Launch           | 6     | 6    | â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ 100% |
| M9: Launch Readiness          | 10    | 6    | 60%                                 |

---

## ðŸ”´ Blocked

_(Tasks that cannot proceed due to a dependency or decision needed)_

- **M0-3** Set up Supabase project (local dev + cloud). Run `schema.sql`. â€” _User must run locally_
- **M0-4** Configure `.env.local` with real keys â€” _User must set up locally_

---

## ðŸŸ¡ In Progress

_(Tasks currently being worked on)_

_(none)_

---

## â¬œ Up Next

_(Prioritized backlog â€” work on these next, in order)_

- **M9-LR-06** Define the admin operating model once the safety gates above are in place.
- **M9-LR-07** Implement transactional email after the safety and operations blockers are closed.
- **M9-LR-08** Resolve the launch auth-scope decision after operations ownership is clear.

---

## âœ… Done

_(Completed tasks â€” move here when finished with date)_

### Phase 1: Foundation & Definition

- [x] **P1-1** PRD Light (problem, solution, UVP, competitors, metrics) â€” 2026-03-22
- [x] **P1-2** User Personas (4 personas, 2 demand + 2 supply) â€” 2026-03-22
- [x] **P1-3** Technical Specification (stack, architecture) â€” 2026-03-22
- [x] **P1-4** User Flow Diagrams (client + designer) â€” 2026-03-22
- [x] **P1-5** Entity Relationship Diagram â€” 2026-03-22

### Phase 2: Architecture & Design

- [x] **P2-1** System Architecture Diagram â€” 2026-03-22
- [x] **P2-2** Database Schema (schema.sql, 10 tables, RLS, triggers) â€” 2026-03-22
- [x] **P2-3** API Contract (openapi.yaml, 40+ endpoints) â€” 2026-03-22
- [x] **P2-4** Design System (colors, typography, components) â€” 2026-03-22
- [x] **P2-5** Payment/Escrow Flow Diagram â€” 2026-03-22
- [x] **P2-6** Dashboard Wireframes (client + designer) â€” 2026-03-22

### Phase 5: Deployment & Operations

- [x] **P5-1** Infrastructure as Code â€” Dockerfile, docker-compose, Terraform, GitHub Actions deploy pipeline â€” 2026-03-24
- [x] **P5-2** Observability â€” logging strategy and SLA/SLO documents â€” 2026-03-24
- [x] **P5-3** Deployment & Launch â€” runbook and rollback playbook â€” 2026-03-24

### Phase 6: Launch Readiness

- [x] **M9-LR-00** Create launch-readiness backlog and verification flow â€” 2026-03-24
- [x] **M9-LR-01** Fix Supabase typing regression and restore green `check`/`build` - 2026-03-24
- [x] **M9-LR-02** Cut a clean, committed release candidate - 2026-03-24 (`0dae886`)
- [x] **M9-LR-03** Add auth abuse protection - 2026-03-24
- [x] **M9-LR-04** Wire Sentry and structured runtime logging - 2026-03-24
- [x] **M9-LR-05** Make Playwright E2E validation reliable - 2026-03-24
- [ ] **M9-LR-06** Define and implement the admin operating model
- [ ] **M9-LR-07** Implement transactional email
- [ ] **M9-LR-08** Resolve Google OAuth / Magic Link scope drift
- [ ] **M9-LR-09** Run preview smoke tests and rollback rehearsal
- [ ] **M9-LR-10** Final launch sign-off and doc lock

### M0: Project Setup

- [x] **M0-1** Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router â€” 2026-03-22
- [x] **M0-2** Install and configure 14 shadcn/ui components â€” 2026-03-22
- [x] **M0-3** Set up Supabase project â€” _Configs created; user must run locally_ â€” 2026-03-22
- [x] **M0-4** Configure environment variables â€” _`.env.example` created; user sets `.env.local`_ â€” 2026-03-22
- [x] **M0-5** Set up Vitest + Testing Library + Playwright â€” _Configs created; `vitest.config.ts`, `tests/helpers/setup.ts`_ â€” 2026-03-23
- [x] **M0-6** Set up ESLint + Prettier + husky + lint-staged + commitlint â€” 2026-03-23
- [x] **M0-7** Create layout components: sidebar, header, footer, mobile-nav, dashboard shell â€” 2026-03-22
- [x] **M0-8** Generate `database.types.ts`, set up Supabase clients (client, server, admin, middleware) â€” 2026-03-22

### M1: Auth & Users

- [x] **M1-1** `TEST:` Auth validation schema tests (26 tests) â€” 2026-03-23
- [x] **M1-2** `IMPL:` Zod schemas: `registerSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema` â€” 2026-03-23
- [x] **M1-3** `TEST:` Auth service tests (14 tests) â€” 2026-03-23
- [x] **M1-4** `IMPL:` `AuthService` class (register, login, logout, forgotPassword, resetPassword, getCurrentUser) â€” 2026-03-23
- [x] **M1-5** `TEST:` Auth API integration tests (15 tests) â€” 2026-03-23
- [x] **M1-6** `IMPL:` 5 API routes: register, login, logout, forgot-password, reset-password â€” 2026-03-23
- [x] **M1-7** `IMPL:` Auth pages: login, register (role selection), forgot-password â€” 2026-03-23
- [x] **M1-8** `IMPL:` Root middleware: session refresh, route protection, auth redirects â€” 2026-03-23
- [x] **M1-9** `IMPL:` Settings hub page, profile edit page, `GET/PATCH /api/v1/users/me` â€” 2026-03-23
- [x] **M1-10** `IMPL:` `useAuth` hook + `useAuthStore` Zustand store â€” 2026-03-23

### M2: Case Management

- [x] **M2-1** `TEST:` Case validation schema tests (28 tests) â€” 2026-03-23
- [x] **M2-2** `IMPL:` Zod schemas: `createCaseSchema`, `updateCaseSchema`, `caseListQuerySchema` â€” 2026-03-23
- [x] **M2-3** `TEST:` Case service tests (11 tests) â€” 2026-03-23
- [x] **M2-4** `IMPL:` `CaseService` class (create, get, update, publish, cancel, list) â€” 2026-03-23
- [x] **M2-5** `TEST:` Case API integration tests (10 tests) â€” 2026-03-23
- [x] **M2-6** `IMPL:` API routes: POST/GET /cases, GET/PATCH /cases/[id], publish, cancel â€” 2026-03-23
- [x] **M2-7** `IMPL:` `case-card.tsx` with status badge, type, teeth, budget, deadline â€” 2026-03-23
- [x] **M2-8** `IMPL:` `case-status-badge.tsx` and `case-status-timeline.tsx` â€” 2026-03-23
- [x] **M2-9** `IMPL:` `tooth-chart.tsx` â€” interactive FDI tooth selector (4 quadrants) â€” 2026-03-23
- [x] **M2-10** `IMPL:` Case list page with status filters and pagination â€” 2026-03-23
- [x] **M2-11** `IMPL:` Multi-step case creation form (Detailsâ†’Teethâ†’Budgetâ†’Review) â€” 2026-03-23
- [x] **M2-12** `IMPL:` Case detail page with timeline, details, tooth chart, actions â€” 2026-03-23

### M3: Designer Marketplace

- [x] **M3-1** `TEST:` Designer validation schema tests (26 tests) â€” 2026-03-23
- [x] **M3-2** `IMPL:` Zod schemas: `createDesignerProfileSchema`, `updateDesignerProfileSchema`, `designerSearchQuerySchema` â€” 2026-03-23
- [x] **M3-3** `TEST:` Designer service tests (9 tests) â€” 2026-03-23
- [x] **M3-4** `IMPL:` `DesignerService` class + API routes: GET /designers, GET /designers/[id], GET/PATCH /designers/me â€” 2026-03-23
- [x] **M3-5** `IMPL:` `designer-card.tsx` with rating, skills, availability â€” 2026-03-23
- [x] **M3-6** `IMPL:` `designer-search-filters.tsx` (specialization, software, sort) â€” 2026-03-23
- [x] **M3-7** `IMPL:` Designer browse/search page with filters and pagination â€” 2026-03-23
- [x] **M3-8** `IMPL:` Designer public profile page (bio, stats, skills, certifications, portfolio) â€” 2026-03-23

### M4: Proposals & Matching

- [x] **M4-1** `TEST:` Proposal validation schema tests (13 tests) â€” 2026-03-23
- [x] **M4-2** `IMPL:` Zod schemas: `createProposalSchema`, `proposalListQuerySchema` â€” 2026-03-23
- [x] **M4-3** `TEST:` Proposal service tests (7 tests) + integration tests (6 tests) â€” 2026-03-23
- [x] **M4-4** `IMPL:` `ProposalService` + API routes: POST/GET /cases/[id]/proposals, accept, reject, GET /proposals/me â€” 2026-03-23
- [x] **M4-5** `IMPL:` `proposal-card.tsx` with status badge and accept/reject actions â€” 2026-03-23
- [x] **M4-6** `IMPL:` `proposal-form.tsx` for designers to submit proposals â€” 2026-03-23
- [x] **M4-7** `IMPL:` Added proposal list + form to case detail page â€” 2026-03-23
- [x] **M4-8** `IMPL:` My Proposals page with status filters and pagination â€” 2026-03-23

### M5: Design Review & 3D Viewer

- [x] **M5-1** `IMPL:` `file-uploader.tsx` â€” drag-drop uploader with progress and file list â€” 2026-03-23
- [x] **M5-2** `IMPL:` File upload API: POST /files with type/size validation, Supabase Storage â€” 2026-03-23
- [x] **M5-3** `IMPL:` `stl-viewer.tsx` â€” Canvas wireframe renderer with rotate/zoom/pan â€” 2026-03-23
- [x] **M5-4** `IMPL:` Design version submission flow (DesignVersionSubmit + API) â€” 2026-03-23
- [x] **M5-5** `IMPL:` Approve/revision-request flow (DesignVersionHistory + review API) â€” 2026-03-23
- [x] **M5-6** `IMPL:` Design version history UI with status badges, file links, 3D preview â€” 2026-03-23

### M6: Payments & Escrow

- [x] **M6-1** `IMPL:` Stripe client factory + webhook signature verification â€” 2026-03-23
- [x] **M6-2** `TEST:` Payment validation schema tests (12 tests) + service tests (6 tests) â€” 2026-03-23
- [x] **M6-3** `IMPL:` `PaymentService` â€” create, hold, release, refund, list with 12% platform fee â€” 2026-03-23
- [x] **M6-4** `IMPL:` Stripe webhook handler: payment_intent.succeeded/failed, transfer.created, charge.refunded â€” 2026-03-23
- [x] **M6-5** `IMPL:` Payment API routes: POST/GET /payments, GET /payments/[id] â€” 2026-03-23
- [x] **M6-6** `TEST:` Payment integration tests (5 tests) â€” 2026-03-23
- [x] **M6-7** `IMPL:` Payment history page with status filters and pagination â€” 2026-03-23
- [x] **M6-8** `IMPL:` Designer earnings/payout dashboard with summary cards â€” 2026-03-23

### M7: Messaging & Notifications

- [x] **M7-1** `IMPL:` MessageService â€” send, list (paginated), markAsRead + Zod schemas â€” 2026-03-23
- [x] **M7-2** `IMPL:` NotificationService â€” create, list, markAsRead, markAllAsRead, getUnreadCount â€” 2026-03-23
- [x] **M7-3** `IMPL:` API routes: messages (POST/GET), notifications (GET, read, read-all, unread-count) â€” 2026-03-23
- [x] **M7-4** `IMPL:` useRealtime hook + useMessages hook with Supabase Realtime subscriptions â€” 2026-03-23
- [x] **M7-5** `IMPL:` ChatThread component + integrated into case detail page â€” 2026-03-23
- [x] **M7-6** `IMPL:` NotificationBell dropdown in header + full notifications page â€” 2026-03-23

### M8: Polish & Launch Prep

- [x] **M8-1** `IMPL:` Landing page â€” hero, 6 feature cards, how-it-works, CTA sections â€” 2026-03-23
- [x] **M8-2** `IMPL:` Error boundary (error.tsx) + custom 404 page (not-found.tsx) â€” 2026-03-23
- [x] **M8-3** `IMPL:` Vercel Analytics + Speed Insights in root layout â€” 2026-03-23
- [x] **M8-4** `IMPL:` SEO: enhanced metadata, Twitter cards, sitemap.ts, robots.ts â€” 2026-03-23
- [x] **M8-5** `E2E:` Playwright E2E test specs: auth, case creation, designer flow â€” 2026-03-23
- [x] **M8-6** `IMPL:` Responsive mobile-first audit â€” all pages use responsive patterns â€” 2026-03-23

---

## ðŸ“ Session Log

> Brief notes from each development session for context continuity.

| Date       | Session | What was done                                                                                                                                                                                                                                                                                                                                                                                     | Next up                                                         |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 2026-03-22 | #1      | Phase 1 + 2 + 3 planning complete                                                                                                                                                                                                                                                                                                                                                                 | Start M0: Project scaffolding                                   |
| 2026-03-22 | #2      | M0-1 scaffolding, M0-2 shadcn/ui (14 components), M0-7 layout components, M0-8 Supabase clients + types                                                                                                                                                                                                                                                                                           | M0-6, M1                                                        |
| 2026-03-23 | #3      | M0-5/6 test infra + git hooks, M1-1 to M1-10 auth complete (82 tests passing). Created: auth schemas, service, 5 API routes, middleware, auth pages, useAuth hook, auth store, settings/profile pages, error classes, constants, utils                                                                                                                                                            | M2: Case Management                                             |
| 2026-03-23 | #4      | M2-1 to M2-12 case management complete (131 tests passing). Created: case Zod schemas, CaseService, 4 API routes, case-card, status-badge, status-timeline, tooth-chart, case list/create/detail pages                                                                                                                                                                                            | M3: Designer Marketplace                                        |
| 2026-03-23 | #5      | M3 designer marketplace (174 tests), M4 proposals (200 tests), M5 design review & 3D (227 tests). Created: designer/proposal/design-version schemas+services+APIs, file upload, STL viewer, design version history, all UI components and pages                                                                                                                                                   | M6: Payments & Escrow                                           |
| 2026-03-23 | #6      | M6 payments & escrow (250 tests). Created: Stripe client/webhook, payment validation schemas, PaymentService (escrow flow), webhook handler, payment API routes, payment history page, designer earnings dashboard                                                                                                                                                                                | M7: Messaging & Notifications                                   |
| 2026-03-23 | #7      | M7 messaging & notifications (292 tests). Created: message/notification schemas+services+APIs, useRealtime hook, ChatThread with realtime updates, NotificationBell dropdown, notifications page                                                                                                                                                                                                  | M8: Polish & Launch                                             |
| 2026-03-23 | #8      | M8 polish & launch prep. Created: landing page, error boundary, 404 page, Vercel Analytics, SEO (sitemap, robots, meta), Playwright E2E specs, responsive audit. **ALL MILESTONES COMPLETE** (292 unit/integration tests)                                                                                                                                                                         | Production deployment                                           |
| 2026-03-23 | #9      | Repo audit: reviewed README/CLAUDE/SECURITY against codebase, verified stack/scripts, and identified drift between docs and implementation (diagram path references differ from actual `docs/diagrams` location, custom canvas STL viewer, public file URL usage). Current health check: `npm.cmd run check` fails on TypeScript test errors and `npm.cmd test` has 2 notification-read failures. | Align docs with code and fix notification/typecheck regressions |
| 2026-03-24 | #10     | Security hardening: IDOR fixes, role checks, bucket allowlist, signed URLs. Fixed 43 tsc errors (mock typing), Prettier formatting. Merged PR #1.                                                                                                                                                                                                                                                 | Gap map remediation                                             |
| 2026-03-24 | #11     | Gap map remediation â€” closed API contract drift. Implemented 8 missing OpenAPI endpoints: approve design, request revision, signed-url, create-intent, dashboard stats, auth refresh, public user profile, mark-messages-read. Added review system (validation, service, 2 routes). All checks green (294 tests).                                                                               | Audit log writes, frontend stack (Three.js/Uppy)                |
| 2026-03-24 | #12     | Audit log writes â€” AuditService with admin client, extractRequestMeta helper, audit writes on 10 critical actions (case publish/cancel/approve/revision, proposal accept/reject, payment create/intent, review create, design version submit). 6 new tests, 300 total passing.                                                                                                                  | Frontend stack (Three.js STL viewer, Uppy file upload)          |
| 2026-03-24 | #13     | Verified `main` regressions were already resolved (`npm.cmd run check`, payment tests, full suite all green), then refined GAP-2 after PR #2 by upgrading the STL viewer controls/loading flow and marking the backlog accordingly.                                                                                                                                                               | GAP-3 Uppy uploader                                             |

| 2026-03-24 | #15 | GAP-4 integration coverage complete. Added 6 focused integration test files covering auth refresh, case approve/request-revision, files signed-url, messages read, payment create-intent, and users dashboard/profile routes. Full repo health is green at 313 tests passing. | Monitor remaining file-reference follow-up |
| 2026-03-24 | #16 | Design version file references hardened end-to-end. Design version submissions now store stable `{ bucket, path, name, size, type }` references instead of expiring signed URLs, and design version reads mint fresh signed URLs on demand while preserving backward compatibility for older rows. Refreshed local dependencies after syncing `main`. Full repo health is green at 315 tests passing. | No remaining backlog from the signed-URL follow-up |
| 2026-03-24 | #17 | Phase 5 deployment and operations assets added. Created Dockerfile, docker-compose, Terraform scaffolding, GitHub Actions deploy workflow, observability docs, SLA/SLO, and a production runbook. Verified `npm.cmd run check`, `npm.cmd test`, `npm.cmd run build`, `docker compose config`, and a Docker image smoke test with local runtime env. | Optional next step: wire Sentry SDK into runtime and add Terraform validation to local tooling |
| 2026-03-24 | #18 | Re-audited launch readiness against the current workspace, found the repo is not launch-ready, and created `docs/phase-5/operations/LAUNCH_BACKLOG.md` as the living tracker for blockers, owners, sequence, and evidence. Recorded the next required task as `LR-01`: restore green release health by fixing the Supabase typing regression. | Start `LR-01` and update the launch backlog as each commit-sized task lands |
| 2026-03-24 | #19 | Completed `LR-01` launch recovery. Regenerated `src/lib/database.types.ts`, introduced the shared `src/lib/supabase/types.ts` contract, normalized Supabase factory and service typing, fixed the last nullable designer rating call sites, and restored green `npm.cmd run check`, `npm.cmd test`, and `npm.cmd run build`. | Start `LR-02` by cutting a clean, committed release candidate |
| 2026-03-24 | #20 | Completed `LR-02` by separating the launch candidate from unrelated local dirtiness and committing the current release-ready repo state as `0dae886` (`chore: commit launch-readiness changes`). The candidate now includes Phase 5 IaC/docs/workflow assets, stable design-version file references, and the Supabase typing recovery. | Start `LR-03` with auth abuse protection |
| 2026-03-24 | #21 | Completed `LR-03` auth abuse protection. Added configurable route throttling and failed-login lockout in `src/lib/auth-abuse.ts`, protected the `login`, `forgot-password`, and `refresh` routes, documented the config in `.env.example` and `docs/phase-4/security/SECURITY.md`, and added unit/integration coverage for throttling and recovery paths. Verified `npm.cmd run check`, `npm.cmd test` (`322` passing), and `npm.cmd run build`. | Start `LR-04` for runtime observability |
| 2026-03-24 | #22 | Completed `LR-04` observability wiring. Installed `@sentry/nextjs`, added runtime init files plus shared structured logging/error-capture helpers, and wired request-correlated reporting into the global error boundary, Stripe webhook, audit fallback, and auth routes. Verified `npm.cmd run check`, `npm.cmd test` (`325` passing), and `npm.cmd run build`. | Start `LR-05` to stabilize the Playwright release gate |
| 2026-03-24 | #23 | Completed `LR-05` E2E gate stabilization. Added a shared Playwright runtime-config helper, moved local E2E to a dedicated `127.0.0.1:3100` server, tightened auth/designer-flow assertions to current behavior, and updated the deploy workflow to install browsers and run `npm run test:e2e` in CI. Verified `npm.cmd run test:e2e` (`11` Chromium specs), `npm.cmd run check`, `npm.cmd test` (`328` passing), and `npm.cmd run build`. | Start `LR-06` to define the admin operating model |

---

## â¬œ Up Next

_(Prioritized backlog â€” remaining gaps)_

- [x] **GAP-1** Audit log writes â€” AuditService + 10 critical action audit points â€” 2026-03-24
- [x] **GAP-2** Frontend stack maturity â€” installed `three`, `@react-three/fiber`, `@react-three/drei`; upgraded `stl-viewer.tsx` to React Three Fiber + STLLoader â€” 2026-03-24
- [x] **GAP-3** Frontend stack maturity â€” installed `@uppy/core`, `@uppy/dashboard`, `@uppy/tus`; upgraded `file-uploader.tsx` to Uppy.js with Dashboard UI and optional Tus support â€” 2026-03-24
- [x] **GAP-4** Integration tests for new API routes (approve, request-revision, signed-url, create-intent, dashboard, auth/refresh, users/[id], messages/read) â€” 2026-03-24
- [ ] **M9-LR-06** Define the admin operating model and then continue the remaining launch blockers through `M9-LR-10`

---

## ðŸš© Known Issues & Decisions

> Track architectural decisions and known issues here.

| #   | Type     | Description                                                                                                   | Decision/Status                                                                                                                                                                                                                      |
| --- | -------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Decision | Auth provider                                                                                                 | Supabase Auth (email + Google OAuth + Magic Link)                                                                                                                                                                                    |
| 2   | Decision | Payment model                                                                                                 | 12% platform fee, Stripe Connect escrow                                                                                                                                                                                              |
| 3   | Decision | File storage                                                                                                  | Supabase Storage (S3-compatible), private buckets                                                                                                                                                                                    |
| 4   | Decision | 3D viewer                                                                                                     | Three.js via React Three Fiber                                                                                                                                                                                                       |
| 5   | Decision | State management                                                                                              | Zustand (client) + TanStack Query (server state)                                                                                                                                                                                     |
| 6   | Decision | Testing                                                                                                       | Vitest (unit/integration) + Playwright (E2E), TDD approach                                                                                                                                                                           |
| 7   | Issue    | npm not available in worktree sandbox                                                                         | Hand-craft components instead of `npx shadcn`                                                                                                                                                                                        |
| 8   | Issue    | Merge conflicts on add/add                                                                                    | Main repo has placeholder files from M0-1; resolve by taking branch version                                                                                                                                                          |
| 9   | Learning | Tailwind CSS v4 uses `@theme` directive                                                                       | Use CSS custom properties in globals.css, not tailwind.config.js theme                                                                                                                                                               |
| 10  | Issue    | Next.js standalone build emits a traced-file copy warning for `(dashboard)/page_client-reference-manifest.js` | Docker image still builds and boots with real env vars; monitor first production deploy and revisit if runtime issues appear                                                                                                         |
| 11  | Issue    | Launch readiness is still incomplete                                                                          | `npm run check`, `npm test`, `npm run test:e2e`, and `npm run build` are green, auth abuse protection is in place, observability wiring is active, and the next blocker is `M9-LR-06` in `docs/phase-5/operations/LAUNCH_BACKLOG.md` |
| 12  | Issue    | Launch docs previously drifted from runtime status                                                            | Use `LAUNCH_BACKLOG.md` as the living source of truth and mirror only top-level status here                                                                                                                                          |
| 13  | Issue    | Sentry introduces non-fatal build warnings                                                                    | `npm run build` now emits OpenTelemetry-related warnings from `@sentry/nextjs`; builds still pass, so monitor preview and production deploys before tuning the integration further                                                   |
| 14  | Decision | E2E browser matrix                                                                                            | Local `npm run test:e2e` runs Chromium only on a dedicated Playwright server at `127.0.0.1:3100`; CI installs Chromium, Firefox, and WebKit and runs the full suite                                                                  |
