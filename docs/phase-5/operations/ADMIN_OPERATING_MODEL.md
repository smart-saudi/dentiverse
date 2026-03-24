# Admin Operating Model

## Launch Decision

DentiVerse v1 launches without an in-product admin panel.

Internal support, moderation, and refund handling are manual operations performed through:

- Supabase Dashboard / SQL Editor
- Stripe Dashboard
- Vercel Dashboard
- Sentry
- GitHub
- this runbook set

This is an explicit launch decision for a controlled release, not an accidental gap.

## What Exists Today

- The public product has no `/admin` route and no admin UI.
- The database still supports the `ADMIN` role for future product work and controlled internal use.
- Audit logging exists and must be used to record sensitive manual interventions.

## Operator Roles

### Support Operator

Primary responsibilities:

- triage customer issues
- investigate case, proposal, message, and design history
- coordinate with clinics, labs, and designers
- trigger escalation to finance or engineering

Required tools:

- Supabase Dashboard read access
- Sentry read access
- Vercel read access
- GitHub issue access

### Finance Operator

Primary responsibilities:

- refunds
- Stripe payment review
- payout issues
- dispute coordination

Required tools:

- Stripe Dashboard refund access
- Supabase Dashboard read access
- Supabase SQL Editor access for payment-state reconciliation

### Break-Glass DB Operator

Primary responsibilities:

- reversible direct database updates during incidents
- manual case/payment/user state correction when product flows cannot recover safely

Required tools:

- Supabase SQL Editor access
- access to this document and [RUNBOOK.md](./RUNBOOK.md)

Rules:

- use direct SQL only for documented procedures or incident-approved recovery
- every write must include a ticket or incident reference
- every sensitive action must be mirrored in `public.audit_log`

## Source-of-Truth Systems

| Operation                                  | Source of truth                                     |
| ------------------------------------------ | --------------------------------------------------- |
| User identity and account state            | Supabase Auth + `public.users`                      |
| Case, proposal, review, and designer state | Supabase Postgres                                   |
| Refunds and payment status                 | Stripe first, then `public.payments` reconciliation |
| Runtime incidents                          | Sentry + Vercel logs                                |
| Release and rollback history               | GitHub Actions + Vercel deployments                 |

## Standard Procedures

### 1. Suspend a User

Use when a user must be blocked from further activity because of abuse, fraud, or a serious policy violation.

1. Open a support ticket and record the user ID and reason.
2. In Supabase SQL Editor, run:

```sql
update public.users
set
  is_active = false,
  updated_at = now()
where id = '<user-id>';

update public.designer_profiles
set
  is_available = false,
  updated_at = now()
where user_id = '<user-id>';

insert into public.audit_log (
  action,
  entity_type,
  entity_id,
  user_id,
  new_data
) values (
  'admin.user.deactivated',
  'user',
  '<user-id>',
  null,
  jsonb_build_object(
    'ticket', 'SUP-000',
    'operator', 'name@example.com',
    'reason', 'policy violation'
  )
);
```

3. Confirm the user can no longer operate normally.
4. Reply to the support ticket with the timestamp and operator.

### 2. Restore a User

Use only after documented review.

```sql
update public.users
set
  is_active = true,
  updated_at = now()
where id = '<user-id>';

update public.designer_profiles
set
  is_available = true,
  updated_at = now()
where user_id = '<user-id>';

insert into public.audit_log (
  action,
  entity_type,
  entity_id,
  user_id,
  new_data
) values (
  'admin.user.reactivated',
  'user',
  '<user-id>',
  null,
  jsonb_build_object(
    'ticket', 'SUP-000',
    'operator', 'name@example.com'
  )
);
```

### 3. Freeze a Disputed Case

Use when delivery, pricing, or quality is under dispute and neither party should continue through the normal approval/payment path.

```sql
update public.cases
set
  status = 'DISPUTED',
  updated_at = now()
where id = '<case-id>';

update public.payments
set
  status = 'DISPUTED',
  updated_at = now()
where case_id = '<case-id>';

insert into public.audit_log (
  action,
  entity_type,
  entity_id,
  user_id,
  new_data
) values (
  'admin.case.disputed',
  'case',
  '<case-id>',
  null,
  jsonb_build_object(
    'ticket', 'SUP-000',
    'operator', 'name@example.com'
  )
);
```

Then:

- contact both parties from the support mailbox
- decide whether the outcome is refund, revision, or case cancellation

### 4. Process a Refund

Stripe is the payment source of truth. Always perform the refund in Stripe first.

1. Find the payment in Stripe using `stripe_payment_intent_id` or case metadata.
2. Issue the refund in Stripe Dashboard.
3. Copy the Stripe refund ID.
4. Reconcile the app record:

```sql
update public.payments
set
  status = 'REFUNDED',
  stripe_refund_id = '<stripe-refund-id>',
  refunded_at = now(),
  updated_at = now()
where id = '<payment-id>';

insert into public.audit_log (
  action,
  entity_type,
  entity_id,
  user_id,
  new_data
) values (
  'admin.payment.refunded',
  'payment',
  '<payment-id>',
  null,
  jsonb_build_object(
    'ticket', 'FIN-000',
    'operator', 'name@example.com',
    'stripe_refund_id', '<stripe-refund-id>'
  )
);
```

5. If the case should be closed as cancelled, also update `public.cases` with `status = 'CANCELLED'`, `cancelled_at = now()`, and `cancellation_reason`.

### 5. Review Audit History

Use Supabase SQL Editor or table browser:

```sql
select
  created_at,
  action,
  entity_type,
  entity_id,
  user_id,
  new_data
from public.audit_log
order by created_at desc
limit 100;
```

## Permissions and Safeguards

- Do not share service-role credentials outside trusted operators.
- Finance actions require a ticket reference and Stripe reconciliation.
- DB write procedures must be reversible where possible.
- Prefer changing availability and activation flags over deleting data.
- Never delete audit history.

## Out of Scope for v1

- customer-facing admin dashboard
- internal moderation queue UI
- in-app support inbox
- self-serve refund console

These remain valid future enhancements, but they are not launch blockers as long as the manual model above is followed.
