resource "aws_security_group" "ec2" {
  name        = "petclinic-ec2"
  description = "PetClinic backend host: HTTP from anywhere, SSH from ssh_ingress_cidr"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP (backend API + Thymeleaf UI)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_ingress_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "petclinic-ec2"
  }
}

resource "aws_security_group" "rds" {
  name        = "petclinic-rds"
  description = "PetClinic RDS: Postgres reachable only from the backend EC2"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "Postgres from backend EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "petclinic-rds"
  }
}

resource "aws_db_subnet_group" "this" {
  name       = "petclinic-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "petclinic-db-subnet-group"
  }
}
