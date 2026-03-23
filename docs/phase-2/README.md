# Phase 2: Architecture & Design

> All deliverables for Step 4 (System Architecture & Data Modeling), Step 5 (API Contract), and Step 6 (UI/UX Design).

## Deliverables

### Step 4: System Architecture & Data Modeling

| File | Description |
|------|-------------|
| `docs/diagrams/system-architecture.mmd` | System architecture diagram showing all tiers (client → edge → app → backend → data → external) |
| `docs/diagrams/payment-escrow-flow.mmd` | Sequence diagram showing the complete payment/escrow flow |
| `schema/schema.sql` | **Complete PostgreSQL schema** — 10 tables, all indexes, foreign keys, constraints, triggers, functions, and RLS policies |

**Schema includes:**
- `users` — Central user table extending Supabase Auth
- `designer_profiles` — Extended profiles with skills, ratings, portfolio
- `cases` — Core marketplace orders with full lifecycle
- `proposals` — Designer bids on open cases
- `design_versions` — Tracked design iterations
- `payments` — Stripe-linked escrow transactions
- `reviews` — Multi-dimensional designer ratings
- `messages` — Case-specific chat threads
- `notifications` — Multi-channel notification system
- `audit_log` — Immutable compliance trail

### Step 5: API Contract

| File | Description |
|------|-------------|
| `api/openapi.yaml` | **Full OpenAPI 3.0 specification** — every endpoint, request/response body, and authentication requirement |

**API covers 40+ endpoints across 11 resource groups:**
- Auth (register, login, logout, refresh, password reset)
- Users (profile, dashboard stats)
- Designers (search, filter, profile management)
- Cases (CRUD, publish, cancel, approve, request revision)
- Proposals (submit, accept, reject)
- Designs (version management, file submission)
- Payments (escrow creation, Stripe webhooks)
- Reviews (submit, respond)
- Messages (threaded chat, read receipts)
- Notifications (list, mark read)
- Files (upload, signed URLs)

**To preview:** Import `openapi.yaml` into [Swagger Editor](https://editor.swagger.io/) or [Redocly](https://redocly.com/).

### Step 6: UI/UX Design

| File | Description |
|------|-------------|
| `design/DESIGN_SYSTEM.md` | Complete design system: colors, typography, spacing, components, icons, accessibility, responsive rules |

**Design system defines:**
- Brand color palette (primary, semantic, neutral, role-based)
- Typography scale (Inter font, 8 sizes)
- Spacing system (4px grid)
- shadcn/ui component inventory (15 base + 10 custom)
- Status badge color mapping for all 10 case states
- Icon library (Lucide) with key icon assignments
- Responsive breakpoints and layout rules
- Accessibility requirements (WCAG AA, RTL, keyboard nav)

## How to Use These Files

### For the AI agent (code generation):
1. Feed `schema.sql` when generating database migrations or Supabase setup
2. Feed `openapi.yaml` when generating API route handlers or frontend API clients
3. Feed `DESIGN_SYSTEM.md` when generating UI components

### For the team:
1. `schema.sql` → Run directly in Supabase SQL editor to create all tables
2. `openapi.yaml` → Import into Postman/Insomnia for API testing
3. `DESIGN_SYSTEM.md` → Reference when building any UI component
