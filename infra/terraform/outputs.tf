output "vercel_project_id" {
  description = "The Vercel project ID for DentiVerse."
  value       = vercel_project.dentiverse.id
}

output "vercel_project_name" {
  description = "The Vercel project name."
  value       = vercel_project.dentiverse.name
}

output "production_domain" {
  description = "Configured production domain, if one was supplied."
  value       = var.production_domain
}
