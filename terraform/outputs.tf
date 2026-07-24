output "frontend_url" {
  description = "Public URL of the React frontend (S3 static website)."
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

output "backend_url" {
  description = "Public URL of the Spring Boot backend (API + legacy Thymeleaf UI)."
  value       = local.backend_url
}

output "legacy_url" {
  description = "Legacy Thymeleaf UI, served directly by the backend."
  value       = "${local.backend_url}/owners/find"
}

output "health_check_url" {
  value = "${local.backend_url}/actuator/health"
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)."
  value       = aws_db_instance.this.endpoint
}

output "artifact_bucket" {
  value = aws_s3_bucket.artifacts.id
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.id
}

output "instance_id" {
  value = aws_instance.app.id
}

output "ssh_command" {
  value = "ssh -i ${var.key_name}.pem ec2-user@${aws_eip.app.public_ip}"
}

output "dashboard_url" {
  description = "Direct link to the CloudWatch dashboard in the AWS console."
  value       = "https://${var.region}.console.aws.amazon.com/cloudwatch/home?region=${var.region}#dashboards:name=${aws_cloudwatch_dashboard.this.dashboard_name}"
}
