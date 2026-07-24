# Despliega PetClinic en AWS (RDS + EC2/Docker backend + S3 frontend) con
# Terraform, usando el perfil de AWS "modernizacion".

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir "..\..")).Path
$TfDir = Join-Path $RepoRoot "terraform"
$AwsProfile = "modernizacion"

Write-Host "== PetClinic - desplegar en AWS =="

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "No se encontró 'aws' (AWS CLI) en el PATH. Instalá AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
}

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Error "No se encontró 'terraform' en el PATH. Instalá Terraform: https://developer.hashicorp.com/terraform/install"
    exit 1
}

$profileList = (aws configure list-profiles 2>$null) | ForEach-Object { $_.Trim() }
if ($LASTEXITCODE -ne 0 -or -not ($profileList -contains $AwsProfile)) {
    Write-Error "No existe el perfil AWS '$AwsProfile'. Configuralo con: aws configure --profile $AwsProfile"
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
    terraform init -input=false
    if ($LASTEXITCODE -ne 0) { throw "terraform init falló." }

    terraform apply -auto-approve
    if ($LASTEXITCODE -ne 0) { throw "terraform apply falló." }

    Write-Host ""
    Write-Host "== Despliegue completo. La app puede tardar unos minutos más en construirse dentro de la EC2. =="
    terraform output
}
finally {
    Pop-Location
}
