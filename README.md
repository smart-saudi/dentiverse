# DentiVerse

> **"Uber for Dental Design Services"** — A global marketplace connecting dental clinics and labs with professional dental CAD designers.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Connect-purple?logo=stripe)](https://stripe.com/)

---

## Quick Start

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** (recommended) or npm (`npm install -g pnpm`)
- **Supabase CLI** (`npx supabase init` or [install](https://supabase.com/docs/guides/cli))
- **Docker** (for Supabase local development)
- **Stripe CLI** (for webhook testing, [install](https://stripe.com/docs/stripe-cli))

### 1. Clone and Install

```bash
git clone https://github.com/smart-saudi/dentiverse.git
cd dentiverse
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Supabase (get from: https://supabase.com/dashboard → Project → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (get from: https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (get from: https://resend.com/api-keys)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Start Supabase locally (requires Docker)
npx supabase start

# Apply the schema
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript --local > src/lib/database.types.ts
```

### 4. Start Development

```bash
# Start Next.js + Supabase
pnpm dev

# In a separate terminal: Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

Open [http://localhost:3000](http://localhost:3000).

Supabase Studio: [http://localhost:54323](http://localhost:54323).

---

## Project Structure

```
src/
├── app/           # Next.js App Router (pages + API routes)
├── components/    # React components (ui/, cases/, designers/, shared/, layout/)
├── lib/           # Core utilities (supabase/, stripe/, validations/, utils)
├── hooks/         # Custom React hooks
├── services/      # Business logic (server-side)
├── stores/        # Zustand client state
├── types/         # TypeScript definitions
tests/
├── unit/          # Vitest unit tests
├── integration/   # API integration tests
└── e2e/           # Playwright E2E tests
```

See `CLAUDE.md` for the complete file tree and coding standards.

---

## Development Workflow

This project uses **Test-Driven Development (TDD)**:

```
1. Write the test → RED (fails)
2. Write the code → GREEN (passes)
3. Refactor → tests still pass
```

### Commands

| Command                                       | Description                           |
| --------------------------------------------- | ------------------------------------- |
| `pnpm dev`                                    | Start dev server                      |
| `docker compose --env-file .env.local up web` | Run the app in Docker with hot reload |
| `pnpm test`                                   | Run all tests                         |
| `pnpm test -- path/to/file`                   | Run single test                       |
| `pnpm run check`                              | Lint + typecheck + format             |
| `pnpm build`                                  | Production build                      |

### Before Every Commit

```bash
pnpm run check    # Must pass
pnpm test         # Must pass
```

### Commit Convention

```
feat: add case creation API
fix: correct RLS policy
test: add email validation tests
docs: update README
```

---

## Tech Stack

| Layer       | Technology                                                    |
| ----------- | ------------------------------------------------------------- |
| Frontend    | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui     |
| 3D Viewer   | Three.js / React Three Fiber                                  |
| Backend     | Supabase + Next.js API Routes                                 |
| Database    | PostgreSQL 16 (Supabase)                                      |
| Payments    | Stripe Connect (escrow)                                       |
| Auth        | Supabase Auth (email/password + password reset for v1 launch) |
| File Upload | Uppy.js → Supabase Storage                                    |
| Hosting     | Vercel + Supabase Cloud                                       |
| Testing     | Vitest + Playwright                                           |

---

## Documentation

All planning and specification documents live in the `docs/` directory:

| Phase       | Documents                                                                        |
| ----------- | -------------------------------------------------------------------------------- |
| **Phase 1** | PRD, User Personas, Tech Spec                                                    |
| **Phase 2** | Schema SQL, OpenAPI spec, Design System, Architecture diagrams                   |
| **Phase 3** | AI workflow, task tracker, developer onboarding                                  |
| **Phase 4** | Security, QA, performance, release checklists                                    |
| **Phase 5** | Infrastructure as code, observability, deployment runbook, admin operating model |

For Claude Code users: read `CLAUDE.md` for all coding standards and conventions.

---

## License

Confidential — All rights reserved.
