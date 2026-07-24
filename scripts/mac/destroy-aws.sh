#!/usr/bin/env bash
# Destruye todo lo desplegado en AWS por deploy-aws.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TF_DIR="$REPO_ROOT/terraform"
AWS_PROFILE="modernizacion"

echo "== PetClinic - destruir despliegue en AWS =="

if ! command -v aws >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'aws' (AWS CLI) en el PATH." >&2
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'terraform' en el PATH." >&2
  exit 1
fi

if ! aws configure list-profiles 2>/dev/null | grep -qx "$AWS_PROFILE"; then
  echo "ERROR: no existe el perfil AWS '$AWS_PROFILE'." >&2
  exit 1
fi

if ! aws sts get-caller-identity --profile "$AWS_PROFILE" >/dev/null 2>&1; then
  echo "ERROR: el perfil '$AWS_PROFILE' existe pero las credenciales no son válidas o expiraron." >&2
  echo "Si es AWS Academy Learner Lab: abrí el laboratorio y actualizá ~/.aws/credentials con las nuevas credenciales." >&2
  exit 1
fi

echo "== Perfil '$AWS_PROFILE' validado =="

cd "$TF_DIR"
if [ ! -d .terraform ]; then
  terraform init -input=false
fi
terraform destroy -auto-approve

echo "== Destrucción completa. =="
