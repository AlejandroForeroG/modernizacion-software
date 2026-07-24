# Allocated standalone (not tied to the instance) so its public IP is known
# before the instance exists — needed to bake the backend's public URL into
# the user_data (CORS origin, frontend build's VITE_API_BASE).
resource "aws_eip" "app" {
  domain = "vpc"

  tags = {
    Name = "petclinic-app"
  }
}

locals {
  frontend_origin = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
  backend_url     = "http://${aws_eip.app.public_ip}"

  user_data = templatefile("${path.module}/templates/user-data.sh.tftpl", {
    region          = var.region
    artifact_bucket = aws_s3_bucket.artifacts.id
    artifact_key    = aws_s3_object.app_source.key
    # Forces instance replacement via user_data_replace_on_change whenever the
    # zipped source changes, so `terraform apply` redeploys new code.
    source_hash     = data.archive_file.app_source.output_md5
    frontend_bucket = aws_s3_bucket.frontend.id
    backend_url     = local.backend_url
    cors_origin     = local.frontend_origin
    log_group       = aws_cloudwatch_log_group.app.name
    db_endpoint     = aws_db_instance.this.address
    db_port         = aws_db_instance.this.port
    db_name         = var.db_name
    db_username     = var.db_username
    db_password     = random_password.db.result
  })
}

resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.al2023_ami.value
  instance_type          = var.instance_type
  key_name               = var.key_name
  iam_instance_profile   = var.iam_instance_profile
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.ec2.id]
  user_data              = local.user_data
  # user_data is NOT ForceNew by default in this provider — without this,
  # a changed script would only update the stored attribute, not actually
  # re-run cloud-init (which only executes user_data once per instance-id).
  user_data_replace_on_change = true

  root_block_device {
    volume_type = "gp3"
    volume_size = 30
  }

  tags = {
    Name = "petclinic-app"
  }
}

resource "aws_eip_association" "app" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app.id
}
