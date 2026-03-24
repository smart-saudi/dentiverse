# Phase 3: Development & AI Agent Workflow

> All deliverables for Step 7 (Project Scaffolding), Step 8 (TDD Setup), and Step 9 (Feature Implementation Loop).

## Deliverables

### Step 7: Project Scaffolding

| File | Description | Goes in |
|------|-------------|---------|
| `CLAUDE.md` | **The single most important file.** Complete instructions for Claude Code: commands, architecture, coding standards, critical rules, testing requirements, workflow, environment variables, reference docs. Claude Code reads this automatically at session start. | Project root |
| `README.md` | Developer README with quick start, setup instructions, project structure, and tech stack overview. | Project root |
| `.env.example` | Environment variable template with all required keys, comments, and placeholder values. | Project root |

### Step 8: TDD Setup

The `CLAUDE.md` defines the complete TDD workflow:

1. **Test types:** Unit (Vitest), Component (Testing Library), Integration (Vitest), E2E (Playwright)
2. **Test naming convention:** `describe → describe → it` with clear assertions
3. **What must have tests:** All utils, all Zod schemas, all services, all API routes, all critical user flows
4. **Testing helpers:** Factory functions, mock Supabase client, test data generators

### Step 9: Feature Implementation Loop

| File | Description | Goes in |
|------|-------------|---------|
| `TODO.md` | **Complete task tracker** with 72 tasks across 8 milestones, progress summary, session log, known issues/decisions table. Read at the start of every Claude Code session. | Project root |

**The 8 milestones in order:**

| # | Milestone | Tasks | Dependencies |
|---|-----------|-------|-------------|
| M0 | Project Setup | 8 | None (do first) |
| M1 | Auth & Users | 10 | M0 |
| M2 | Case Management | 12 | M1 |
| M3 | Designer Marketplace | 8 | M1 |
| M4 | Proposals & Matching | 8 | M2 + M3 |
| M5 | Design Review & 3D | 6 | M4 |
| M6 | Payments & Escrow | 8 | M4 |
| M7 | Messaging & Notifications | 6 | M2 |
| M8 | Polish & Launch | 6 | All above |

## How to Use These Files

### For Claude Code (AI agent):
1. Place `CLAUDE.md` in project root — Claude Code reads it automatically
2. Place `TODO.md` in project root — reference it at session start to maintain context
3. Follow the dev cycle: read TODO → pick task → write test → implement → update TODO

### For human developers:
1. `README.md` → Setup and onboarding
2. `CLAUDE.md` → Coding standards reference (useful for humans too)
3. `TODO.md` → Project management and task tracking

### Session handoff pattern:
At the end of each session, update the Session Log table in `TODO.md` with what was done and what's next. This gives the next session (whether human or AI) immediate context.
