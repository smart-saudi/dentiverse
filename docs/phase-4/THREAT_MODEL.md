# DentiVerse — Threat Model

> Last updated: 2026-03-23
> Methodology: STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

---

## 1. System Overview

DentiVerse is a dental design marketplace connecting dentists (clients) with dental designers. It handles:

- **Authentication** — Email/password, Google OAuth, Magic Link via Supabase Auth
- **Patient dental data** — Case descriptions, tooth numbers, 3D scan files (STL/OBJ)
- **Financial transactions** — Stripe Connect escrow payments with platform fee
- **Real-time messaging** — Case-scoped chat between clients and designers
- **File storage** — Dental scans, design files, portfolios via Supabase Storage

### Trust Boundaries

```
┌─────────────────────────────────────────────────┐
│  BROWSER (Untrusted)                            │
│  - React SPA, Zustand stores, fetch calls       │
│  - NEXT_PUBLIC_* env vars (public)              │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS (TLS 1.3)
┌──────────────────▼──────────────────────────────┐
│  VERCEL EDGE / NEXT.JS SERVER (Semi-trusted)    │
│  - API routes (/api/v1/*)                       │
│  - Middleware (session refresh)                  │
│  - Server Components                            │
└──────┬──────────────────┬───────────────────────┘
       │                  │
┌──────▼──────┐   ┌───────▼──────────────────────┐
│  SUPABASE   │   │  STRIPE                      │
│  (Trusted)  │   │  (Trusted)                   │
│  - Auth     │   │  - PaymentIntents            │
│  - Postgres │   │  - Connect Transfers         │
│  - Storage  │   │  - Webhook signatures        │
│  - Realtime │   └──────────────────────────────┘
└─────────────┘
```

---

## 2. Assets & Sensitivity

| Asset | Sensitivity | Storage | Access Control |
|-------|------------|---------|---------------|
| User credentials (email/password) | **Critical** | Supabase Auth (bcrypt) | Auth service only |
| JWT session tokens | **Critical** | HTTP-only cookies | Supabase middleware |
| Supabase service role key | **Critical** | Server env var | Webhook handler only |
| Stripe secret key | **Critical** | Server env var | Payment service only |
| Patient dental data (cases) | **High** | Postgres (RLS) | Case owner + assigned designer |
| 3D scan files (STL/OBJ) | **High** | Supabase Storage (private) | Signed URLs (1hr) |
| Payment records | **High** | Postgres (RLS) | Payer + payee only |
| Chat messages | **Medium** | Postgres (RLS) | Case participants only |
| User profiles (name, email) | **Medium** | Postgres (RLS) | Public (designers), self (others) |
| Designer portfolios | **Low** | Supabase Storage (public) | Public read, owner write |

---

## 3. STRIDE Threat Analysis

### 3.1 Spoofing (Identity)

| ID | Threat | Target | Likelihood | Impact | Mitigation |
|----|--------|--------|-----------|--------|------------|
| S1 | Attacker uses stolen credentials | Auth endpoints | Medium | Critical | Supabase Auth with bcrypt, rate limiting (5/15min), account lockout (10 attempts) |
| S2 | Session hijacking via XSS | JWT cookies | Low | Critical | HTTP-only cookies, `SameSite=Lax`, CSP headers |
| S3 | Forged Stripe webhook events | `/api/v1/webhooks/stripe` | Medium | Critical | `stripe.webhooks.constructEvent()` signature verification |
| S4 | Impersonation in password reset | `/api/v1/auth/forgot-password` | Low | High | Does not reveal whether email exists (returns success always) |

### 3.2 Tampering (Data Integrity)

| ID | Threat | Target | Likelihood | Impact | Mitigation |
|----|--------|--------|-----------|--------|------------|
| T1 | Modify case data of another user | PATCH `/api/v1/cases/[id]` | Medium | High | RLS policies restrict update to `client_id = auth.uid()` |
| T2 | Manipulate payment amount | POST `/api/v1/payments` | Medium | Critical | Platform fee calculated server-side; amount from proposal (not user input) |
| T3 | Modify proposal after acceptance | PATCH proposals | Low | High | Status state machine enforced in service layer |
| T4 | Upload malicious file as STL | POST `/api/v1/files` | Medium | Medium | MIME type allowlist + extension check; no server-side execution |
| T5 | SQL injection via Supabase queries | All API routes | Low | Critical | Supabase JS client uses parameterized queries; no raw SQL |

### 3.3 Repudiation (Deniability)

| ID | Threat | Target | Likelihood | Impact | Mitigation |
|----|--------|--------|-----------|--------|------------|
| R1 | Designer denies receiving payment | Payment system | Low | High | Stripe transfer IDs stored in DB; Stripe dashboard as audit trail |
| R2 | User denies sending message | Chat system | Low | Medium | Messages stored with `sender_id` and `created_at` timestamps |
| R3 | Admin denies modifying data | Admin operations | Medium | High | **Gap**: No audit log for admin actions — needs implementation |

### 3.4 Information Disclosure

| ID | Threat | Target | Likelihood | Impact | Mitigation |
|----|--------|--------|-----------|--------|------------|
| I1 | Access other user's cases | GET `/api/v1/cases/[id]` | Medium | High | RLS: `client_id = auth.uid() OR designer_id = auth.uid()` |
| I2 | Enumerate user emails | Registration/forgot-password | Low | Medium | Registration returns generic error; forgot-password always succeeds |
| I3 | Dental scan files exposed | Supabase Storage | Low | High | Private buckets with signed URLs (1hr expiry) |
| I4 | Error messages leak internal details | All API routes | Medium | Low | Generic error messages in production; stack traces only in dev |
| I5 | Client-side state exposes secrets | Zustand stores | Low | Medium | Only public data in client stores; tokens in HTTP-only cookies |

### 3.5 Denial of Service

| ID | Threat | Target | Likelihood | Impact | Mitigation |
|----|--------|--------|-----------|--------|------------|
| D1 | Large file upload flood | POST `/api/v1/files` | Medium | Medium | 100MB max file size; auth required; Supabase storage quotas |
| D2 | API endpoint abuse | All API routes | Medium | Medium | Vercel edge rate limiting; Supabase connection pooling |
| D3 | Realtime subscription flood | Supabase Realtime | Low | Medium | Supabase built-in connection limits per project |
| D4 | Unbounded list queries | GET list endpoints | Low | Low | All list endpoints paginated (max 100 per_page via Zod) |

### 3.6 Elevation of Privilege

| ID | Threat | Target | Likelihood | Impact | Mitigation |
|----|--------|--------|-----------|--------|------------|
| E1 | User changes own role to ADMIN | User profile update | Medium | Critical | `role` field not in update schemas; role set only at registration |
| E2 | Designer accesses admin client | Service layer | Low | Critical | `createAdminClient()` only in webhook handler (server-only module) |
| E3 | Client creates proposal (designer-only) | POST proposals | Medium | Medium | **Review**: RLS should enforce `role = 'DESIGNER'` on proposals insert |
| E4 | Bypass RLS via direct DB access | Database | Very Low | Critical | No direct DB credentials exposed; service role key server-only |

---

## 4. Attack Scenarios

### Scenario 1: Payment Manipulation (Critical)
**Attacker**: Malicious client
**Attack**: Submit a payment with a manipulated lower amount
**Path**: POST `/api/v1/payments` → modify `amount` field
**Mitigation**: Payment amount derived from accepted proposal price server-side; Zod validates but amount should be cross-checked against proposal record. **Action needed**: Verify `createPayment` validates amount against proposal.

### Scenario 2: IDOR on Case Data (High)
**Attacker**: Authenticated user (different client)
**Attack**: Access another user's case by guessing UUID
**Path**: GET `/api/v1/cases/{victim-case-id}`
**Mitigation**: RLS policy on `cases` table restricts SELECT to `client_id = auth.uid()` or assigned designer. UUIDs are v4 (unguessable). **Status**: Protected by RLS.

### Scenario 3: Open Redirect via Login (Medium)
**Attacker**: Phisher
**Attack**: Craft login URL with `redirectTo=https://evil.com`
**Path**: `/login?redirectTo=https://evil.com`
**Mitigation**: `redirectTo` parameter is used client-side for `router.push()`. **Action needed**: Validate that redirectTo is a relative path (starts with `/`).

### Scenario 4: Webhook Replay (Medium)
**Attacker**: Network attacker
**Attack**: Replay a captured Stripe webhook event
**Mitigation**: `stripe.webhooks.constructEvent()` verifies signature + timestamp tolerance (default 300s). **Status**: Protected.

### Scenario 5: Malicious File Upload (Medium)
**Attacker**: Authenticated user
**Attack**: Upload executable disguised as STL file
**Path**: POST `/api/v1/files` → rename `.exe` to `.stl`
**Mitigation**: MIME type allowlist + extension check. Files stored in Supabase Storage (no server-side execution). Signed URLs prevent direct access. **Action needed**: Consider adding magic-byte validation for STL files.

---

## 5. Risk Matrix Summary

| Risk Level | Count | Action Required |
|-----------|-------|----------------|
| **Critical** | 2 | Payment amount validation, admin audit logging |
| **High** | 3 | Open redirect validation, role-based proposal restriction, file magic-byte check |
| **Medium** | 4 | Rate limiting hardening, error message review, CORS policy review |
| **Low** | 3 | Monitoring improvements, log aggregation |

---

## 6. Recommended Actions (Priority Order)

1. **[Critical]** Add server-side cross-validation of payment amount against proposal price
2. **[Critical]** Implement audit logging for admin/service-role operations
3. **[High]** Validate `redirectTo` parameter is a relative URL (prevent open redirect)
4. **[High]** Add RLS policy enforcing `role = 'DESIGNER'` for proposal inserts
5. **[High]** Add magic-byte validation for uploaded 3D files
6. **[Medium]** Add rate limiting middleware to API routes (e.g., `@vercel/edge-rate-limit`)
7. **[Medium]** Review and tighten CORS policy in `next.config.ts`
8. **[Medium]** Add Content-Security-Policy headers
9. **[Low]** Integrate Sentry for centralized error tracking and alerting
10. **[Low]** Add structured logging for audit trail

---

## 7. Compliance Considerations

| Regulation | Relevance | Status |
|-----------|-----------|--------|
| **HIPAA** | Dental patient data may be PHI | **Review needed** — if dental scans identify patients, BAA with Supabase required |
| **PCI DSS** | Payment card data | **Compliant** — Stripe handles all card data; DentiVerse never touches PANs |
| **GDPR** | EU user personal data | **Partial** — Need data deletion endpoint and privacy policy |
| **SOC 2** | Infrastructure security | Inherited from Supabase (SOC 2 Type II) and Vercel |
