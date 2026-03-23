# Phase 4: Quality Assurance & Security

> All deliverables for Step 10 (Code Review), Step 11 (Security Audit),
> Step 12 (Performance Testing), and Step 13 (User Acceptance Testing).

---

## Deliverables

### Step 10: Code Review & Refactoring

| File | Description |
|------|-------------|
| `qa/CODE_REVIEW_CHECKLIST.md` | **80-item checklist** across 8 categories: TypeScript, React, API routes, security, performance, testing, business logic, accessibility. Each item rated by severity (blocker/warning/suggestion). Includes PR template. |

**Usage:** Run this checklist on every pull request. For AI self-review, prompt:
> *"Review this code against the Code Review Checklist in `docs/phase-4/qa/CODE_REVIEW_CHECKLIST.md`. Report any violations with file, line, and fix."*

### Step 11: Security Audit

| File | Description |
|------|-------------|
| `security/THREAT_MODEL.md` | **STRIDE-based threat model** with 25 identified threats across 6 categories, risk matrix, data classification table, compliance requirements (HIPAA, GDPR, PCI DSS), and incident response plan. |
| `security/SECURITY.md` | **Vulnerability reporting policy** — how to report, response SLAs, scope, safe harbor, bug bounty rewards. Goes in project root. |

**Top 5 risks identified:**
1. Unauthorized access to dental scans (PHI exposure)
2. RLS policy gaps allowing cross-user data access
3. Payment/status manipulation via API
4. Token hijacking or service key leak
5. Malicious marketplace participants (fake dentists/designers)

### Step 12: Performance Testing

| File | Description |
|------|-------------|
| `performance/PERFORMANCE_BENCHMARKS.md` | **Complete performance specification:** Web Vitals targets, API response time budgets (P50/P95/P99), database query benchmarks, bundle size budgets, concurrency targets, load testing scenarios (k6), Lighthouse CI integration, monitoring strategy, and optimization playbook. |

**Key thresholds:**
| Metric | Target |
|--------|--------|
| API P95 response time | < 200ms (read), < 500ms (write) |
| LCP | < 1.5s |
| Initial JS bundle | < 150 KB |
| Concurrent users (peak) | 1,000 |
| Lighthouse Performance score | > 85 |

### Step 13: User Acceptance Testing (UAT)

| File | Description |
|------|-------------|
| `qa/UAT_TEST_SCRIPT.md` | **76-step UAT script** across 10 scenarios covering every critical user flow: registration, case creation, designer browsing, proposals, design review with 3D viewer, payments, messaging, reviews, edge cases, and responsive design. Includes results summary table. |
| `github-templates/bug-report.yml` | GitHub Issues bug report template with severity, area, role, steps to reproduce, and expected/actual behavior fields. |
| `github-templates/feature-request.yml` | GitHub Issues feature request template. |

**UAT Scenarios:**
| # | Scenario | Steps |
|---|----------|-------|
| 1 | Dentist registration & profile | 8 |
| 2 | Create and publish a case | 11 |
| 3 | Designer registration & browse | 8 |
| 4 | Submit and accept proposal | 9 |
| 5 | Design submission & 3D review | 10 |
| 6 | Payment verification | 5 |
| 7 | Real-time messaging | 6 |
| 8 | Review & rating | 5 |
| 9 | Edge cases & error handling | 9 |
| 10 | Responsive design | 5 |

---

## File Placement

```
dentiverse/                          # Development repo
├── SECURITY.md                      # ← security/SECURITY.md (project root)
└── .github/
    └── ISSUE_TEMPLATE/
        ├── bug-report.yml           # ← github-templates/bug-report.yml
        └── feature-request.yml      # ← github-templates/feature-request.yml

dentiverse-docs/                     # Docs repo
└── docs/phase-4/
    ├── README.md                    # This file
    ├── qa/
    │   ├── CODE_REVIEW_CHECKLIST.md
    │   └── UAT_TEST_SCRIPT.md
    ├── security/
    │   ├── THREAT_MODEL.md
    │   └── SECURITY.md
    ├── performance/
    │   └── PERFORMANCE_BENCHMARKS.md
    └── github-templates/
        ├── bug-report.yml
        └── feature-request.yml
```

---

## Integration with Development Workflow

Add these to `CLAUDE.md` under "Critical Rules":
```markdown
- ALWAYS run the Code Review Checklist (Section 4: Security) before merging any PR.
- ALWAYS check Threat Model when implementing auth, payments, or file handling features.
- ALWAYS verify API response times against Performance Benchmarks after implementing new endpoints.
```

Add to `TODO.md` before launch:
```markdown
- [ ] **QA-1** Run UAT Script (all 10 scenarios, 76 steps)
- [ ] **QA-2** Fix all Critical and High severity bugs from UAT
- [ ] **QA-3** Run k6 load test (Scenario 2: Average Load)
- [ ] **QA-4** Run Lighthouse CI on all key pages (score > 85)
- [ ] **QA-5** Run `npm audit` — zero critical vulnerabilities
- [ ] **QA-6** Verify RLS policies with cross-user access tests
```
