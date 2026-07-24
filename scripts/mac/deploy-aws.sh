#!/usr/bin/env bash
# Despliega PetClinic en AWS (RDS + EC2/Docker backend + S3 frontend) con
# Terraform, usando el perfil de AWS "modernizacion".
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TF_DIR="$REPO_ROOT/terraform"
AWS_PROFILE="modernizacion"

echo "== PetClinic - desplegar en AWS =="

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'aws' (AWS CLI) en el PATH." >&2
  echo "Instalá AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" >&2
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'terraform' en el PATH." >&2
  echo "Instalá Terraform: https://developer.hashicorp.com/terraform/install" >&2
  exit 1
fi

if ! aws configure list-profiles 2>/dev/null | grep -qx "$AWS_PROFILE"; then
  echo "ERROR: no existe el perfil AWS '$AWS_PROFILE'." >&2
  echo "Configuralo con: aws configure --profile $AWS_PROFILE" >&2
  exit 1
fi

if ! aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null 2>&1; then
  echo "ERROR: el perfil '$AWS_PROFILE' existe pero las credenciales no son válidas o expiraron." >&2
  echo "Si es AWS Academy Learner Lab: abrí el laboratorio y actualizá ~/.aws/credentials con las nuevas credenciales." >&2
  exit 1
fi

echo "== Perfil '$AWS_PROFILE' validado =="

cd "$TF_DIR"
terraform init -input=false
terraform apply -auto-approve

echo
echo "== Despliegue completo. La app puede tardar unos minutos más en construirse dentro de la EC2. =="
terraform output
