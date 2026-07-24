# Levanta PetClinic completo (Postgres + backend Spring Boot + frontend React)
# con Docker Compose. Ctrl+C detiene y limpia los tres contenedores.

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$ComposeFile = Join-Path $RepoRoot "docker\docker-compose.yml"
$ProjectName = "petclinic"

Write-Host "== PetClinic - levantar app completa (Docker) =="

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "No se encontró 'docker' en el PATH. Instalá Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker está instalado pero el daemon no responde. Abrí Docker Desktop y esperá a que termine de iniciar."
    exit 1
}

docker compose version *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "No se encontró el plugin 'docker compose' (v2). Actualizá Docker Desktop, que ya lo incluye."
    exit 1
}

if (-not (Test-Path $ComposeFile)) {
    Write-Error "No se encontró $ComposeFile"
    exit 1
}

function Invoke-Cleanup {
    Write-Host ""
    Write-Host "== Cerrando la app (docker compose down) =="
    docker compose -p $ProjectName -f $ComposeFile down
}

try {
    Write-Host "== Construyendo imágenes (si hace falta) =="
    docker compose -p $ProjectName -f $ComposeFile build
    if ($LASTEXITCODE -ne 0) { throw "Falló el build de las imágenes." }

    Write-Host "== Levantando Postgres + backend + frontend =="
    Write-Host "   Frontend:  http://localhost:5174"
    Write-Host "   Backend:   http://localhost:8080"
    Write-Host "   (Ctrl+C para detener y cerrar todo)"
    docker compose -p $ProjectName -f $ComposeFile up
}
finally {
    Invoke-Cleanup
}
