# DentiVerse

> **"Uber for Dental Design Services"** — A global marketplace connecting dental clinics and labs with professional dental CAD designers.

---

## What is DentiVerse?

DentiVerse is an online platform that connects dental professionals who need prosthetic designs (crowns, bridges, implants, veneers) with skilled CAD designers who can create them digitally — on demand, with full transparency.

**The core loop:** Upload scan → Choose designer → Review in 3D → Pay on approval → Download files for manufacturing.

---

## Repository Structure

```text
dentiverse/
├── docs/
│   ├── README.md
│   ├── diagrams/
│   │   ├── client-user-flow.mmd
│   │   ├── designer-user-flow.mmd
│   │   ├── entity-relationship-diagram.mmd
│   │   ├── system-architecture.mmd
│   │   └── payment-escrow-flow.mmd
│   ├── phase-1/
│   │   ├── DentiVerse_PRD_Light.docx
│   │   └── DentiVerse_Personas_TechSpec.docx
│   ├── phase-2/
│   │   ├── README.md
│   │   ├── api/openapi.yaml
│   │   ├── design/DESIGN_SYSTEM.md
│   │   └── schema/schema.sql
│   └── phase-3/
│       ├── CLAUDE.md
│       ├── README.md
│       └── TODO.md
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── TODO.md
```

---

## Documents Overview

### Phase 1: Foundation & Definition ✅

| Document | Contents | Status |
|----------|----------|--------|
| **PRD Light** | Problem, solution, UVP, competitive landscape, success metrics, revenue model | ✅ Complete |
| **User Personas** | 4 personas (2 demand-side, 2 supply-side) with goals, frustrations, scenarios | ✅ Complete |
| **Technical Specification** | Tech stack, architecture decisions, security & compliance | ✅ Complete |
| **User Flow Diagrams** | Client flow + Designer flow (Mermaid) | ✅ Complete |
| **ERD** | Entity relationship diagram (Mermaid) | ✅ Complete |

### Phase 2: Architecture & Design ✅

| Document | Contents | Status |
|----------|----------|--------|
| **System Architecture** | Full system diagram (6 tiers, all components) | ✅ Complete |
| **Database Schema** | PostgreSQL: 10 tables, indexes, triggers, RLS policies (400+ lines) | ✅ Complete |
| **API Contract** | OpenAPI 3.0: 40+ endpoints, full request/response schemas | ✅ Complete |
| **Design System** | Colors, typography, spacing, 25 components, accessibility | ✅ Complete |
| **Payment Flow** | Stripe Connect escrow sequence diagram | ✅ Complete |

### Phase 3: Development & AI Workflow ✅

| Document | Contents | Status |
|----------|----------|--------|
| **CLAUDE.md** | AI agent source of truth: commands, architecture, coding standards, 10 critical rules, TDD workflow, environment variables | ✅ Complete |
| **TODO.md** | 72 tasks across 8 milestones, progress tracker, session log, decisions table | ✅ Complete |
| **README.md** | Developer quick start, setup instructions, project structure | ✅ Complete |

### Upcoming

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 3 (execution) | MVP Development (M0-M8) | 🔜 Next |
| Phase 4 | Testing & QA | ⏳ Planned |
| Phase 5 | Launch & Growth | ⏳ Planned |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| **3D Viewer** | Three.js / React Three Fiber |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) + Next.js API Routes |
| **Database** | PostgreSQL 16 (Supabase managed) |
| **Payments** | Stripe Connect (escrow, split payments, global payouts) |
| **File Upload** | Uppy.js (resumable uploads) → Supabase Storage |
| **Hosting** | Vercel (frontend) + Supabase Cloud (backend) |
| **DNS / CDN** | Cloudflare |
| **Email** | Resend |
| **Monitoring** | Sentry + Vercel Analytics |
| **Testing** | Vitest (unit/integration) + Playwright (E2E) |
| **CI/CD** | GitHub Actions |

---

## Quick Start for AI Agents

When using Claude Code for development, these files are your context:

| Task | Feed this file |
|------|---------------|
| **Start of every session** | `CLAUDE.md` (auto-read) + `TODO.md` (manual check) |
| Database setup / migrations | `docs/phase-2/schema/schema.sql` |
| API route handlers | `docs/phase-2/api/openapi.yaml` |
| Frontend API client | `docs/phase-2/api/openapi.yaml` |
| UI components | `docs/phase-2/design/DESIGN_SYSTEM.md` |
| Understanding the product | `docs/phase-1/DentiVerse_PRD_Light.docx` |
| User flows | `docs/diagrams/*.mmd` |

---

## Development Milestones

| # | Milestone | Tasks | Focus |
|---|-----------|-------|-------|
| M0 | Project Setup | 8 | Scaffold, install, configure |
| M1 | Auth & Users | 10 | Registration, login, profiles |
| M2 | Case Management | 12 | CRUD, status flow, file upload |
| M3 | Designer Marketplace | 8 | Search, filter, profiles |
| M4 | Proposals & Matching | 8 | Bidding, accept/reject |
| M5 | Design Review & 3D | 6 | Three.js viewer, version tracking |
| M6 | Payments & Escrow | 8 | Stripe Connect, hold/release |
| M7 | Messaging & Notifications | 6 | Realtime chat, email alerts |
| M8 | Polish & Launch | 6 | Landing page, SEO, E2E tests |

---

## License

Confidential — All rights reserved.

---

*Built with clarity. Designed for scale.*
