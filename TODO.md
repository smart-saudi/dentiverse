# DentiVerse — Development Task Tracker

> **Read this at the start of every Claude Code session.**
> Move tasks between sections as work progresses.
> Last updated: 2026-03-23

---

## 📊 Progress Summary

| Milestone | Tasks | Done | Progress |
|-----------|-------|------|----------|
| M0: Project Setup | 8 | 8 | ██████████ 100% |
| M1: Auth & Users | 10 | 10 | ██████████ 100% |
| M2: Case Management | 12 | 12 | ██████████ 100% |
| M3: Designer Marketplace | 8 | 0 | ░░░░░░░░░░ 0% |
| M4: Proposals & Matching | 8 | 0 | ░░░░░░░░░░ 0% |
| M5: Design Review & 3D | 6 | 0 | ░░░░░░░░░░ 0% |
| M6: Payments & Escrow | 8 | 0 | ░░░░░░░░░░ 0% |
| M7: Messaging & Notifications | 6 | 0 | ░░░░░░░░░░ 0% |
| M8: Polish & Launch | 6 | 0 | ░░░░░░░░░░ 0% |

---

## 🔴 Blocked

*(Tasks that cannot proceed due to a dependency or decision needed)*

- **M0-3** Set up Supabase project (local dev + cloud). Run `schema.sql`. — *User must run locally*
- **M0-4** Configure `.env.local` with real keys — *User must set up locally*

---

## 🟡 In Progress

*(Tasks currently being worked on)*

*(none)*

---

## ⬜ Up Next

*(Prioritized backlog — work on these next, in order)*

### M3: Designer Marketplace

- [ ] **M3-1** `TEST:` Write tests for designer profile validation schemas
- [ ] **M3-2** `IMPL:` Create designer profile service: `src/services/designer.service.ts`
- [ ] **M3-3** `TEST:` Write integration tests for designer API routes
- [ ] **M3-4** `IMPL:` Create API routes: `/api/v1/designers` (GET with search/filter), `/api/v1/designers/[id]`, `/api/v1/designers/me`
- [ ] **M3-5** `IMPL:` Create `designer-card.tsx` with rating, skills, availability indicator
- [ ] **M3-6** `IMPL:` Create `designer-search-filters.tsx` (software, specialization, rating, price, language)
- [ ] **M3-7** `IMPL:` Create designer browse/search page
- [ ] **M3-8** `IMPL:` Create designer public profile page (portfolio, reviews, stats)

### M4: Proposals & Matching

- [ ] **M4-1** `TEST:` Write tests for proposal validation schemas
- [ ] **M4-2** `IMPL:` Create proposal service: `src/services/proposal.service.ts`
- [ ] **M4-3** `TEST:` Write integration tests for proposal API routes
- [ ] **M4-4** `IMPL:` Create API routes: `/api/v1/cases/[id]/proposals` (GET, POST), `/accept`, `/reject`
- [ ] **M4-5** `IMPL:` Create `proposal-card.tsx` with designer info, price, delivery estimate
- [ ] **M4-6** `IMPL:` Create `proposal-form.tsx` for designers to submit proposals
- [ ] **M4-7** `IMPL:` Add proposal list to case detail page (client view)
- [ ] **M4-8** `IMPL:` Create "My Proposals" page for designers

### M5: Design Review & 3D Viewer

- [ ] **M5-1** `IMPL:` Create `file-uploader.tsx` with Uppy.js (drag-drop, progress, resumable)
- [ ] **M5-2** `IMPL:` Create file upload API route with validation (file type, size)
- [ ] **M5-3** `IMPL:` Create `stl-viewer.tsx` — Three.js STL/OBJ viewer with rotate, zoom, pan
- [ ] **M5-4** `IMPL:` Create design version submission flow (designer uploads → client reviews)
- [ ] **M5-5** `IMPL:` Create approve/revision-request flow on case detail page
- [ ] **M5-6** `IMPL:` Create design version history UI (v1, v2, v3... with diff notes)

### M6: Payments & Escrow

- [ ] **M6-1** `IMPL:` Set up Stripe Connect: platform account, onboarding flow for designers
- [ ] **M6-2** `TEST:` Write tests for payment service (create intent, hold, release, refund)
- [ ] **M6-3** `IMPL:` Create payment service: `src/services/payment.service.ts`
- [ ] **M6-4** `IMPL:` Create Stripe webhook handler: `/api/v1/webhooks/stripe/route.ts`
- [ ] **M6-5** `IMPL:` Create payment flow: accept proposal → create PaymentIntent → hold in escrow
- [ ] **M6-6** `IMPL:` Create release flow: approve design → release escrow → transfer to designer
- [ ] **M6-7** `IMPL:` Create payment history page
- [ ] **M6-8** `IMPL:` Create designer earnings/payout dashboard

### M7: Messaging & Notifications

- [ ] **M7-1** `IMPL:` Create message service: `src/services/message.service.ts`
- [ ] **M7-2** `IMPL:` Create `chat-thread.tsx` component with Supabase Realtime
- [ ] **M7-3** `IMPL:` Create messaging UI within case detail page
- [ ] **M7-4** `IMPL:` Create notification service: `src/services/notification.service.ts`
- [ ] **M7-5** `IMPL:` Create notification center (bell icon → dropdown → full page)
- [ ] **M7-6** `IMPL:` Set up email notifications via Resend (new proposal, design submitted, payment released)

### M8: Polish & Launch Prep

- [ ] **M8-1** `IMPL:` Create public landing page (hero, features, how it works, pricing, CTA)
- [ ] **M8-2** `IMPL:` Add Sentry error tracking (frontend + API routes)
- [ ] **M8-3** `IMPL:` Add Vercel Analytics
- [ ] **M8-4** `IMPL:` SEO: meta tags, Open Graph images, sitemap, robots.txt
- [ ] **M8-5** `E2E:` Write Playwright tests for critical flows (register → create case → proposal → approve → payment)
- [ ] **M8-6** `IMPL:` Responsive audit — test all pages on mobile, tablet, desktop

---

## ✅ Done

*(Completed tasks — move here when finished with date)*

### Phase 1: Foundation & Definition
- [x] **P1-1** PRD Light (problem, solution, UVP, competitors, metrics) — 2026-03-22
- [x] **P1-2** User Personas (4 personas, 2 demand + 2 supply) — 2026-03-22
- [x] **P1-3** Technical Specification (stack, architecture) — 2026-03-22
- [x] **P1-4** User Flow Diagrams (client + designer) — 2026-03-22
- [x] **P1-5** Entity Relationship Diagram — 2026-03-22

### Phase 2: Architecture & Design
- [x] **P2-1** System Architecture Diagram — 2026-03-22
- [x] **P2-2** Database Schema (schema.sql, 10 tables, RLS, triggers) — 2026-03-22
- [x] **P2-3** API Contract (openapi.yaml, 40+ endpoints) — 2026-03-22
- [x] **P2-4** Design System (colors, typography, components) — 2026-03-22
- [x] **P2-5** Payment/Escrow Flow Diagram — 2026-03-22
- [x] **P2-6** Dashboard Wireframes (client + designer) — 2026-03-22

### M0: Project Setup
- [x] **M0-1** Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router — 2026-03-22
- [x] **M0-2** Install and configure 14 shadcn/ui components — 2026-03-22
- [x] **M0-3** Set up Supabase project — *Configs created; user must run locally* — 2026-03-22
- [x] **M0-4** Configure environment variables — *`.env.example` created; user sets `.env.local`* — 2026-03-22
- [x] **M0-5** Set up Vitest + Testing Library + Playwright — *Configs created; `vitest.config.ts`, `tests/helpers/setup.ts`* — 2026-03-23
- [x] **M0-6** Set up ESLint + Prettier + husky + lint-staged + commitlint — 2026-03-23
- [x] **M0-7** Create layout components: sidebar, header, footer, mobile-nav, dashboard shell — 2026-03-22
- [x] **M0-8** Generate `database.types.ts`, set up Supabase clients (client, server, admin, middleware) — 2026-03-22

### M1: Auth & Users
- [x] **M1-1** `TEST:` Auth validation schema tests (26 tests) — 2026-03-23
- [x] **M1-2** `IMPL:` Zod schemas: `registerSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema` — 2026-03-23
- [x] **M1-3** `TEST:` Auth service tests (14 tests) — 2026-03-23
- [x] **M1-4** `IMPL:` `AuthService` class (register, login, logout, forgotPassword, resetPassword, getCurrentUser) — 2026-03-23
- [x] **M1-5** `TEST:` Auth API integration tests (15 tests) — 2026-03-23
- [x] **M1-6** `IMPL:` 5 API routes: register, login, logout, forgot-password, reset-password — 2026-03-23
- [x] **M1-7** `IMPL:` Auth pages: login, register (role selection), forgot-password — 2026-03-23
- [x] **M1-8** `IMPL:` Root middleware: session refresh, route protection, auth redirects — 2026-03-23
- [x] **M1-9** `IMPL:` Settings hub page, profile edit page, `GET/PATCH /api/v1/users/me` — 2026-03-23
- [x] **M1-10** `IMPL:` `useAuth` hook + `useAuthStore` Zustand store — 2026-03-23

### M2: Case Management
- [x] **M2-1** `TEST:` Case validation schema tests (28 tests) — 2026-03-23
- [x] **M2-2** `IMPL:` Zod schemas: `createCaseSchema`, `updateCaseSchema`, `caseListQuerySchema` — 2026-03-23
- [x] **M2-3** `TEST:` Case service tests (11 tests) — 2026-03-23
- [x] **M2-4** `IMPL:` `CaseService` class (create, get, update, publish, cancel, list) — 2026-03-23
- [x] **M2-5** `TEST:` Case API integration tests (10 tests) — 2026-03-23
- [x] **M2-6** `IMPL:` API routes: POST/GET /cases, GET/PATCH /cases/[id], publish, cancel — 2026-03-23
- [x] **M2-7** `IMPL:` `case-card.tsx` with status badge, type, teeth, budget, deadline — 2026-03-23
- [x] **M2-8** `IMPL:` `case-status-badge.tsx` and `case-status-timeline.tsx` — 2026-03-23
- [x] **M2-9** `IMPL:` `tooth-chart.tsx` — interactive FDI tooth selector (4 quadrants) — 2026-03-23
- [x] **M2-10** `IMPL:` Case list page with status filters and pagination — 2026-03-23
- [x] **M2-11** `IMPL:` Multi-step case creation form (Details→Teeth→Budget→Review) — 2026-03-23
- [x] **M2-12** `IMPL:` Case detail page with timeline, details, tooth chart, actions — 2026-03-23

---

## 📝 Session Log

> Brief notes from each development session for context continuity.

| Date | Session | What was done | Next up |
|------|---------|---------------|---------|
| 2026-03-22 | #1 | Phase 1 + 2 + 3 planning complete | Start M0: Project scaffolding |
| 2026-03-22 | #2 | M0-1 scaffolding, M0-2 shadcn/ui (14 components), M0-7 layout components, M0-8 Supabase clients + types | M0-6, M1 |
| 2026-03-23 | #3 | M0-5/6 test infra + git hooks, M1-1 to M1-10 auth complete (82 tests passing). Created: auth schemas, service, 5 API routes, middleware, auth pages, useAuth hook, auth store, settings/profile pages, error classes, constants, utils | M2: Case Management |
| 2026-03-23 | #4 | M2-1 to M2-12 case management complete (131 tests passing). Created: case Zod schemas, CaseService, 4 API routes, case-card, status-badge, status-timeline, tooth-chart, case list/create/detail pages | M3: Designer Marketplace |

---

## 🚩 Known Issues & Decisions

> Track architectural decisions and known issues here.

| # | Type | Description | Decision/Status |
|---|------|-------------|----------------|
| 1 | Decision | Auth provider | Supabase Auth (email + Google OAuth + Magic Link) |
| 2 | Decision | Payment model | 12% platform fee, Stripe Connect escrow |
| 3 | Decision | File storage | Supabase Storage (S3-compatible), private buckets |
| 4 | Decision | 3D viewer | Three.js via React Three Fiber |
| 5 | Decision | State management | Zustand (client) + TanStack Query (server state) |
| 6 | Decision | Testing | Vitest (unit/integration) + Playwright (E2E), TDD approach |
| 7 | Issue | npm not available in worktree sandbox | Hand-craft components instead of `npx shadcn` |
| 8 | Issue | Merge conflicts on add/add | Main repo has placeholder files from M0-1; resolve by taking branch version |
| 9 | Learning | Tailwind CSS v4 uses `@theme` directive | Use CSS custom properties in globals.css, not tailwind.config.js theme |
| 10 | Learning | Next.js 15 async params | Dynamic route params are `Promise<{id: string}>`, must `await` |
