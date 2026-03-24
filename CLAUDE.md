# DentiVerse — Claude Code Instructions

> This file is the **single source of truth** for all AI-assisted development.
> Claude Code reads this automatically at the start of every session.
> Keep it updated. Every lesson learned, every convention agreed — it goes here.

---

## 🚀 Common Commands

```bash
# Development
npm run dev                    # Start Next.js dev server (http://localhost:3000)
npm run dev:db                 # Start Supabase local (http://localhost:54323)
npm run dev:all                # Start both (concurrently)

# Testing
npm test                       # Run all tests (Vitest)
npm test -- path/to/file       # Run single test file
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test:e2e               # Playwright E2E tests

# Code Quality
npm run lint                   # ESLint
npm run lint:fix               # ESLint autofix
npm run typecheck              # TypeScript strict check
npm run format                 # Prettier
npm run check                  # lint + typecheck + format (run before every commit)

# Database
npx supabase db reset          # Reset local DB to schema.sql
npx supabase db diff           # Generate migration from local changes
npx supabase migration new <name>  # Create empty migration file
npx supabase gen types typescript --local > src/lib/database.types.ts  # Regen types

# Build & Deploy
npm run build                  # Production build
npm run start                  # Start production server
npx vercel                     # Deploy preview
npx vercel --prod              # Deploy production
```

---

## 📁 Project Structure

```
dentiverse/
├── CLAUDE.md                          # THIS FILE — AI instructions
├── TODO.md                            # Task tracker — read before every session
├── README.md                          # Setup & onboarding
├── .env.local                         # Local environment variables (NEVER commit)
├── .env.example                       # Template for .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
│
├── public/                            # Static assets
│   ├── logo.svg
│   └── og-image.png
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                    # Auth route group (no sidebar)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── (dashboard)/               # Authenticated route group (with sidebar)
│   │   │   ├── layout.tsx             # Dashboard shell (sidebar + header)
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   ├── cases/
│   │   │   │   ├── page.tsx           # Case list
│   │   │   │   ├── new/page.tsx       # Create case form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Case detail
│   │   │   │       └── messages/page.tsx
│   │   │   ├── designers/
│   │   │   │   ├── page.tsx           # Designer search/browse
│   │   │   │   └── [id]/page.tsx      # Designer profile
│   │   │   ├── proposals/page.tsx     # My proposals (designer view)
│   │   │   ├── payments/page.tsx      # Payment history
│   │   │   ├── notifications/page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx           # General settings
│   │   │       └── profile/page.tsx   # Profile edit
│   │   │
│   │   ├── api/                       # API route handlers
│   │   │   └── v1/
│   │   │       ├── auth/
│   │   │       ├── cases/
│   │   │       ├── designers/
│   │   │       ├── proposals/
│   │   │       ├── payments/
│   │   │       ├── reviews/
│   │   │       ├── messages/
│   │   │       ├── notifications/
│   │   │       ├── files/
│   │   │       └── webhooks/
│   │   │           └── stripe/route.ts
│   │   │
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page (public)
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui base components (DO NOT EDIT)
│   │   ├── cases/                     # Case-related components
│   │   │   ├── case-card.tsx
│   │   │   ├── case-form.tsx
│   │   │   ├── case-status-badge.tsx
│   │   │   └── case-status-timeline.tsx
│   │   ├── designers/
│   │   │   ├── designer-card.tsx
│   │   │   ├── designer-search-filters.tsx
│   │   │   └── designer-profile-form.tsx
│   │   ├── proposals/
│   │   │   ├── proposal-card.tsx
│   │   │   └── proposal-form.tsx
│   │   ├── viewer/
│   │   │   └── stl-viewer.tsx         # 3D model viewer (Three.js)
│   │   ├── shared/
│   │   │   ├── file-uploader.tsx      # Uppy.js drag-and-drop
│   │   │   ├── star-rating.tsx
│   │   │   ├── tooth-chart.tsx        # FDI tooth selector
│   │   │   ├── price-display.tsx
│   │   │   ├── empty-state.tsx
│   │   │   └── loading-skeleton.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       ├── mobile-nav.tsx
│   │       └── footer.tsx
│   │
│   ├── lib/                           # Core utilities & configuration
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser Supabase client
│   │   │   ├── server.ts              # Server Supabase client
│   │   │   ├── admin.ts               # Service role client (server only)
│   │   │   └── middleware.ts          # Auth middleware
│   │   ├── stripe/
│   │   │   ├── client.ts              # Stripe client
│   │   │   └── webhooks.ts            # Webhook handler helpers
│   │   ├── database.types.ts          # Auto-generated Supabase types
│   │   ├── validations/               # Zod schemas (shared client/server)
│   │   │   ├── auth.ts
│   │   │   ├── case.ts
│   │   │   ├── proposal.ts
│   │   │   ├── review.ts
│   │   │   └── common.ts
│   │   ├── constants.ts               # App-wide constants
│   │   ├── utils.ts                   # General utilities (cn(), formatCurrency(), etc.)
│   │   └── errors.ts                  # Custom error classes
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-cases.ts
│   │   ├── use-designers.ts
│   │   ├── use-proposals.ts
│   │   ├── use-messages.ts
│   │   ├── use-notifications.ts
│   │   ├── use-realtime.ts            # Supabase realtime subscription
│   │   └── use-file-upload.ts
│   │
│   ├── services/                      # Business logic layer (server-side)
│   │   ├── auth.service.ts
│   │   ├── case.service.ts
│   │   ├── proposal.service.ts
│   │   ├── designer.service.ts
│   │   ├── payment.service.ts
│   │   ├── review.service.ts
│   │   ├── message.service.ts
│   │   ├── notification.service.ts
│   │   └── file.service.ts
│   │
│   ├── stores/                        # Zustand stores (client-side state)
│   │   ├── auth-store.ts
│   │   ├── notification-store.ts
│   │   └── ui-store.ts                # Sidebar open, modals, etc.
│   │
│   └── types/                         # TypeScript type definitions
│       ├── index.ts                   # Re-exports
│       ├── case.ts
│       ├── user.ts
│       ├── designer.ts
│       ├── proposal.ts
│       ├── payment.ts
│       └── api.ts                     # API response wrappers
│
├── tests/
│   ├── unit/                          # Vitest unit tests
│   │   ├── lib/
│   │   ├── services/
│   │   └── components/
│   ├── integration/                   # API integration tests
│   │   ├── auth.test.ts
│   │   ├── cases.test.ts
│   │   └── payments.test.ts
│   └── e2e/                           # Playwright E2E tests
│       ├── auth.spec.ts
│       ├── create-case.spec.ts
│       └── designer-flow.spec.ts
│
└── supabase/
    ├── config.toml                    # Supabase local config
    ├── seed.sql                       # Seed data for development
    └── migrations/
        └── 00001_initial_schema.sql   # schema.sql from Phase 2
```

---

## 📐 Architecture Overview

| Layer           | Technology                                               | Notes                                                                     |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Frontend**    | Next.js 15 (App Router), React 19, TypeScript            | All pages in `src/app/`                                                   |
| **Styling**     | Tailwind CSS 4, shadcn/ui                                | Design system in `docs/phase-2/design/DESIGN_SYSTEM.md`                   |
| **State**       | Zustand (client), TanStack Query (server state)          | Hooks in `src/hooks/`, stores in `src/stores/`                            |
| **3D Viewer**   | Three.js via React Three Fiber                           | Component: `src/components/viewer/stl-viewer.tsx`                         |
| **Backend**     | Supabase (Auth, DB, Storage, Realtime, Edge Functions)   | Clients in `src/lib/supabase/`                                            |
| **API**         | Next.js API Routes (`src/app/api/v1/`)                   | Spec: `docs/phase-2/api/openapi.yaml`                                     |
| **Database**    | PostgreSQL 16 via Supabase                               | Schema: `docs/phase-2/schema/schema.sql`                                  |
| **Payments**    | Stripe Connect (escrow, split payments)                  | Webhook at `/api/v1/webhooks/stripe`                                      |
| **File Upload** | Uppy.js → Supabase Storage                               | Buckets: `dental-scans`, `design-files`, `avatars`, `portfolios`          |
| **Email**       | Resend                                                   | Transactional emails (welcome, notifications, payment receipts)           |
| **Auth**        | Supabase Auth (email/password, Google OAuth, Magic Link) | Roles: DENTIST, LAB, DESIGNER, ADMIN (manual ops only in v1; no admin UI) |
| **Validation**  | Zod                                                      | Shared schemas in `src/lib/validations/`                                  |
| **Testing**     | Vitest (unit), Playwright (E2E)                          | TDD workflow: test first, then implement                                  |
| **Hosting**     | Vercel (frontend), Supabase Cloud (backend)              | CI/CD via GitHub Actions                                                  |
| **Monitoring**  | Sentry (errors), Vercel Analytics (performance)          |                                                                           |

---

## 📝 Coding Standards

### TypeScript

- **Strict mode is mandatory.** `"strict": true` in `tsconfig.json`. No exceptions.
- **`any` is forbidden.** Use `unknown` + type guards, or define proper types. If you must escape, use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a comment explaining why.
- **Prefer `interface` over `type`** for object shapes. Use `type` only for unions, intersections, and primitives.
- **Use ES modules.** `import/export` only. No `require()`.
- **Prefer named exports** over default exports. Exception: Next.js page/layout components which require `export default`.
- **All exported functions must include JSDoc comments** with `@param`, `@returns`, and `@throws` tags.
- **Enums: use `as const` objects** instead of TypeScript `enum`. Example:
  ```typescript
  export const CaseStatus = {
    DRAFT: 'DRAFT',
    OPEN: 'OPEN',
    ASSIGNED: 'ASSIGNED',
    // ...
  } as const;
  export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];
  ```

### React & Components

- **Functional components only.** No class components.
- **Use Server Components by default.** Only add `"use client"` when the component needs interactivity (hooks, event handlers, browser APIs).
- **Component file naming:** `kebab-case.tsx` (e.g., `case-card.tsx`, `star-rating.tsx`).
- **One component per file.** Small sub-components (used only inside the parent) can be in the same file, but not exported.
- **Props interface naming:** `ComponentNameProps` (e.g., `CaseCardProps`).
- **Always destructure props** in the function signature.
- **Loading states are mandatory.** Every async operation must show a loading indicator. Use `<Skeleton>` for initial loads, `isLoading` / `isPending` from TanStack Query.
- **Error states are mandatory.** Every data-fetching component must handle and display errors. Use `<ErrorBoundary>` for unexpected errors.
- **Empty states are mandatory.** If a list can be empty, show a meaningful empty state with a CTA.

### Styling

- **Tailwind CSS only.** No inline `style={{}}` except for dynamic values (e.g., percentage widths).
- **Use `cn()` utility** (from `src/lib/utils.ts`) to merge Tailwind classes conditionally.
- **Follow the design system.** Colors, spacing, typography, and components are defined in `docs/phase-2/design/DESIGN_SYSTEM.md`.
- **shadcn/ui components: do NOT modify files in `src/components/ui/`.** If you need customization, wrap them in a new component.
- **Responsive: mobile-first.** Start with base styles, add `sm:`, `md:`, `lg:` breakpoints.

### API Routes

- **All routes go in `src/app/api/v1/`.** Version the API from day one.
- **Every route must validate input with Zod.** Import schemas from `src/lib/validations/`.
- **Standard response format:**
  ```typescript
  // Success
  return NextResponse.json({ data: result }, { status: 200 });
  // Error
  return NextResponse.json(
    { code: 'VALIDATION_ERROR', message: 'Details...' },
    { status: 400 },
  );
  // Paginated
  return NextResponse.json({ data: items, meta: { page, per_page, total, total_pages } });
  ```
- **Use service layer for business logic.** API routes should be thin — validate input, call service, return response. Business logic lives in `src/services/`.
- **Auth check at the top of every protected route:**
  ```typescript
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 });
  ```

### Database

- **Schema is the source of truth.** `docs/phase-2/schema/schema.sql` defines all tables.
- **NEVER edit existing migrations.** Always create a new migration with `npx supabase migration new <name>`.
- **Always regenerate types after schema changes:**
  ```bash
  npx supabase gen types typescript --local > src/lib/database.types.ts
  ```
- **Use Supabase client for queries.** Do not write raw SQL in application code. Use the Supabase JS client with `.from('table').select()`.
- **RLS is enabled on all tables.** Every query goes through Row Level Security. Test that RLS policies work correctly.

### File Organization

- **Imports order** (enforced by ESLint):
  1. React / Next.js
  2. Third-party libraries
  3. `@/lib/*` (utilities, config)
  4. `@/services/*` (business logic)
  5. `@/hooks/*` (custom hooks)
  6. `@/components/*` (components)
  7. `@/types/*` (types)
  8. Relative imports (`./`, `../`)
- **Path aliases:** Use `@/` prefix. Configured in `tsconfig.json` as `"@/*": ["./src/*"]`.

---

## ⚠️ Critical Rules (IMPORTANT)

### NEVER Do These

1. **NEVER import server-side code into client components.** Supabase `admin.ts` (service role), `server.ts`, and all files in `src/services/` are server-only. If you see `"use client"` at the top, none of these can be imported.
2. **NEVER commit `.env.local` or any file with secrets.** API keys, Supabase service role key, Stripe secret key — these go ONLY in `.env.local` and Vercel environment variables.
3. **NEVER commit `console.log` statements.** Use proper logging: `console.error` for errors (server-side only), Sentry for production error tracking.
4. **NEVER edit database migrations after they've been applied.** Create a new migration instead.
5. **NEVER store sensitive data in client-side state (Zustand).** User tokens, payment details, patient data — these must stay server-side.
6. **NEVER skip input validation on API routes.** Every endpoint gets Zod validation. No exceptions.
7. **NEVER use `dangerouslySetInnerHTML`.** XSS risk. If you need rich text, use a sanitization library.
8. **NEVER hard-code URLs, API keys, or configuration values.** Use environment variables via `process.env` or constants from `src/lib/constants.ts`.
9. **NEVER bypass RLS with the service role client** unless absolutely necessary (e.g., webhooks, admin operations). Document why with a comment.
10. **NEVER commit without running `npm run check` first.** This runs lint + typecheck + format.

### ALWAYS Do These

1. **ALWAYS write tests before implementation (TDD).** See Testing section below.
2. **ALWAYS handle loading, error, and empty states** in UI components.
3. **ALWAYS validate inputs** on both client (for UX) and server (for security).
4. **ALWAYS use `try/catch` in async functions** and return meaningful error messages.
5. **ALWAYS add `aria-label` or `aria-labelledby`** to interactive elements without visible text labels.
6. **ALWAYS update `TODO.md`** when starting or completing a task.
7. **ALWAYS check `CLAUDE.md`** (this file) at the start of every session.

---

## 🧪 Testing Requirements

### Philosophy: Test-Driven Development (TDD)

Every feature follows this cycle:

```
1. Write the test → it fails (RED)
2. Write the minimum code to pass → it passes (GREEN)
3. Refactor → tests still pass (REFACTOR)
```

### Test Types

| Type            | Tool                     | Location                 | What to test                                               |
| --------------- | ------------------------ | ------------------------ | ---------------------------------------------------------- |
| **Unit**        | Vitest                   | `tests/unit/`            | Utility functions, Zod schemas, formatters, business logic |
| **Component**   | Vitest + Testing Library | `tests/unit/components/` | Component rendering, user interactions, state changes      |
| **Integration** | Vitest                   | `tests/integration/`     | API routes end-to-end (request → response)                 |
| **E2E**         | Playwright               | `tests/e2e/`             | Full user flows (register → create case → approve)         |

### Test Naming Convention

```typescript
describe('CaseService', () => {
  describe('createCase', () => {
    it('should create a case with valid input', async () => { ... });
    it('should throw ValidationError for missing title', async () => { ... });
    it('should set status to DRAFT by default', async () => { ... });
  });
});
```

### What Must Have Tests

- **All utility functions** in `src/lib/`
- **All Zod validation schemas** in `src/lib/validations/`
- **All service methods** in `src/services/`
- **All API route handlers** in `src/app/api/`
- **Critical user flows** (auth, create case, accept proposal, approve design, payment)

### Testing Helpers

- Use `vitest-mock-extended` for mocking Supabase client.
- Use `@testing-library/react` for component tests.
- Factory functions for test data live in `tests/helpers/factories.ts`.
- Supabase test client setup in `tests/helpers/supabase.ts`.

---

## 🔄 Development Workflow

### Before Every Session

1. Read `TODO.md` to understand current state.
2. Check this file (`CLAUDE.md`) for any updates.
3. Run `npm run check` to ensure clean state.
4. Pick the next task from `TODO.md`.

### Feature Development Cycle

```
1. Update TODO.md → move task to "In Progress"
2. Write test(s) for the feature → commit: "test: add tests for [feature]"
3. Implement the feature → commit: "feat: implement [feature]"
4. Run `npm run check` → fix any issues
5. Run `npm test` → all tests pass
6. Update TODO.md → move task to "Done"
7. Commit: "docs: update TODO.md"
```

### Commit Message Convention (Conventional Commits)

```
feat: add case creation API endpoint
fix: correct RLS policy for designer proposals
test: add unit tests for email validation
docs: update API documentation
style: format files with prettier
refactor: extract payment logic to service layer
chore: update dependencies
```

### Branch Strategy

```
main              ← production (protected, deploy on push)
├── develop       ← integration branch
│   ├── feat/auth-flow
│   ├── feat/case-crud
│   ├── feat/designer-search
│   └── fix/rls-policy-cases
```

---

## 🌍 Environment Variables

```bash
# .env.local (NEVER commit this file)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (email)
RESEND_API_KEY=re_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DentiVerse
```

**Rule:** Every environment variable must be documented in `.env.example` with a placeholder value and a comment explaining what it's for.

---

## 🧠 Past Mistakes & Learnings

> Update this section as issues are discovered. Format: `YYYY-MM-DD: What happened → What we do now.`

- `2026-03-22:` npm registry was blocked in the Cowork sandbox environment → Project was scaffolded manually (all files hand-written). Run `npm install` locally before using `npm run dev` or any npm scripts. All configs are correct and ready.
- `2026-03-22:` `desktop.ini` files appear in every directory (Windows host artifact) → These are read-only and cannot be deleted. They are in `.gitignore` and harmless. Ignore them.
- `2026-03-22:` Next.js 15 uses `Promise<params>` for dynamic route params (breaking change from v14) → All `[id]` pages use `params: Promise<{ id: string }>` with `await params` pattern.

---

## 📚 Key Reference Documents

| Document             | Path                                               | Use For                                           |
| -------------------- | -------------------------------------------------- | ------------------------------------------------- |
| Product Requirements | `docs/phase-1/DentiVerse_PRD_Light.docx`           | Understanding the product                         |
| User Personas        | `docs/phase-1/DentiVerse_Personas_TechSpec.docx`   | User context for UX decisions                     |
| Database Schema      | `docs/phase-2/schema/schema.sql`                   | All table definitions, RLS, triggers              |
| API Specification    | `docs/phase-2/api/openapi.yaml`                    | All endpoint definitions                          |
| Design System        | `docs/phase-2/design/DESIGN_SYSTEM.md`             | Colors, typography, components                    |
| User Flows           | `docs/diagrams/client-user-flow.mmd`               | Client navigation                                 |
| Designer Flows       | `docs/diagrams/designer-user-flow.mmd`             | Designer navigation                               |
| System Architecture  | `docs/diagrams/system-architecture.mmd`            | Infrastructure overview                           |
| Payment Flow         | `docs/diagrams/payment-escrow-flow.mmd`            | Escrow sequence                                   |
| Deployment Docs      | `docs/phase-5/README.md`                           | Deployment and operations overview                |
| Logging Strategy     | `docs/phase-5/observability/LOGGING_STRATEGY.md`   | Monitoring and log routing                        |
| Runbook              | `docs/phase-5/operations/RUNBOOK.md`               | Deploy, rollback, incident recovery               |
| Admin Ops Model      | `docs/phase-5/operations/ADMIN_OPERATING_MODEL.md` | Manual support, moderation, and refund procedures |

---

## 💡 Tips for Claude Code

- When implementing an API endpoint, refer to `openapi.yaml` for the exact request/response shape.
- When building a UI component, refer to `DESIGN_SYSTEM.md` for colors, spacing, and component patterns.
- When writing database queries, refer to `schema.sql` for table structures and relationships.
- When unsure about a user flow, refer to the Mermaid diagrams in `docs/diagrams/`.
- When a task feels too large, break it into smaller sub-tasks and update `TODO.md`.
- After any schema change, always run `npx supabase gen types typescript --local > src/lib/database.types.ts`.
