resource "random_password" "db" {
  length  = 20
  special = false # keeps the password JDBC-URL safe without extra encoding
}

resource "aws_db_instance" "this" {
  identifier     = "petclinic-db"
  engine         = "postgres"
  engine_version = var.db_engine_version

  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false

  # AWS Academy: no enhanced monitoring (would require an IAM role we can't
  # create). Log export to CloudWatch relies on the AWSServiceRoleForRDS
  # service-linked role, which already exists on the account.
  monitoring_interval             = 0
  enabled_cloudwatch_logs_exports = ["postgresql"]

  backup_retention_period = 0
  skip_final_snapshot     = true
  deletion_protection     = false
  apply_immediately       = true

  tags = {
    Name = "petclinic-db"
  }
}
