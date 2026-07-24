# ---------------------------------------------------------------------------
# Artifact bucket: private. Holds a zip of the repo so the EC2 instance can
# fetch and build it without depending on git/GitHub access.
# ---------------------------------------------------------------------------

data "archive_file" "app_source" {
  type        = "zip"
  source_dir  = "${path.module}/.."
  output_path = "${path.module}/build/app-source.zip"

  excludes = [
    ".git",
    "target",
    "terraform",
    "modernized-ui/node_modules",
    "modernized-ui/dist",
    "modernized-ui/test-results",
    "modernized-ui/playwright-report",
  ]
}

resource "aws_s3_bucket" "artifacts" {
  bucket        = "petclinic-artifacts-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    Name = "petclinic-artifacts"
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "app_source" {
  bucket = aws_s3_bucket.artifacts.id
  key    = "app-source.zip"
  source = data.archive_file.app_source.output_path
  etag   = data.archive_file.app_source.output_md5
}

# ---------------------------------------------------------------------------
# Frontend bucket: public static website hosting the React build.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "frontend" {
  bucket        = "petclinic-frontend-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    Name = "petclinic-frontend"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  # SPA fallback: any unknown path (e.g. /slides/semana-8) serves index.html,
  # which then does its own client-side routing based on window.location.
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy" "frontend_public_read" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
    }]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
