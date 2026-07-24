variable "aws_profile" {
  description = "Named AWS CLI profile to use (must exist and be authenticated before running Terraform)."
  type        = string
  default     = "modernizacion"
}

variable "region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for the backend host. Needs enough RAM to build with Maven and Vite."
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "Existing EC2 key pair name (AWS Academy provides 'vockey'). Set to null to launch without SSH access."
  type        = string
  default     = "vockey"
}

variable "iam_instance_profile" {
  description = "Existing IAM instance profile name to attach to the EC2 instance. AWS Academy Learner Labs cannot create IAM resources, so this must reference the pre-provisioned profile (typically 'LabInstanceProfile')."
  type        = string
  default     = "LabInstanceProfile"
}

variable "ssh_ingress_cidr" {
  description = "CIDR allowed to reach the EC2 instance on port 22. Restrict this to your own IP/32 when possible."
  type        = string
  default     = "0.0.0.0/0"
}

variable "db_name" {
  description = "PostgreSQL database name (must match what the Spring Boot app expects in its JDBC URL)."
  type        = string
  default     = "petclinic"
}

variable "db_username" {
  description = "Master username for the RDS PostgreSQL instance."
  type        = string
  default     = "petclinic"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage, in GiB."
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "PostgreSQL engine version to provision on RDS."
  type        = string
  default     = "16.14"
}

variable "alert_email" {
  description = "Email address to subscribe to CloudWatch alarm notifications via SNS. Leave empty to skip creating any SNS resources."
  type        = string
  default     = ""
}
