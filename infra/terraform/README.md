# Terraform

This directory provisions the application-side cloud resources for DentiVerse.

Current scope:

- Vercel project creation
- Vercel environment variable management
- Optional production domain attachment

External systems such as Supabase, Stripe, and Resend remain managed services. Their
credentials are injected into Vercel as environment variables through Terraform.

## Usage

1. Copy `terraform.tfvars.example` to `terraform.tfvars`.
2. Fill in real values.
3. Run:

```bash
terraform init
terraform plan
terraform apply
```

## Notes

- Apply Terraform from a secured machine or CI runner only.
- Keep `terraform.tfvars` out of version control.
- If the Vercel project already exists, import it before the first apply.
