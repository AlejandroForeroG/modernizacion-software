# Destruye todo lo desplegado en AWS por deploy-aws.ps1.

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$TfDir = Join-Path $RepoRoot "terraform"
$AwsProfile = "modernizacion"

Write-Host "== PetClinic - destruir despliegue en AWS =="

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "No se encontró 'aws' (AWS CLI) en el PATH."
    exit 1
}

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Error "No se encontró 'terraform' en el PATH."
    exit 1
}

$profileList = (aws configure list-profiles 2>$null) | ForEach-Object { $_.Trim() }
if ($LASTEXITCODE -ne 0 -or -not ($profileList -contains $AwsProfile)) {
    Write-Error "No existe el perfil AWS '$AwsProfile'."
    exit 1
}

aws sts get-caller-identity --profile $AwsProfile *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "El perfil '$AwsProfile' existe pero las credenciales no son válidas o expiraron. Si es AWS Academy Learner Lab: abrí el laboratorio y actualizá tus credenciales."
    exit 1
}

Write-Host "== Perfil '$AwsProfile' validado =="

Push-Location $TfDir
try {
    if (-not (Test-Path ".terraform")) {
        terraform init -input=false
        if ($LASTEXITCODE -ne 0) { throw "terraform init falló." }
    }

    terraform destroy -auto-approve
    if ($LASTEXITCODE -ne 0) { throw "terraform destroy falló." }

    Write-Host "== Destrucción completa. =="
}
finally {
    Pop-Location
}
