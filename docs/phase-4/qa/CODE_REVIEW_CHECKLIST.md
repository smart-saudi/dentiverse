# DentiVerse — Code Review Checklist

> Use this checklist for every pull request. Claude Code should self-review against this
> before submitting code. Human reviewers use it as the final gate.
>
> Prompt for AI self-review:
> *"Review this code against the Code Review Checklist in `docs/phase-4/CODE_REVIEW_CHECKLIST.md`.
> Report any violations with file, line, and fix."*

---

## How to Use

- **Before opening a PR:** Run through sections 1–7 yourself.
- **AI self-review:** Paste the changed files and ask Claude to review against this checklist.
- **Human reviewer:** Focus on sections 4 (Security), 5 (Performance), and 7 (Business Logic).
- **Severity:** 🔴 Blocker (must fix) | 🟡 Warning (should fix) | 🔵 Suggestion (nice to have)

---

## 1. TypeScript & Code Quality

| # | Check | Severity |
|---|-------|----------|
| 1.1 | No `any` type. Use `unknown` + type guards or proper types. | 🔴 |
| 1.2 | No `@ts-ignore` or `@ts-expect-error` without a comment explaining why. | 🔴 |
| 1.3 | No `as` type assertions unless absolutely necessary (and commented). | 🟡 |
| 1.4 | All exported functions have JSDoc with `@param`, `@returns`, `@throws`. | 🟡 |
| 1.5 | No unused imports, variables, or parameters. | 🟡 |
| 1.6 | Interfaces used for object shapes, types for unions/intersections. | 🔵 |
| 1.7 | Named exports preferred over default exports (except Next.js pages). | 🔵 |
| 1.8 | No magic numbers or strings — use constants from `src/lib/constants.ts`. | 🟡 |
| 1.9 | Error messages are user-friendly (no stack traces or internal details leaked). | 🔴 |
| 1.10 | No `console.log` statements. Use `console.error` server-side only, Sentry for prod. | 🔴 |

---

## 2. React & Components

| # | Check | Severity |
|---|-------|----------|
| 2.1 | `"use client"` only when the component uses hooks, event handlers, or browser APIs. | 🟡 |
| 2.2 | No server-side imports (`src/services/`, `src/lib/supabase/server.ts`) in client components. | 🔴 |
| 2.3 | Loading state handled — every async operation shows `<Skeleton>` or spinner. | 🔴 |
| 2.4 | Error state handled — data-fetching components display errors meaningfully. | 🔴 |
| 2.5 | Empty state handled — empty lists show a message + CTA, not a blank screen. | 🟡 |
| 2.6 | Props destructured in function signature, not accessed via `props.x`. | 🔵 |
| 2.7 | Component file matches kebab-case naming (`case-card.tsx`, not `CaseCard.tsx`). | 🔵 |
| 2.8 | No inline `style={{}}` — use Tailwind classes. Exception: dynamic values. | 🟡 |
| 2.9 | `key` prop provided on all mapped/iterated elements — use stable IDs, never index. | 🔴 |
| 2.10 | No state mutation — always use setter functions or spread to create new objects. | 🔴 |
| 2.11 | `useEffect` dependencies are correct and complete. No missing dependencies. | 🔴 |
| 2.12 | Expensive computations wrapped in `useMemo`, event handlers in `useCallback` where needed. | 🟡 |

---

## 3. API Routes & Backend

| # | Check | Severity |
|---|-------|----------|
| 3.1 | Input validated with Zod schema at the top of every route handler. | 🔴 |
| 3.2 | Auth check at the top of every protected route (`getUser()` → 401 if not found). | 🔴 |
| 3.3 | Role-based authorization checked where needed (e.g., only DENTIST/LAB can create cases). | 🔴 |
| 3.4 | Business logic in service layer (`src/services/`), not in the route handler. | 🟡 |
| 3.5 | Standard response format used (`{ data }`, `{ data, meta }`, `{ code, message }`). | 🟡 |
| 3.6 | Appropriate HTTP status codes (200 OK, 201 Created, 400 Bad Request, 401, 403, 404, 500). | 🟡 |
| 3.7 | `try/catch` wraps async operations. Errors return a JSON response, never crash the server. | 🔴 |
| 3.8 | Sensitive data (passwords, tokens, patient info) never logged or included in error responses. | 🔴 |
| 3.9 | Rate limiting considered for sensitive endpoints (login, register, file upload). | 🟡 |
| 3.10 | Webhook endpoints verify signatures (Stripe: `constructEvent` with webhook secret). | 🔴 |

---

## 4. Security (CRITICAL)

| # | Check | Severity |
|---|-------|----------|
| 4.1 | **SQL Injection:** No raw SQL with string concatenation. Supabase client parameterizes automatically. If raw SQL is used (Edge Functions), use parameterized queries only. | 🔴 |
| 4.2 | **XSS:** No `dangerouslySetInnerHTML`. User-generated content rendered as text, not HTML. | 🔴 |
| 4.3 | **CSRF:** State-changing operations use POST/PATCH/DELETE, never GET. Supabase JWT handles CSRF. | 🔴 |
| 4.4 | **Auth bypass:** Every protected endpoint checks `auth.getUser()`. RLS is enabled on all tables. | 🔴 |
| 4.5 | **IDOR (Insecure Direct Object Reference):** Users can only access their own data. RLS policies enforce this, but verify in integration tests. | 🔴 |
| 4.6 | **File upload:** Validated file type (MIME + magic bytes), enforced size limits, stored in private buckets with signed URLs. | 🔴 |
| 4.7 | **Secrets exposure:** No API keys, tokens, or secrets in client-side code. Only `NEXT_PUBLIC_*` vars accessible in browser. | 🔴 |
| 4.8 | **Service role bypass:** `supabase.admin` (service role) used ONLY in webhooks and admin operations. Commented with justification. | 🔴 |
| 4.9 | **Input sanitization:** User inputs trimmed and length-limited. Zod schemas enforce `.trim().max()`. | 🟡 |
| 4.10 | **Dependency vulnerabilities:** No known CVEs. Run `npm audit` before release. | 🟡 |
| 4.11 | **CORS:** API routes don't set permissive CORS headers. Next.js defaults are safe. | 🟡 |
| 4.12 | **Content-Type validation:** API routes check `Content-Type: application/json` for POST/PATCH. | 🔵 |

---

## 5. Performance

| # | Check | Severity |
|---|-------|----------|
| 5.1 | **N+1 queries:** No loops that make individual DB calls. Use `.select('*, relation(*)') ` joins or batch queries. | 🔴 |
| 5.2 | **Pagination:** All list endpoints paginated. Never `SELECT *` without LIMIT. | 🔴 |
| 5.3 | **Indexes:** Queries filter on indexed columns (check `schema.sql` for available indexes). | 🟡 |
| 5.4 | **Image optimization:** Use `<Image>` from `next/image` for all images. Specify width/height. | 🟡 |
| 5.5 | **Bundle size:** No large library imported entirely. Use tree-shakeable imports (`import { x } from 'lib'`). | 🟡 |
| 5.6 | **Lazy loading:** Heavy components (3D viewer, rich text editor) loaded with `dynamic(() => import(...))`. | 🟡 |
| 5.7 | **Caching:** TanStack Query configured with appropriate `staleTime` and `gcTime`. | 🔵 |
| 5.8 | **Server Components:** Data-fetching components are Server Components (no `"use client"`). | 🟡 |
| 5.9 | **Database queries:** Only `SELECT` the columns needed, not `SELECT *`. Use `.select('id, title, status')`. | 🔵 |
| 5.10 | **File upload:** Large files use resumable upload (Uppy + tus protocol), not single POST. | 🟡 |

---

## 6. Testing

| # | Check | Severity |
|---|-------|----------|
| 6.1 | New feature has corresponding tests (unit or integration). | 🔴 |
| 6.2 | Tests written BEFORE implementation (TDD). Check git history: test commit before feat commit. | 🟡 |
| 6.3 | Tests cover happy path AND error cases (invalid input, unauthorized, not found). | 🔴 |
| 6.4 | No tests that depend on external services (use mocks for Supabase, Stripe). | 🟡 |
| 6.5 | Test names describe behavior: `it('should return 401 for unauthenticated request')`. | 🔵 |
| 6.6 | No hardcoded test data — use factory functions from `tests/helpers/factories.ts`. | 🔵 |
| 6.7 | All tests pass: `npm test` exits with 0. | 🔴 |
| 6.8 | `npm run check` passes (lint + typecheck + format). | 🔴 |

---

## 7. Business Logic

| # | Check | Severity |
|---|-------|----------|
| 7.1 | Case status transitions follow the defined state machine (DRAFT→OPEN→ASSIGNED→...). | 🔴 |
| 7.2 | Payment amounts calculated correctly (platform fee = 12%, designer payout = amount - fee). | 🔴 |
| 7.3 | Escrow flow correct: funds held on proposal acceptance, released on design approval. | 🔴 |
| 7.4 | Revision count enforced — cannot exceed `max_revisions` on the case. | 🟡 |
| 7.5 | Designer rating recalculated correctly after new review (weighted average). | 🟡 |
| 7.6 | File access control: only case participants (client + assigned designer) can access scan/design files. | 🔴 |
| 7.7 | Notification sent for all key events (proposal received, design submitted, payment released). | 🟡 |
| 7.8 | Cancellation logic handles edge cases (cancel during escrow → refund, cancel after completion → blocked). | 🔴 |

---

## 8. Accessibility & UX

| # | Check | Severity |
|---|-------|----------|
| 8.1 | All interactive elements have `aria-label` or visible text label. | 🟡 |
| 8.2 | Color is not the only indicator of state (icons/text accompany status colors). | 🟡 |
| 8.3 | Keyboard navigation works for all interactive elements (focus visible, tab order). | 🟡 |
| 8.4 | Form fields have associated `<label>` elements. | 🟡 |
| 8.5 | Error messages displayed near the relevant form field, not just at the top. | 🔵 |
| 8.6 | Responsive: tested on mobile (375px), tablet (768px), desktop (1280px). | 🟡 |
| 8.7 | No text smaller than 12px. | 🔵 |

---

## PR Template

When opening a pull request, include:

```markdown
## What
Brief description of the change.

## Why
Link to TODO.md task (e.g., M2-7) or bug reference.

## Checklist
- [ ] Tests added/updated
- [ ] `npm run check` passes
- [ ] `npm test` passes
- [ ] No security issues (Section 4 reviewed)
- [ ] Loading/error/empty states handled (if UI change)
- [ ] TODO.md updated
```
