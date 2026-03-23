# DentiVerse — Threat Model

> Version 1.0 — March 2026
>
> This document identifies potential security threats to the DentiVerse platform,
> assesses their risk, and defines mitigations. Review and update quarterly
> or when the architecture changes.

---

## 1. System Overview

DentiVerse is a two-sided marketplace handling:
- **Protected Health Information (PHI):** Dental scans containing patient anatomy data
- **Financial transactions:** Payments between clients and designers via Stripe Connect escrow
- **Personally Identifiable Information (PII):** Names, emails, addresses, bank details
- **Intellectual Property:** Proprietary dental CAD designs

**Trust boundaries:**
1. Public internet → Cloudflare edge
2. Cloudflare → Vercel (Next.js)
3. Vercel → Supabase (Auth, DB, Storage)
4. Vercel → Stripe (Payments)
5. Browser → Supabase Realtime (WebSocket)
6. Browser → Supabase Storage (signed URL file access)

---

## 2. Threat Categories (STRIDE)

### 2.1 Spoofing (Identity)

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|--------|------|------------|
| S1 | Attacker creates account impersonating a dentist | Medium | High | **High** | Email verification required. Future: Professional license verification for regulated markets. |
| S2 | Session hijacking via stolen JWT | Low | Critical | **High** | Short-lived access tokens (1hr), refresh token rotation, `httpOnly` cookies for refresh tokens, rate limiting on `/auth/refresh`. |
| S3 | Brute-force password attacks | Medium | High | **High** | Rate limiting on login (5 attempts/15min), account lockout after 10 failures, Supabase built-in protection. |
| S4 | Credential stuffing with leaked passwords | Medium | High | **High** | Enforce minimum 8-char passwords, encourage unique passwords. Future: Breach detection integration (HaveIBeenPwned API). |
| S5 | Fake designer submitting low-quality work | High | Medium | **High** | Rating system, money-back guarantee, 3D preview before payment, designer onboarding review. |

### 2.2 Tampering (Data Integrity)

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|--------|------|------------|
| T1 | Client modifies agreed price after designer starts work | Low | High | **Medium** | `agreed_price` set on proposal acceptance and immutable. Audit log tracks all changes. |
| T2 | Designer replaces design files with corrupted/malicious files | Low | Critical | **High** | File type validation (magic bytes, not just extension), virus scanning on upload, files stored with versioning. |
| T3 | Attacker modifies Stripe webhook payload | Low | Critical | **High** | Stripe webhook signature verification (`constructEvent` with `whsec_`). Reject unverified payloads. |
| T4 | SQL injection to modify database records | Low | Critical | **High** | Supabase client uses parameterized queries. No raw SQL in application code. RLS as second defense layer. |
| T5 | Manipulation of case status to skip payment | Low | Critical | **High** | Status transitions enforced server-side in `case.service.ts`. Only valid transitions allowed (e.g., can't go from OPEN → COMPLETED). |

### 2.3 Repudiation (Deniability)

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|--------|------|------------|
| R1 | Client claims they never approved the design | Medium | High | **High** | `audit_log` table records all status changes with user ID, timestamp, and IP address. Approval requires explicit action (button click → API call → logged). |
| R2 | Designer claims they never received the case | Low | Medium | **Medium** | Notification log (in-app + email) with delivery timestamps. Case assignment recorded in audit log. |
| R3 | Dispute over agreed terms (price, deadline, revisions) | Medium | Medium | **Medium** | All terms captured in `cases` and `proposals` tables at time of acceptance. Immutable after acceptance. |

### 2.4 Information Disclosure

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|--------|------|------------|
| I1 | Unauthorized access to dental scan files (PHI) | Medium | Critical | **Critical** | Private Supabase Storage buckets, signed URLs (1hr expiry), RLS policies restrict access to case participants only. |
| I2 | API endpoint leaks other users' data | Medium | Critical | **Critical** | RLS on all tables. Integration tests verify data isolation. API routes check `user.id` against resource ownership. |
| I3 | Error messages expose internal system details | Medium | Medium | **Medium** | Generic error messages to clients. Detailed errors only in server logs (Sentry). Never return stack traces. |
| I4 | Secrets (API keys) committed to repository | Low | Critical | **High** | `.gitignore` includes `.env.local`. Pre-commit hook scans for secret patterns. Only `NEXT_PUBLIC_*` vars in client code. |
| I5 | Designer sees other designers' proposals/pricing | Low | High | **Medium** | RLS policy: designers can only see their own proposals. Clients see all proposals on their cases. |
| I6 | Dental scan metadata leaks patient identity | Medium | Critical | **Critical** | Strip DICOM metadata on upload (Edge Function). Store scans without patient names/IDs. Advise clients to anonymize scans. |

### 2.5 Denial of Service

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|--------|------|------------|
| D1 | DDoS attack on the web application | Medium | High | **High** | Cloudflare DDoS protection, rate limiting, Vercel auto-scaling. |
| D2 | Large file upload exhausts storage/bandwidth | Medium | Medium | **Medium** | File size limits (500MB scans, 50MB portfolios, 5MB avatars). Rate limit uploads per user (10/hour). |
| D3 | Spam case creation floods the marketplace | Medium | Medium | **Medium** | Rate limit case creation (10/day per user). Email verification required. Future: CAPTCHA for suspicious patterns. |
| D4 | Malicious designer accepts cases and never delivers | High | High | **High** | Automatic deadline enforcement. Escrow refunded if designer misses deadline. Low-rating designers flagged and suspended. |

### 2.6 Elevation of Privilege

| ID | Threat | Likelihood | Impact | Risk | Mitigation |
|----|--------|-----------|--------|------|------------|
| E1 | Designer accesses admin functionality | Low | Critical | **High** | Role-based access control. Admin routes check `role === 'ADMIN'`. RLS policies enforce role separation. |
| E2 | Client modifies their role to DESIGNER to access proposals | Low | High | **Medium** | Role set at registration, immutable via public API. Only admin can change roles (service role client). |
| E3 | Attacker exploits RLS policy gap | Medium | Critical | **Critical** | Comprehensive RLS test suite. Every policy tested with multiple user roles. Quarterly RLS audit. |
| E4 | Service role key leaked, bypasses all RLS | Low | Critical | **Critical** | Service role key in `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`). Used only in webhooks and admin operations. Rotated quarterly. |

---

## 3. Data Classification

| Classification | Examples | Storage | Access | Encryption |
|---------------|----------|---------|--------|------------|
| **Critical** | Dental scans, payment data, service role key | Supabase Storage (private), Stripe | Case participants only, via signed URLs | AES-256 at rest, TLS 1.3 in transit |
| **Sensitive** | Emails, names, phone numbers, bank details | Supabase PostgreSQL | Owner + admin | AES-256 at rest, TLS 1.3 in transit |
| **Internal** | Case details, proposals, reviews, messages | Supabase PostgreSQL | Participants per RLS | AES-256 at rest, TLS 1.3 in transit |
| **Public** | Designer profiles, portfolio images, ratings | Supabase PostgreSQL + public bucket | Anyone | TLS 1.3 in transit |

---

## 4. Compliance Requirements

| Regulation | Applicability | Key Requirements | Status |
|-----------|--------------|-----------------|--------|
| **HIPAA** | US dental clinics (dental scans = PHI) | BAA with Supabase, encrypted storage, access controls, audit logging | Supabase Pro supports BAA. Audit log table implemented. |
| **GDPR** | EU/UK users | Data consent, right to deletion, data portability, DPO if needed | Consent at registration. Deletion endpoint planned. Privacy policy needed. |
| **PCI DSS** | Payment processing | Never store card data | Handled entirely by Stripe. DentiVerse never touches card numbers. |
| **SOC 2** | Enterprise clients may require | Security, availability, processing integrity | Supabase and Vercel are SOC 2 compliant. DentiVerse-specific audit: future. |

---

## 5. Risk Matrix Summary

```
IMPACT →        Low         Medium        High         Critical
LIKELIHOOD ↓
High                        D4, S5        D1            
Medium          R2          D2, D3, I3    S1,S3,S4,T2   I1, I2, I6, E3
Low                         E2            T1,R3,I5      S2,T3,T4,T5,I4,E1,E4
```

**Top 5 risks to address first:**
1. **I1 / I6** — Unauthorized access to dental scans (PHI exposure)
2. **E3** — RLS policy gaps allowing cross-user data access
3. **T3 / T5** — Payment/status manipulation
4. **S2 / E4** — Token hijacking or service key leak
5. **D4 / S5** — Malicious or fake marketplace participants

---

## 6. Incident Response

### Severity Levels

| Level | Definition | Response Time | Examples |
|-------|-----------|--------------|---------|
| **P0 — Critical** | Data breach, payment system compromised, complete outage | 1 hour | PHI leak, Stripe key compromised |
| **P1 — High** | Significant functionality broken, security vulnerability exploitable | 4 hours | Auth bypass, RLS gap, payment failure |
| **P2 — Medium** | Feature degraded, non-critical security issue | 24 hours | Search broken, slow queries, minor UI bug |
| **P3 — Low** | Cosmetic, minor inconvenience | 1 week | Typo, styling issue, edge case |

### Response Steps

1. **Detect** — Sentry alert, user report, or monitoring trigger
2. **Contain** — Disable affected feature/endpoint immediately
3. **Assess** — Determine scope, affected users, data exposure
4. **Fix** — Deploy hotfix, rotate compromised keys
5. **Notify** — Inform affected users within 72 hours (GDPR) or 60 days (HIPAA)
6. **Post-mortem** — Document in `CLAUDE.md` → "Past Mistakes & Learnings" section
