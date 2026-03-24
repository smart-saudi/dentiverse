variable "vercel_api_token" {
  description = "Vercel API token used by Terraform."
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team or account ID."
  type        = string
}

variable "project_name" {
  description = "Human-friendly Vercel project name."
  type        = string
  default     = "dentiverse"
}

variable "github_repository" {
  description = "GitHub repository in owner/name format."
  type        = string
  default     = "smart-saudi/dentiverse"
}

variable "production_branch" {
  description = "Git branch that triggers production deployments."
  type        = string
  default     = "main"
}

variable "production_domain" {
  description = "Optional custom domain for the production deployment."
  type        = string
  default     = ""
}

variable "next_public_app_url" {
  description = "Public application URL."
  type        = string
}

variable "next_public_app_name" {
  description = "Public application name."
  type        = string
  default     = "DentiVerse"
}

variable "next_public_supabase_url" {
  description = "Supabase project URL."
  type        = string
}

variable "next_public_supabase_anon_key" {
  description = "Supabase anon key."
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service role key."
  type        = string
  sensitive   = true
}

variable "next_public_stripe_publishable_key" {
  description = "Stripe publishable key."
  type        = string
  sensitive   = true
}

variable "stripe_secret_key" {
  description = "Stripe secret key."
  type        = string
  sensitive   = true
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret."
  type        = string
  sensitive   = true
}

variable "resend_api_key" {
  description = "Resend API key."
  type        = string
  sensitive   = true
}

variable "next_public_sentry_dsn" {
  description = "Public Sentry DSN."
  type        = string
  sensitive   = true
}

variable "sentry_auth_token" {
  description = "Sentry auth token."
  type        = string
  sensitive   = true
}
