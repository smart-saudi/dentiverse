# DentiVerse Docs

> Product, architecture, QA, security, and operations references for the DentiVerse codebase.

---

## Repository Structure

```text
dentiverse/
|-- docs/
|   |-- README.md
|   |-- diagrams/
|   |   |-- client-user-flow.mmd
|   |   |-- designer-user-flow.mmd
|   |   |-- entity-relationship-diagram.mmd
|   |   |-- system-architecture.mmd
|   |   `-- payment-escrow-flow.mmd
|   |-- phase-1/
|   |   |-- DentiVerse_PRD_Light.docx
|   |   `-- DentiVerse_Personas_TechSpec.docx
|   |-- phase-2/
|   |   |-- README.md
|   |   |-- api/openapi.yaml
|   |   |-- design/DESIGN_SYSTEM.md
|   |   `-- schema/schema.sql
|   |-- phase-3/
|   |   |-- CLAUDE.md
|   |   |-- README.md
|   |   `-- TODO.md
|   |-- phase-4/
|   |   |-- README.md
|   |   |-- PERFORMANCE_BENCHMARK.md
|   |   |-- THREAT_MODEL.md
|   |   `-- UAT_TEST_PLAN.md
|   `-- phase-5/
|       |-- README.md
|       |-- iac/README.md
|       |-- observability/LOGGING_STRATEGY.md
|       |-- observability/SLA_SLO.md
|       |-- operations/ADMIN_OPERATING_MODEL.md
|       |-- operations/LAUNCH_BACKLOG.md
|       `-- operations/RUNBOOK.md
|-- AGENTS.md
|-- CLAUDE.md
|-- README.md
|-- TODO.md
|-- Dockerfile
|-- docker-compose.yml
`-- infra/terraform/
```

---

## Documents Overview

### Phase 1: Foundation and Definition

| Document                  | Contents                                                        | Status   |
| ------------------------- | --------------------------------------------------------------- | -------- |
| PRD Light                 | Problem, solution, UVP, competitors, metrics, revenue model     | Complete |
| User Personas / Tech Spec | Personas, goals, frustrations, stack, architecture, constraints | Complete |
| User Flow Diagrams        | Client and designer flows in Mermaid                            | Complete |
| ERD                       | Entity relationship diagram in Mermaid                          | Complete |

### Phase 2: Architecture and Design

| Document            | Contents                                  | Status   |
| ------------------- | ----------------------------------------- | -------- |
| System Architecture | End-to-end system diagram                 | Complete |
| Database Schema     | PostgreSQL schema, indexes, triggers, RLS | Complete |
| API Contract        | OpenAPI spec for app routes               | Complete |
| Design System       | Colors, typography, spacing, UI patterns  | Complete |
| Payment Flow        | Escrow and release sequence diagram       | Complete |

### Phase 3: Development Workflow

| Document  | Contents                                          | Status   |
| --------- | ------------------------------------------------- | -------- |
| CLAUDE.md | AI-agent instructions, coding standards, workflow | Complete |
| TODO.md   | Active tracker, session log, decisions            | Complete |
| README.md | Developer onboarding and local setup              | Complete |

### Phase 4: QA, Security, and Release Readiness

| Document         | Contents                                         | Status   |
| ---------------- | ------------------------------------------------ | -------- |
| Threat Model     | STRIDE threats, mitigations, residual risk       | Complete |
| Security Docs    | Security posture, controls, launch checks        | Complete |
| QA / UAT Docs    | Test scripts, review checklists, issue templates | Complete |
| Performance Docs | Benchmarks and performance expectations          | Complete |

### Phase 5: Deployment and Operations

| Document               | Contents                                                       | Status   |
| ---------------------- | -------------------------------------------------------------- | -------- |
| Phase 5 README         | Index of deployment and operations assets                      | Complete |
| Infrastructure as Code | Dockerfile, Docker Compose, Terraform, GitHub Actions          | Complete |
| Logging Strategy       | Log sinks, redaction rules, alert priorities                   | Complete |
| SLA / SLO              | Availability and latency targets, SLIs, error budget           | Complete |
| Runbook                | Deployment steps, rollback, failure scenarios                  | Complete |
| Admin Operating Model  | Manual support, moderation, refund, and break-glass procedures | Complete |
| Launch Backlog         | Live launch blockers, owners, sequence, and verification state | Active   |

---

## Quick Start for AI Agents

| Task                         | Recommended Context                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start of a session           | `CLAUDE.md` and `TODO.md`                                                                                                                                           |
| Understand the product       | `docs/phase-1/DentiVerse_PRD_Light.docx`                                                                                                                            |
| Work on API routes           | `docs/phase-2/api/openapi.yaml`                                                                                                                                     |
| Work on database or RLS      | `docs/phase-2/schema/schema.sql`                                                                                                                                    |
| Work on UI                   | `docs/phase-2/design/DESIGN_SYSTEM.md`                                                                                                                              |
| Understand flows             | `docs/diagrams/*.mmd`                                                                                                                                               |
| Deploy or operate the system | `docs/phase-5/README.md`, `docs/phase-5/operations/RUNBOOK.md`, `docs/phase-5/operations/ADMIN_OPERATING_MODEL.md`, and `docs/phase-5/operations/LAUNCH_BACKLOG.md` |

---

## Tech Stack Snapshot

| Layer       | Technology                                                |
| ----------- | --------------------------------------------------------- |
| Frontend    | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| 3D Viewer   | Three.js / React Three Fiber                              |
| Backend     | Supabase plus Next.js API routes                          |
| Database    | PostgreSQL 16 via Supabase                                |
| Payments    | Stripe Connect                                            |
| File Upload | Uppy.js to Supabase Storage                               |
| Hosting     | Vercel and Supabase Cloud                                 |
| Monitoring  | Sentry and Vercel Analytics                               |
| CI/CD       | GitHub Actions                                            |

---

## License

Confidential - All rights reserved.
