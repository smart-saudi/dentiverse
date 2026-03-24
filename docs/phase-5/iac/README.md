# Infrastructure as Code

This phase standardizes DentiVerse delivery around checked-in runtime and infrastructure assets instead of manual dashboard clicks.

## Files

- [Dockerfile](../../../Dockerfile): production image build
- [docker-compose.yml](../../../docker-compose.yml): local app container with hot reload
- [infra/terraform/README.md](../../../infra/terraform/README.md): Terraform usage and scope
- [.github/workflows/deploy.yml](../../../.github/workflows/deploy.yml): validation and deployment automation

## Scope

Terraform manages the Vercel project, application environment variables, and optional production domain. Supabase, Stripe, Resend, and Sentry remain external managed services and are injected through Terraform-managed runtime configuration.

## Local Development Parity

`docker-compose.yml` is designed to run alongside the existing `supabase start` workflow. Start it with `docker compose --env-file .env.local up web`. The app container talks to a locally running Supabase stack through `host.docker.internal` by default, which keeps local runtime behavior close to production without duplicating the entire Supabase topology in this repository.
