# DentiVerse — Performance Benchmark Report

> Last updated: 2026-03-23
> Status: Baseline thresholds defined, pre-production

---

## 1. Performance Objectives

DentiVerse must deliver a fast, responsive experience for dental professionals who rely on it during clinical workflows. Slow pages or API responses directly impact user trust and adoption.

### Core Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API response time (p95)** | < 200ms | Under 1,000 concurrent users |
| **API response time (p99)** | < 500ms | Under 1,000 concurrent users |
| **Time to First Byte (TTFB)** | < 200ms | Vercel Edge, global CDN |
| **Largest Contentful Paint (LCP)** | < 2.5s | Core Web Vitals |
| **First Input Delay (FID)** | < 100ms | Core Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Core Web Vitals |
| **Interaction to Next Paint (INP)** | < 200ms | Core Web Vitals |
| **Build time** | < 120s | CI/CD pipeline |
| **Bundle size (JS, gzipped)** | < 200KB | First-load shared JS |

---

## 2. API Endpoint Benchmarks

### 2.1 Endpoint-Level Targets

| Endpoint | Method | Expected p95 | Notes |
|----------|--------|-------------|-------|
| `/api/v1/auth/login` | POST | < 300ms | Supabase Auth bcrypt comparison |
| `/api/v1/auth/register` | POST | < 500ms | Auth + users table insert |
| `/api/v1/cases` | GET | < 150ms | Paginated list, indexed queries |
| `/api/v1/cases` | POST | < 200ms | Single insert with validation |
| `/api/v1/cases/[id]` | GET | < 100ms | Single row by primary key |
| `/api/v1/cases/[id]` | PATCH | < 150ms | Update + return |
| `/api/v1/cases/[id]/proposals` | GET | < 150ms | Paginated, filtered by case_id |
| `/api/v1/cases/[id]/proposals` | POST | < 200ms | Insert with validation |
| `/api/v1/cases/[id]/messages` | GET | < 150ms | Paginated, newest first |
| `/api/v1/cases/[id]/messages` | POST | < 200ms | Insert + realtime broadcast |
| `/api/v1/designers` | GET | < 200ms | Search with filters, joins |
| `/api/v1/payments` | POST | < 1000ms | Includes Stripe PaymentIntent creation |
| `/api/v1/files` | POST | < 5000ms | File upload (up to 100MB) |
| `/api/v1/notifications` | GET | < 100ms | Paginated, indexed by user_id |
| `/api/v1/notifications/unread-count` | GET | < 50ms | COUNT query with index |
| `/api/v1/webhooks/stripe` | POST | < 500ms | Signature verify + DB update |

### 2.2 Database Query Performance

| Query Pattern | Expected Time | Index Required |
|--------------|--------------|---------------|
| `cases WHERE client_id = $1` | < 5ms | `idx_cases_client_id` |
| `cases WHERE status = $1` | < 10ms | `idx_cases_status` |
| `proposals WHERE case_id = $1` | < 5ms | `idx_proposals_case_id` |
| `messages WHERE case_id = $1 ORDER BY created_at` | < 10ms | `idx_messages_case_id_created_at` |
| `notifications WHERE user_id = $1 AND is_read = false` | < 5ms | `idx_notifications_user_read` |
| `payments WHERE client_id = $1 OR designer_id = $1` | < 10ms | `idx_payments_client_id`, `idx_payments_designer_id` |
| `designers JOIN users` | < 15ms | Primary key joins |

---

## 3. Frontend Performance

### 3.1 Page Load Targets

| Page | Route | LCP Target | JS Budget |
|------|-------|-----------|-----------|
| Landing | `/` | < 1.5s | < 80KB |
| Login | `/login` | < 1.0s | < 60KB |
| Dashboard | `/` (auth) | < 2.0s | < 120KB |
| Case List | `/cases` | < 2.0s | < 100KB |
| Case Detail | `/cases/[id]` | < 2.5s | < 150KB (includes chat) |
| Designer Browse | `/designers` | < 2.0s | < 100KB |
| 3D Viewer | STL viewer | < 3.0s | < 500KB (Three.js, lazy) |
| Notifications | `/notifications` | < 1.5s | < 80KB |

### 3.2 Bundle Optimization Strategy

| Technique | Status | Impact |
|-----------|--------|--------|
| **Code splitting (App Router)** | Active | Each route loads only its JS |
| **Dynamic imports (Three.js)** | Active | STL viewer loaded on demand |
| **Image optimization (next/image)** | Active | Automatic WebP, lazy loading |
| **Font optimization (next/font)** | Active | Self-hosted, no FOUT |
| **Tree shaking** | Active | Dead code eliminated |
| **Lazy loading (Uppy)** | Planned | File uploader loaded on demand |
| **Service Worker caching** | Planned | Offline support for static assets |

### 3.3 Current Build Metrics

```
Route (app)                          Size     First Load JS
─────────────────────────────────────────────────────────────
○ /                                  9.12 kB      111 kB
○ /login                             2.95 kB      155 kB
○ /cases                             4.69 kB      119 kB
ƒ /cases/[id]                       10.5 kB       163 kB
○ /designers                        18.8 kB       133 kB
○ /notifications                     4.27 kB      115 kB
○ /payments                          4.39 kB      115 kB

First Load JS shared by all          102 kB
```

**Assessment**: Shared bundle at 102KB is within budget. Case detail page at 163KB is acceptable given chat and case data. Designer browse at 133KB should be monitored.

---

## 4. Scalability Thresholds

### 4.1 Concurrent User Targets

| Tier | Users | Status | Infrastructure |
|------|-------|--------|---------------|
| **Launch** | 100 concurrent | Target | Vercel Pro + Supabase Free |
| **Growth** | 1,000 concurrent | Target | Vercel Pro + Supabase Pro |
| **Scale** | 10,000 concurrent | Stretch | Vercel Enterprise + Supabase Team |

### 4.2 Database Limits

| Resource | Supabase Free | Supabase Pro | Our Threshold |
|----------|--------------|-------------|--------------|
| Database size | 500MB | 8GB | Monitor at 400MB |
| File storage | 1GB | 100GB | Monitor at 800MB |
| Realtime connections | 200 | 500 | Monitor at 150 |
| Edge function invocations | 500K/month | 2M/month | Monitor at 400K |
| API requests | Unlimited | Unlimited | Rate limit: 100/min/user |

### 4.3 Stripe Limits

| Resource | Test Mode | Live Mode |
|----------|----------|-----------|
| API rate limit | 25/sec | 100/sec |
| Webhook delivery | Real-time | Real-time |
| Connect accounts | Unlimited | Unlimited |

---

## 5. Testing Strategy

### 5.1 Load Testing Plan

**Tool**: k6 (Grafana k6) or Artillery

```javascript
// Example k6 scenario
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp to 100 users
    { duration: '5m', target: 100 },   // Hold at 100
    { duration: '2m', target: 500 },   // Ramp to 500
    { duration: '5m', target: 500 },   // Hold at 500
    { duration: '2m', target: 1000 },  // Ramp to 1000
    { duration: '5m', target: 1000 },  // Hold at 1000
    { duration: '3m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],    // < 1% error rate
  },
};
```

### 5.2 Key Test Scenarios

| Scenario | Users | Duration | Endpoints Tested |
|----------|-------|----------|-----------------|
| **Auth stress** | 500 | 5 min | login, register |
| **Case browsing** | 1000 | 10 min | GET cases, GET cases/[id] |
| **Messaging burst** | 200 | 5 min | POST/GET messages |
| **File upload** | 50 | 5 min | POST files (10MB each) |
| **Mixed workload** | 1000 | 15 min | All endpoints, weighted by usage |

### 5.3 Monitoring Tools

| Tool | Purpose | Status |
|------|---------|--------|
| **Vercel Analytics** | Core Web Vitals, page performance | Integrated |
| **Vercel Speed Insights** | Real user performance data | Integrated |
| **Sentry** | Error tracking, performance traces | Planned |
| **Supabase Dashboard** | DB metrics, connection pool, storage | Available |
| **Stripe Dashboard** | Payment latency, webhook delivery | Available |

---

## 6. Acceptance Criteria

### Pass/Fail Matrix

| Criterion | Pass | Fail |
|-----------|------|------|
| API p95 latency | < 200ms | >= 200ms |
| API error rate | < 1% | >= 1% |
| LCP (all pages) | < 2.5s | >= 2.5s |
| CLS (all pages) | < 0.1 | >= 0.1 |
| Build succeeds | Yes | No |
| All 292 tests pass | Yes | No |
| Zero critical security issues | Yes | No |
| JS bundle (shared) | < 200KB | >= 200KB |

### Current Status

| Criterion | Value | Status |
|-----------|-------|--------|
| Build | Passes | **PASS** |
| Tests | 292/292 | **PASS** |
| Shared JS bundle | 102KB | **PASS** |
| Load testing | Not yet run | **PENDING** |
| Core Web Vitals | Not yet measured (need production) | **PENDING** |

---

## 7. Next Steps

1. Deploy to Vercel preview and measure real Core Web Vitals
2. Set up k6 load test scripts in `tests/load/`
3. Run baseline load test against staging environment
4. Configure Sentry performance monitoring
5. Set up alerting for p95 > 200ms on critical endpoints
6. Implement lazy loading for Uppy file uploader component
7. Add database query performance monitoring via Supabase observability
