# Despliegue en AWS (Terraform)

Frontend en S3 (estático) + backend Spring Boot en EC2/Docker + RDS PostgreSQL + CloudWatch. Pensado para AWS Academy Learner Lab (sin permisos IAM: usa el `LabInstanceProfile` y el key pair `vockey` ya existentes, no crea roles).

Para el detalle de qué hace cada paso internamente, ver [`como-funciona-despliegue-aws.md`](./como-funciona-despliegue-aws.md).

## Requisitos

- AWS CLI y Terraform instalados.
- Perfil AWS `modernizacion` configurado y con credenciales vigentes (`aws sts get-caller-identity --profile modernizacion`).

## Desplegar / destruir

```bash
./scripts/mac/deploy-aws.sh     # o scripts/windows/deploy-aws.ps1
./scripts/mac/destroy-aws.sh    # o scripts/windows/destroy-aws.ps1
```

Ambos validan que `aws`/`terraform` existan y que el perfil `modernizacion` esté vigente antes de tocar Terraform. `terraform apply` tarda ~6-7 min (lo domina la creación de la RDS); la app recién queda disponible ~3 min después de eso, mientras la EC2 termina de construir el backend y el frontend en segundo plano — probado end-to-end: primer deploy real, ~10 min hasta health check en `200`.

## Qué se crea

- **S3** (2 buckets): artefactos (zip del repo, privado) y frontend (website hosting público).
- **EC2** (Docker, un contenedor Spring Boot en el puerto 80) + Elastic IP.
- **RDS PostgreSQL** (privada, solo accesible desde la EC2).
- **CloudWatch**: log group `/petclinic/app`, dashboard `petclinic`, alarmas (CPU EC2, status check EC2, CPU RDS, espacio libre RDS).

## Outputs útiles

```bash
cd terraform && terraform output
```

- `frontend_url` — la app (React).
- `backend_url` / `legacy_url` — API y vista Thymeleaf.
- `dashboard_url` — CloudWatch dashboard.

## Notas

- Alarmas por email: definir `alert_email` en `terraform/terraform.tfvars` (ver `terraform.tfvars.example`). Sin eso, no se crea nada de SNS.
- Sin HTTPS (ni backend ni frontend) — mantiene el despliegue simple.
- Un `terraform apply` posterior con código nuevo reconstruye la EC2 automáticamente (el hash del zip fuerza el reemplazo, vía `user_data_replace_on_change`).
- Si `health_check_url` no responde después de varios minutos: `aws ec2 get-console-output --instance-id <instance_id> --profile modernizacion --region us-east-1` muestra el log del arranque (`user_data`), útil para diagnosticar sin necesitar la clave SSH.
