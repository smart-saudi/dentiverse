# Security Policy

## Reporting a Vulnerability

We take security seriously at DentiVerse. If you discover a security vulnerability,
please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **security@dentiverse.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### What to Expect

| Timeframe | Action |
|-----------|--------|
| **24 hours** | We acknowledge receipt of your report |
| **72 hours** | We provide an initial assessment and severity rating |
| **7 days** | We aim to have a fix deployed for critical/high issues |
| **30 days** | We aim to have a fix deployed for medium/low issues |

### Scope

The following are **in scope**:
- `app.dentiverse.com` (production web application)
- `api.dentiverse.com/api/v1/*` (REST API)
- Authentication and authorization flaws
- Data exposure (accessing other users' data)
- Payment manipulation
- File upload vulnerabilities
- Cross-site scripting (XSS)
- SQL injection
- Server-side request forgery (SSRF)

The following are **out of scope**:
- Social engineering attacks
- Denial of service (DoS/DDoS) attacks
- Issues in third-party services (Supabase, Stripe, Vercel)
- Issues requiring physical access to a user's device
- Automated scanning results without proof of exploitability

### Safe Harbor

We will not pursue legal action against researchers who:
- Report vulnerabilities through the process above
- Do not access, modify, or delete other users' data
- Do not disclose the vulnerability publicly before we've addressed it
- Make a good-faith effort to avoid disrupting our services

### Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (production) | Yes |
| Staging/preview | Best effort |
| Local development | Not applicable |

### Recognition

We appreciate the security research community. Reporters of valid vulnerabilities
will be credited in our security acknowledgments (with permission) and may be
eligible for a reward based on severity:

| Severity | Reward |
|----------|--------|
| Critical | $500–$2,000 |
| High | $200–$500 |
| Medium | $50–$200 |
| Low | Acknowledgment |

Rewards are at our discretion and depend on the quality and impact of the report.

---

## Security Configuration

### Environment Variables

All secrets are stored in environment variables, never in code. See `.env.example` for the complete list.

**Critical secrets (rotate quarterly):**
- `SUPABASE_SERVICE_ROLE_KEY` — Bypasses RLS. Server-side only.
- `STRIPE_SECRET_KEY` — Stripe API access. Server-side only.
- `STRIPE_WEBHOOK_SECRET` — Webhook signature verification.

### Dependencies

- Dependencies are audited with `npm audit` before every release.
- Dependabot is enabled for automated vulnerability alerts.
- Critical vulnerabilities are patched within 48 hours.

### Data Encryption

- **At rest:** AES-256 (Supabase default)
- **In transit:** TLS 1.3 (enforced by Cloudflare + Vercel + Supabase)
- **Dental scans:** Private storage buckets, time-limited signed URLs (1hr expiry)
- **Payment data:** Never stored by DentiVerse. Handled entirely by Stripe (PCI DSS compliant).

### Authentication

- Supabase Auth with email verification required
- JWT access tokens (1hr expiry) + refresh token rotation
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Account lockout after 10 failed attempts
- Optional: Google OAuth, Magic Link

### Authorization

- Row Level Security (RLS) enabled on all database tables
- Role-based access: DENTIST, LAB, DESIGNER, ADMIN
- Service role key used only in webhooks and admin operations
