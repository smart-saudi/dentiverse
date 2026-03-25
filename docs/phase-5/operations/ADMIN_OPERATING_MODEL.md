# Admin Operating Model

## Launch Decision

DentiVerse ships with a role-guarded admin workspace at `/admin`.

The admin workspace is the primary surface for launch-critical support, moderation, payment intervention, and audit review. External consoles remain available for provider-native workflows and break-glass recovery:

- Supabase Dashboard / SQL Editor
- Stripe Dashboard
- Vercel Dashboard
- Sentry
- GitHub
- this runbook set

This is the long-term launch operating model for v1: use `/admin` first, and fall back to external consoles only when the action is provider-native or the app cannot recover safely.

## What Exists Today

- `/admin` is available only to active `ADMIN` users.
- The workspace includes five operator tabs:
  - Overview
  - Users
  - Cases
  - Payments
  - Audit Log
- Admin actions require a ticket reference and reason.
- Sensitive actions are audit-logged.
- External dashboards and SQL remain fallback tools for provider-native actions and break-glass recovery.

## Operator Roles

### Support Operator

Primary responsibilities:

- triage customer issues
- investigate case, proposal, message, and design history
- coordinate with clinics, labs, and designers
- trigger escalation to finance or engineering

Required tools:

- `/admin` access
- Sentry read access
- Vercel read access
- GitHub issue access
- Supabase Dashboard read access for fallback investigations

### Finance Operator

Primary responsibilities:

- refunds
- Stripe payment review
- payout issues
- dispute coordination

Required tools:

- `/admin` access
- Stripe Dashboard refund access
- Supabase Dashboard read access for reconciliation
- Supabase SQL Editor access for break-glass payment-state correction

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

## Primary In-Product Procedures

### 1. Review Operational Health

Use the **Overview** tab in `/admin` to review:

- total and suspended users
- active and disputed cases
- held and disputed payments
- recent audit activity

This is the default starting point for launch-day support and moderation triage.

### 2. Suspend or Reactivate a User

Use the **Users** tab in `/admin`.

Available actions:

- suspend account
- reactivate account

Expected workflow:

1. Open or update a support ticket.
2. Search for the user by name, email, role, or active state.
3. Choose the action.
4. Enter the ticket reference and reason.
5. Confirm the result in the updated user row and in the Audit Log tab.

Notes:

- Suspending a designer also marks them unavailable for new work.
- Admins cannot deactivate themselves.

### 3. Support a Case

Use the **Cases** tab in `/admin`.

Available actions:

- move case to `DISPUTED`
- move case back to `REVIEW`
- move case to `REVISION`
- cancel a case

Expected workflow:

1. Open or update a support ticket.
2. Filter or search for the case.
3. Choose the support action.
4. Enter the ticket reference and reason.
5. Confirm the new case status and check the related payment status when applicable.

Notes:

- Moving a case to `DISPUTED` or `CANCELLED` also marks related payments as disputed.
- Moving a case to `REVISION` increments the revision counter and updates submitted design versions accordingly.

### 4. Intervene on a Payment

Use the **Payments** tab in `/admin`.

Available actions:

- mark payment disputed
- release a held payment
- refund a payment

Expected workflow:

1. Open or update a finance ticket.
2. Locate the payment by status or related case.
3. Choose the action.
4. Enter the ticket reference and reason.
5. Confirm the updated payment state in the table and verify the audit entry.

Notes:

- Refund and release actions use the server-side Stripe integration.
- A payment must be `HELD` before it can be released manually.
- Refunds require a valid Stripe payment intent on the payment record.

### 5. Review Audit History

Use the **Audit Log** tab in `/admin`.

Expected workflow:

1. Filter by entity type, action, or search term.
2. Review actor, target entity, timestamps, and metadata.
3. Cross-reference the ticket reference before taking a follow-up action.

## Fallback And Break-Glass Procedures

Use external consoles only when:

- the action is provider-native and not exposed safely in `/admin`
- `/admin` is degraded or unavailable
- a historical data correction requires SQL
- Stripe or Supabase reconciliation cannot be completed from the app surface

Before any fallback action:

1. Open or update a support, finance, or incident ticket.
2. Confirm the operator has the minimum required permissions.
3. Prefer reversible state changes over destructive edits.
4. Mirror the action in `public.audit_log`.

### 1. Suspend a User With SQL Fallback

Use only when `/admin` cannot perform the action safely or when an incident requires direct SQL.

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

### 2. Restore a User With SQL Fallback

Use only after documented review when `/admin` is unavailable or cannot complete the recovery.

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

### 3. Freeze a Disputed Case With SQL Fallback

Use only when `/admin` cannot complete the case support transition safely.

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

### 4. Process a Refund With Stripe And SQL Fallback

Stripe remains the payment source of truth. Use this fallback only when the in-product payment action cannot complete successfully.

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

### 5. Review Audit History With SQL Fallback

Use Supabase SQL Editor or table browser only when the Audit Log tab is unavailable:

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

- Use `/admin` as the primary operator surface.
- Do not share service-role credentials outside trusted operators.
- Finance actions require a ticket reference and Stripe reconciliation.
- DB write procedures must be reversible where possible.
- Prefer changing availability and activation flags over deleting data.
- Never delete audit history.

## Remaining External-Console Work

- Stripe dashboard dispute evidence and provider-native reconciliation
- Supabase SQL break-glass repair procedures
- Vercel deploy and rollback controls
- Sentry incident triage
- GitHub release and incident coordination

These are not a substitute for `/admin`; they are fallback controls for provider-native or recovery-only scenarios.
