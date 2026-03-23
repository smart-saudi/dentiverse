# DentiVerse — Performance Benchmark & Testing Plan

> Version 1.0 — March 2026
>
> This document defines acceptable performance thresholds, testing methodology,
> and monitoring strategy. All thresholds must be met before production launch
> and continuously monitored post-launch.

---

## 1. Performance Budgets

### 1.1 Web Vitals (Frontend)

| Metric | Target | Acceptable | Poor | Tool |
|--------|--------|------------|------|------|
| **LCP** (Largest Contentful Paint) | < 1.5s | < 2.5s | > 2.5s | Vercel Analytics, Lighthouse |
| **FID** (First Input Delay) | < 50ms | < 100ms | > 100ms | Vercel Analytics |
| **CLS** (Cumulative Layout Shift) | < 0.05 | < 0.1 | > 0.1 | Lighthouse |
| **TTFB** (Time to First Byte) | < 200ms | < 400ms | > 400ms | Vercel Analytics |
| **FCP** (First Contentful Paint) | < 1.0s | < 1.8s | > 1.8s | Lighthouse |
| **INP** (Interaction to Next Paint) | < 100ms | < 200ms | > 200ms | Vercel Analytics |

### 1.2 API Response Times

| Endpoint Category | P50 Target | P95 Target | P99 Max | Method |
|-------------------|-----------|------------|---------|--------|
| **Auth** (login, register) | < 100ms | < 300ms | < 500ms | POST |
| **Case list** (paginated) | < 100ms | < 200ms | < 400ms | GET |
| **Case detail** | < 80ms | < 150ms | < 300ms | GET |
| **Designer search** (with filters) | < 150ms | < 300ms | < 500ms | GET |
| **Proposal submit** | < 100ms | < 200ms | < 400ms | POST |
| **File upload initiation** | < 100ms | < 200ms | < 400ms | POST |
| **Message send** | < 50ms | < 100ms | < 200ms | POST |
| **Notification list** | < 50ms | < 100ms | < 200ms | GET |
| **Payment intent creation** | < 200ms | < 500ms | < 1000ms | POST |
| **Webhook processing** | < 300ms | < 500ms | < 1000ms | POST |

### 1.3 Database Query Performance

| Query Type | Target | Max | Notes |
|-----------|--------|-----|-------|
| Simple lookup (by PK) | < 5ms | < 20ms | e.g., get case by ID |
| Filtered list (indexed) | < 20ms | < 50ms | e.g., cases by client_id + status |
| Full-text search | < 50ms | < 100ms | e.g., designer name/bio search |
| Aggregation (count, avg) | < 30ms | < 80ms | e.g., dashboard stats |
| Complex join | < 50ms | < 150ms | e.g., case + client + designer + latest version |

### 1.4 File Operations

| Operation | Target | Max | Notes |
|-----------|--------|-----|-------|
| File upload (50MB scan) | < 30s | < 60s | Resumable via tus protocol |
| File upload (5MB avatar) | < 5s | < 10s | Direct upload |
| Signed URL generation | < 50ms | < 100ms | |
| 3D model load (STL, 20MB) | < 3s | < 5s | Three.js parsing + rendering |
| Thumbnail generation | < 5s | < 10s | Server-side, async |

### 1.5 Concurrency Targets

| Scenario | Target | Method |
|----------|--------|--------|
| Concurrent users (normal) | 500 | Sustained |
| Concurrent users (peak) | 1,000 | Burst (5 min) |
| API requests/second | 200 | Sustained |
| API requests/second (peak) | 500 | Burst (1 min) |
| WebSocket connections | 1,000 | Concurrent (Supabase Realtime) |
| File uploads concurrent | 50 | Simultaneous |

---

## 2. Bundle Size Budgets

| Artifact | Target | Max | Tool |
|----------|--------|-----|------|
| **Initial JS bundle** (First Load) | < 150 KB | < 200 KB | `next build` output |
| **Per-page JS** (after initial) | < 50 KB | < 100 KB | `next build` output |
| **Total CSS** | < 30 KB | < 50 KB | Build output (Tailwind purge) |
| **Largest image** | < 200 KB | < 500 KB | WebP/AVIF format |
| **3D viewer chunk** | < 300 KB | < 500 KB | Dynamic import, lazy loaded |

---

## 3. Testing Methodology

### 3.1 Load Testing (Pre-Launch)

**Tool:** k6 (open-source, scriptable)

**Scenarios:**

```
Scenario 1: Smoke Test
- 5 virtual users, 1 minute
- Purpose: Verify all endpoints respond correctly
- Pass: 0 errors, all P95 < thresholds

Scenario 2: Average Load
- 100 virtual users, 10 minutes
- Ramp: 0→100 over 2 min, sustain 6 min, ramp down 2 min
- Purpose: Simulate normal daily traffic
- Pass: Error rate < 1%, P95 within thresholds

Scenario 3: Peak Load
- 500 virtual users, 5 minutes
- Ramp: 0→500 over 1 min, sustain 3 min, ramp down 1 min
- Purpose: Simulate peak hour (marketing campaign, viral moment)
- Pass: Error rate < 2%, P95 within acceptable range

Scenario 4: Stress Test
- 1000 virtual users, 5 minutes
- Purpose: Find the breaking point
- Pass: Graceful degradation (429 rate limit, not 500 errors)

Scenario 5: Soak Test
- 50 virtual users, 2 hours
- Purpose: Detect memory leaks, connection pool exhaustion
- Pass: No degradation over time, stable memory usage
```

**Key User Journeys to Test:**

| Journey | Steps | Weight |
|---------|-------|--------|
| Browse designers | Login → Search designers → View profile | 30% |
| Create case | Login → Create case → Upload scan → Publish | 20% |
| Submit proposal | Login → Browse cases → View case → Submit proposal | 20% |
| Review design | Login → View case → Load 3D viewer → Approve | 15% |
| Messaging | Login → Open case → Send message → Receive message | 15% |

### 3.2 Frontend Performance Testing

**Tool:** Lighthouse CI (automated in GitHub Actions)

**Run on every PR against:**
- Landing page (`/`)
- Dashboard (`/dashboard`)
- Case list (`/cases`)
- Designer search (`/designers`)
- Case detail (`/cases/[id]`)

**Minimum Lighthouse scores:**

| Category | Minimum | Target |
|----------|---------|--------|
| Performance | 85 | 95 |
| Accessibility | 90 | 100 |
| Best Practices | 90 | 100 |
| SEO | 90 | 100 |

### 3.3 Database Performance Testing

**Tool:** `EXPLAIN ANALYZE` on critical queries

**Queries to benchmark (run against production-scale seed data):**

| Query | Seed Data | Target |
|-------|-----------|--------|
| Open cases for designer (filtered, paginated) | 10K cases | < 20ms |
| Designer search (software + rating + available) | 5K designers | < 50ms |
| Case detail with relations (client, designer, latest version) | 10K cases | < 30ms |
| Dashboard stats aggregation | 50K cases, 10K payments | < 50ms |
| Unread notification count | 100K notifications | < 10ms |
| Message thread (last 50 messages for case) | 500K messages | < 20ms |

**Seed data script:** Generate realistic volume for testing (`supabase/seed-performance.sql`).

---

## 4. Monitoring Strategy (Post-Launch)

### 4.1 Real-Time Monitoring

| Tool | What it monitors | Alert threshold |
|------|-----------------|-----------------|
| **Vercel Analytics** | Web Vitals (LCP, FID, CLS, INP) | LCP > 2.5s for 5+ minutes |
| **Sentry** | JavaScript errors, API errors | Error rate > 1% over 5 minutes |
| **Supabase Dashboard** | DB connections, query time, storage usage | Connections > 80% of pool |
| **Stripe Dashboard** | Payment failures, dispute rate | Failure rate > 5% |
| **Uptime Robot** | Endpoint availability | Any downtime > 30 seconds |

### 4.2 Weekly Performance Review

Every week, check:
1. Vercel Analytics → Web Vitals trends (improving or degrading?)
2. Sentry → Top 5 errors by frequency
3. Supabase → Slowest queries (optimize if any > 100ms)
4. Bundle analysis → Has bundle size grown since last week?
5. Lighthouse → Run on key pages, compare to baseline

### 4.3 Performance Regression Prevention

**GitHub Actions CI pipeline:**
```
On every PR:
1. Build → fail if bundle size exceeds budget
2. Lighthouse CI → fail if scores below minimum
3. Unit tests → fail if any test fails
4. Typecheck → fail if TypeScript errors
```

---

## 5. Optimization Playbook

When a performance issue is detected, follow this order:

### Frontend Slow
1. Check LCP → Is the largest element loading late? Add `priority` to hero image.
2. Check bundle size → Is a page importing a heavy library? Use `dynamic()` import.
3. Check CLS → Are elements shifting? Add explicit `width`/`height` to images.
4. Check hydration → Is a Server Component accidentally marked `"use client"`?
5. Check third-party scripts → Is Stripe.js or analytics blocking render?

### API Slow
1. Check the database query → Run `EXPLAIN ANALYZE`. Missing index?
2. Check for N+1 → Is the route making multiple DB calls in a loop? Use joins.
3. Check payload size → Is the response returning unnecessary fields? Use `.select()`.
4. Check external calls → Is Stripe or Resend slow? Add timeout and fallback.
5. Check concurrency → Is the connection pool exhausted? Increase pool size.

### Database Slow
1. Add missing index (check `schema.sql` — is the filtered column indexed?)
2. Optimize query (fewer joins, specific columns, pagination)
3. Add materialized view for expensive aggregations (e.g., dashboard stats)
4. Archive old data (completed cases older than 1 year → cold storage)

---

## 6. Performance Test Results Template

Use this template to record benchmark results:

```markdown
## Performance Test Report — [Date]

### Environment
- **Target:** Production / Staging
- **Tool:** k6 v0.x / Lighthouse v12.x
- **Duration:** X minutes
- **Virtual Users:** X

### API Results
| Endpoint | P50 | P95 | P99 | Errors | Status |
|----------|-----|-----|-----|--------|--------|
| POST /auth/login | Xms | Xms | Xms | 0% | ✅/❌ |
| GET /cases | Xms | Xms | Xms | 0% | ✅/❌ |
| ... | | | | | |

### Web Vitals
| Page | LCP | FID | CLS | Score | Status |
|------|-----|-----|-----|-------|--------|
| Landing | Xs | Xms | X | X/100 | ✅/❌ |
| Dashboard | Xs | Xms | X | X/100 | ✅/❌ |
| ... | | | | | |

### Issues Found
1. [Description] → [Action taken]

### Next Steps
- ...
```
