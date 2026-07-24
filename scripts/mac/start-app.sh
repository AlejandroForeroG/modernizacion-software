#!/usr/bin/env bash
# Levanta PetClinic completo (Postgres + backend Spring Boot + frontend React)
# con Docker Compose. Ctrl+C detiene y limpia los tres contenedores.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/docker/docker-compose.yml"
PROJECT_NAME="petclinic"

echo "== PetClinic - levantar app completa (Docker) =="

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: no se encontró 'docker' en el PATH." >&2
  echo "Instalá Docker Desktop: https://www.docker.com/products/docker-desktop/" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker está instalado pero el daemon no responde." >&2
  echo "Abrí Docker Desktop y esperá a que termine de iniciar." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: no se encontró el plugin 'docker compose' (v2)." >&2
  echo "Actualizá Docker Desktop, que ya lo incluye." >&2
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERROR: no se encontró $COMPOSE_FILE" >&2
  exit 1
fi

cleanup() {
  echo
  echo "== Cerrando la app (docker compose down) =="
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" down
}
trap cleanup EXIT INT TERM

echo "== Construyendo imágenes (si hace falta) =="
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" build

echo "== Levantando Postgres + backend + frontend =="
echo "   Frontend:  http://localhost:5174"
echo "   Backend:   http://localhost:8080"
echo "   (Ctrl+C para detener y cerrar todo)"
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up
