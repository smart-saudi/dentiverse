# SLA / SLO

## Service Posture

DentiVerse is a transaction-sensitive marketplace. Reliability priorities are authentication, secure file access, case workflows, and payment processing.

## SLA

- Monthly uptime target: 99.9%
- Planned maintenance: up to 2 hours per month with advance notice
- Incident acknowledgement target: within 30 minutes during business coverage

Exclusions:

- upstream provider outages outside DentiVerse control
- announced maintenance windows
- customer-side connectivity issues

## SLOs

### Availability

- Web application: 99.9% monthly
- Auth success rate: 99.9% monthly
- Signed URL generation success rate: 99.95% monthly
- Stripe webhook processing success rate: 99.95% monthly

### Latency

- Landing page p95 response: under 500 ms
- Standard CRUD API p95 response: under 800 ms
- Payment and review API p95 response: under 1200 ms
- Signed URL route p95 response: under 500 ms

### Recovery

- Rollback start time after failed production deploy: within 15 minutes
- P1 mitigation start: within 30 minutes

## SLIs

- successful HTTP requests / total HTTP requests
- successful auth completions / total auth attempts
- successful signed URL responses / total signed URL requests
- successful Stripe webhook handoffs / total webhook deliveries
- p95 latency from logs and tracing

## Error Budget

- 99.9% monthly uptime allows about 43 minutes of downtime
- If the error budget is exhausted, pause non-critical releases until reliability work ships

## Review Cadence

- Weekly reliability review
- Monthly SLA/SLO review
- Mandatory post-incident review for every P1 and P2 event
