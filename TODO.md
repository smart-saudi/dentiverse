# DentiVerse — Development Task Tracker

> **Read this at the start of every Claude Code session.**
> Move tasks between sections as work progresses.
> Last updated: 2026-03-22

---

## 📊 Progress Summary

| Milestone | Tasks | Done | Progress |
|-----------|-------|------|----------|
| M0: Project Setup | 8 | 1 | █░░░░░░░░░ 12% |
| M1: Auth & Users | 10 | 0 | ░░░░░░░░░░ 0% |
| M2: Case Management | 12 | 0 | ░░░░░░░░░░ 0% |
| M3: Designer Marketplace | 8 | 0 | ░░░░░░░░░░ 0% |
| M4: Proposals & Matching | 8 | 0 | ░░░░░░░░░░ 0% |
| M5: Design Review & 3D | 6 | 0 | ░░░░░░░░░░ 0% |
| M6: Payments & Escrow | 8 | 0 | ░░░░░░░░░░ 0% |
| M7: Messaging & Notifications | 6 | 0 | ░░░░░░░░░░ 0% |
| M8: Polish & Launch | 6 | 0 | ░░░░░░░░░░ 0% |

---

## 🔴 Blocked

*(Tasks that cannot proceed due to a dependency or decision needed)*

*(none)*

---

## 🟡 In Progress

*(Tasks currently being worked on)*

*(none)*

---

## ⬜ Up Next

*(Prioritized backlog — work on these next, in order)*

### M0: Project Setup (DO FIRST)

- [ ] **M0-2** Install and configure shadcn/ui (Button, Input, Card, Dialog, Table, Badge, Avatar, Tabs, Toast, Skeleton, DropdownMenu, Sheet, Command, Tooltip)
- [ ] **M0-3** Set up Supabase project (local dev + cloud). Run `schema.sql` to create all tables.
- [ ] **M0-4** Configure environment variables (`.env.local` + `.env.example`) *(`.env.example` created in M0-1; still need `.env.local` with real keys)*
- [ ] **M0-5** Set up Vitest + Testing Library + Playwright. Create test helper files (`tests/helpers/factories.ts`, `tests/helpers/supabase.ts`) *(configs created in M0-1; needs `npm install` + verification)*
- [ ] **M0-6** Set up ESLint + Prettier + Conventional Commits (husky + lint-staged) *(ESLint + Prettier configs created in M0-1; still need husky + lint-staged)*
- [ ] **M0-7** Create base layout components: `sidebar.tsx`, `header.tsx`, `footer.tsx`, dashboard shell layout *(dashboard shell layout created in M0-1; still need sidebar, header, footer components)*
- [ ] **M0-8** Generate Supabase TypeScript types: `database.types.ts`. Set up Supabase client files (`client.ts`, `server.ts`, `admin.ts`, `middleware.ts`)

### M1: Auth & Users

- [ ] **M1-1** `TEST:` Write tests for auth validation schemas (email, password, role)
- [ ] **M1-2** `IMPL:` Create Zod validation schemas: `src/lib/validations/auth.ts`
- [ ] **M1-3** `TEST:` Write tests for auth service (register, login, logout)
- [ ] **M1-4** `IMPL:` Create auth service: `src/services/auth.service.ts`
- [ ] **M1-5** `TEST:` Write integration tests for auth API routes
- [ ] **M1-6** `IMPL:` Create API routes: `/api/v1/auth/register`, `/login`, `/logout`, `/refresh`, `/forgot-password`, `/reset-password`
- [ ] **M1-7** `IMPL:` Create auth pages: login, register (with role selection), forgot password
- [ ] **M1-8** `IMPL:` Create auth middleware for protected routes
- [ ] **M1-9** `IMPL:` Create user profile page and settings page
- [ ] **M1-10** `IMPL:` Create `use-auth.ts` hook and `auth-store.ts` Zustand store

### M2: Case Management

- [ ] **M2-1** `TEST:` Write tests for case validation schemas
- [ ] **M2-2** `IMPL:` Create Zod schemas: `src/lib/validations/case.ts`
- [ ] **M2-3** `TEST:` Write tests for case service (create, update, publish, cancel, list)
- [ ] **M2-4** `IMPL:` Create case service: `src/services/case.service.ts`
- [ ] **M2-5** `TEST:` Write integration tests for case API routes
- [ ] **M2-6** `IMPL:` Create API routes: `/api/v1/cases` (GET, POST), `/api/v1/cases/[id]` (GET, PATCH), `/api/v1/cases/[id]/publish`, `/api/v1/cases/[id]/cancel`
- [ ] **M2-7** `IMPL:` Create `case-card.tsx` component with status badges
- [ ] **M2-8** `IMPL:` Create `case-status-badge.tsx` and `case-status-timeline.tsx`
- [ ] **M2-9** `IMPL:` Create `tooth-chart.tsx` — interactive FDI tooth number selector
- [ ] **M2-10** `IMPL:` Create case list page with filters (status, type, date)
- [ ] **M2-11** `IMPL:` Create case creation form (multi-step: details → upload scans → set budget → review → submit)
- [ ] **M2-12** `IMPL:` Create case detail page with status timeline, files, messages tab

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

### Phase 3: M0 — Project Setup
- [x] **M0-1** Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router — 2026-03-22
  - Created: `package.json`, `tsconfig.json` (strict), `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
  - Created: `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`, `playwright.config.ts`
  - Created: `.gitignore`, `.env.example`, `next-env.d.ts`
  - Created: Root layout, landing page, error/not-found pages
  - Created: Auth route group — login, register, forgot-password placeholder pages
  - Created: Dashboard route group — shell layout + 12 placeholder pages (cases, designers, proposals, payments, notifications, settings)
  - Created: `src/lib/utils.ts` (cn, formatCurrency, formatDate, truncate, getInitials)
  - Created: `src/lib/constants.ts` (UserRole, CaseStatus, ProposalStatus, PaymentStatus, CaseType, FILE_LIMITS, StorageBucket, PAGINATION)
  - Created: `src/lib/errors.ts` (AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, RateLimitError)
  - Created: `src/types/` — User, Case, DesignerProfile, Proposal, Payment, API response interfaces
  - Created: `tests/helpers/` — setup.ts, factories.ts, supabase.ts stubs
  - Created: `supabase/config.toml`
  - Created: Full directory structure matching CLAUDE.md spec (src/app, components, lib, hooks, services, stores, types, tests)

---

## 📝 Session Log

> Brief notes from each development session for context continuity.

| Date | Session | What was done | Next up |
|------|---------|---------------|---------|
| 2026-03-22 | #1 | Phase 1 + 2 + 3 planning complete | Start M0: Project scaffolding |
| 2026-03-22 | #2 | M0-1: Initialized Next.js 15 + TS + Tailwind 4 + App Router. Full directory structure, all placeholder pages, config files (ESLint, Prettier, Vitest, Playwright), type definitions, utility modules. | M0-2: shadcn/ui setup |

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
| 7 | Note | npm not available in sandbox | Project was scaffolded manually. Run `npm install` locally before `npm run dev`. |
