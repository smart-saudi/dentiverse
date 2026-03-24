locals {
  shared_environment_variables = {
    NEXT_PUBLIC_APP_URL                 = var.next_public_app_url
    NEXT_PUBLIC_APP_NAME                = var.next_public_app_name
    NEXT_PUBLIC_SUPABASE_URL            = var.next_public_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY       = var.next_public_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY           = var.supabase_service_role_key
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  = var.next_public_stripe_publishable_key
    STRIPE_SECRET_KEY                   = var.stripe_secret_key
    STRIPE_WEBHOOK_SECRET               = var.stripe_webhook_secret
    RESEND_API_KEY                      = var.resend_api_key
    NEXT_PUBLIC_SENTRY_DSN              = var.next_public_sentry_dsn
    SENTRY_AUTH_TOKEN                   = var.sentry_auth_token
  }
}

resource "vercel_project" "dentiverse" {
  name      = var.project_name
  framework = "nextjs"

  git_repository = {
    type              = "github"
    repo              = var.github_repository
    production_branch = var.production_branch
  }

  install_command  = "npm ci"
  build_command    = "npm run build"
  output_directory = ".next"
  dev_command      = "npm run dev"
}

resource "vercel_project_environment_variable" "shared" {
  for_each = local.shared_environment_variables

  project_id = vercel_project.dentiverse.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview", "development"]
}

resource "vercel_project_domain" "production" {
  count = var.production_domain == "" ? 0 : 1

  project_id = vercel_project.dentiverse.id
  domain     = var.production_domain
  git_branch = var.production_branch
}
