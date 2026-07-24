# Cómo funciona el despliegue en AWS (paso a paso)

Este documento explica qué hace realmente `terraform apply` cuando corrés `deploy-aws.sh`, en el orden en que sucede. Para los comandos en sí, ver [`despliegue-aws.md`](./despliegue-aws.md).

## Panorama general

```
1. deploy-aws.sh valida el perfil AWS "modernizacion"
2. terraform apply crea, en paralelo donde puede y en orden donde depende:

   red (SGs, subnet group)
   S3 artefactos (zip del repo)         S3 frontend (bucket + website config)
              \                                    |
               \                                   |
                RDS Postgres (~6-7 min)            |
                        \                          |
                         EIP (IP fija, antes que la EC2)
                                \
                                 EC2 (arranca con toda esa info en su user_data)
                                        |
                                        v
                          [dentro de la EC2, ~3 min más]
                          instala docker+buildx+compose
                          baja el zip de S3, arma backend en Docker
                          conecta el backend a la RDS
                          arma el frontend (Vite) con la URL pública del backend
                          sube el frontend a su bucket S3
                          instala el agente de CloudWatch

3. CloudWatch (log group, dashboard, alarmas) se crea en paralelo, referenciando
   la EC2 y la RDS ya creadas.
```

La parte clave para entender los tiempos: `terraform apply` **termina** (~6-7 min, dominado por la RDS) antes de que la app esté realmente arriba. La EC2 sigue trabajando en segundo plano otros ~3 min ejecutando su script de arranque (`user_data`).

## 1. Red (`network.tf`)

No se crea una VPC nueva — se usa la VPC y las subredes **default** de la cuenta (ya existen en cualquier cuenta AWS). Se crean:

- **Security group `ec2`**: abre el puerto 80 (HTTP, para la app) y 22 (SSH) a `0.0.0.0/0`.
- **Security group `rds`**: abre el puerto 5432 (Postgres) **solo** desde el security group `ec2` — nadie más puede llegar a la base de datos, ni siquiera con la IP pública (la RDS ni siquiera tiene IP pública, ver más abajo).
- **DB subnet group**: le dice a RDS en qué subredes puede colocar la base.

## 2. Artefacto del código (`s3.tf`)

Terraform no depende de git ni de GitHub para llevar el código a la EC2. En cambio:

1. `data.archive_file` comprime la raíz del repo en un `.zip` (excluyendo `.git`, `target`, `node_modules`, etc.) — esto pasa en la máquina donde corrés `terraform apply`, no en AWS.
2. Ese zip se sube a un bucket S3 privado (`petclinic-artifacts-<account-id>`).
3. Más adelante, la EC2 se lo va a descargar con `aws s3 cp` durante su arranque.

Esto significa que **lo que se despliega es el estado actual de tus archivos en disco**, tengas o no commits pendientes.

## 3. Base de datos (`rds.tf`)

- Se genera una contraseña aleatoria (`random_password`, sin caracteres especiales para que no rompa la URL JDBC).
- Se crea una instancia `db.t3.micro` de PostgreSQL 16, `publicly_accessible = false` (vive solo en la red privada de la VPC).
- `spring.sql.init.mode=always` (ya configurado en el backend, sin cambios) hace que sea **la propia app**, al arrancar, la que cree las tablas y cargue los datos de ejemplo — RDS arranca con la base vacía.
- Sin "enhanced monitoring" (`monitoring_interval = 0`): eso requeriría crear un rol de IAM, algo que no está permitido en AWS Academy. En cambio, los logs de Postgres se exportan a CloudWatch usando el rol de servicio `AWSServiceRoleForRDS`, que ya existe en cualquier cuenta AWS (no hace falta crearlo).

Este paso es el que más tarda (~6-7 minutos) porque es AWS provisionando la instancia de base de datos, no algo que se pueda acelerar desde Terraform.

## 4. IP fija (`ec2.tf`, primera parte)

Se reserva una **Elastic IP** (`aws_eip`) *antes* de crear la EC2, como recurso independiente. La razón: la IP pública del backend hace falta para dos cosas que se calculan *antes* de que la instancia exista:

- El origen que el backend va a aceptar por CORS (`CORS_ALLOWED_ORIGIN`, en realidad la URL del frontend — ver más abajo).
- La URL que el frontend va a usar para llamar a la API (`VITE_API_BASE`), que se hornea dentro del build de React.

Con la IP ya asignada, se arma el script de arranque (`user_data`, ver sección 6) con esa IP adentro, y recién ahí se crea la instancia EC2. Al final, `aws_eip_association` pega la IP a la instancia.

## 5. Frontend: el bucket (`s3.tf`, segunda parte)

En paralelo a todo lo anterior, se crea el bucket público del frontend:

- `aws_s3_bucket_website_configuration`: lo configura como sitio estático, con `index.html` como documento de error también — así, si alguien entra directo a `/slides/semana-8`, S3 devuelve `index.html` igual (404 "silencioso") y ahí el propio React decide qué mostrar según la URL (`main.jsx` ya hace ese ruteo por `window.location.pathname`, no hizo falta agregar react-router).
- `aws_s3_bucket_policy`: permiso de lectura pública (`s3:GetObject`) para cualquiera — es un sitio web público, no hay nada sensible ahí.

Este bucket queda **vacío** hasta que la EC2 le suba el build de React (paso 6).

## 6. Lo que hace la EC2 al arrancar (`user-data.sh.tftpl`)

Todo esto corre automáticamente, una sola vez, la primera vez que la instancia arranca (es el mecanismo estándar de `user_data` / cloud-init):

1. **Instala Docker** (paquete `docker` de Amazon Linux 2023) y lo habilita.
2. **Instala los plugins de Docker Compose y Buildx** descargándolos directo de GitHub Releases — el paquete `docker` de AL2023 no los trae incluidos (a diferencia de Docker Desktop, que sí). Compose v2 necesita Buildx sí o sí para poder construir imágenes (`docker compose ... --build`).
3. **Descarga y descomprime** el zip del paso 2 en `/opt/petclinic`.
4. **Escribe un archivo `.env`** con la URL de conexión a la RDS (host + puerto + credenciales, ya conocidos porque la RDS se creó antes) y el origen CORS permitido.
5. **Construye y levanta el backend**: `docker compose -f docker/docker-compose.aws.yml --env-file .env up -d --build` — esto reconstruye la imagen Spring Boot dentro de la EC2 (mismo `Dockerfile` que usa el stack local) y la deja escuchando en el puerto 80 (mapeado al 8080 interno del contenedor).
6. **Construye el frontend** con `docker build --target build`, pasándole `VITE_API_BASE=http://<ip-de-la-ec2>` como argumento de build — esa URL queda literalmente escrita dentro del JavaScript compilado. Extrae el resultado (`dist/`) del contenedor y lo sincroniza al bucket S3 del frontend con `aws s3 sync`.
7. **Instala y configura el agente de CloudWatch** para reportar métricas de memoria y disco del host (esas métricas no vienen gratis con EC2 — CPU y red sí, memoria y disco no).

Si algo de esto falla, el script se corta ahí mismo (`set -e`) y los pasos siguientes no corren — así se detectó, durante el despliegue real, que faltaba Buildx: el log de arranque mostró exactamente en qué línea se cortó.

## 7. Conectar dos orígenes distintos: CORS + `VITE_API_BASE`

Frontend (S3) y backend (EC2) quedan en **dominios distintos**, algo que el código original no soportaba (usaba rutas relativas, asumiendo que todo vivía en el mismo origen). Dos piezas nuevas lo resuelven:

- **`CorsConfig.java`** (backend): habilita CORS solo para `/api/**`, con el origen permitido leído de una variable de entorno (`CORS_ALLOWED_ORIGIN`, que Terraform le pasa con la URL del bucket S3). Sin esto, el navegador bloquearía las llamadas del frontend al backend.
- **`VITE_API_BASE`** (frontend): en vez de rutas relativas (`/api/owners`), el código arma la URL completa (`http://<ip-ec2>/api/owners`). Se define en build-time, así que cada build "sabe" contra qué backend hablar. En desarrollo local o en el Docker Compose de un solo origen, esta variable queda vacía y todo sigue funcionando exactamente igual que antes (rutas relativas).

## 8. Observabilidad (`cloudwatch.tf`)

- **Log group** `/petclinic/app`: recibe los logs del contenedor backend en tiempo real, vía el logging driver `awslogs` de Docker (configurado en `docker-compose.aws.yml`), que usa las credenciales de la EC2 (su instance profile) para escribir directo en CloudWatch — no hace falta configurar nada de autenticación aparte.
- **Dashboard `petclinic`**: gráficos de CPU (EC2 y RDS), memoria/disco (vía el agente del paso 6), conexiones a la base y espacio libre. Las métricas de memoria/disco usan la dimensión `host` (el hostname interno de la instancia) porque así es como el agente de CloudWatch las publica por defecto — no `InstanceId`, que es lo intuitivo pero no lo que realmente usa.
- **Alarmas**: CPU alta en EC2, status check fallido en EC2, CPU alta en RDS, poco espacio libre en RDS. Todas apuntan a una lista de acciones vacía por defecto — no pasa nada cuando se disparan, más allá de quedar visibles en la consola.
- **SNS (alertas por email)**: existe la variable `alert_email`, pero si queda vacía (el default), **no se crea ningún recurso de SNS** — ni tópico ni suscripción. Se activa completando esa variable en `terraform.tfvars`.

## 9. Redeploy y destrucción

- Si volvés a correr `deploy-aws.sh` después de cambiar código, Terraform detecta que el hash del zip cambió → el `user_data` cambia → como la instancia tiene `user_data_replace_on_change = true`, Terraform **reemplaza la EC2** (la destruye y crea una nueva), que vuelve a ejecutar todo el proceso del punto 6 con el código nuevo. La IP pública se mantiene (la EIP es un recurso aparte).
- `destroy-aws.sh` hace `terraform destroy`: borra EC2, EIP, RDS (sin snapshot final), ambos buckets S3 (`force_destroy = true`, así que no hace falta vaciarlos a mano primero), security groups, log group y alarmas — no queda nada facturando.
