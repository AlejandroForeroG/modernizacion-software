# Resultados de tests (Java + Playwright)

Corrida local: backend Spring Boot (H2, `./mvnw spring-boot:run`) + cliente React (`npm run dev`, Vite en :5174).

## Java (`./mvnw test`)

**65 tests, 0 fallos, 0 errores, 0 skipped — `BUILD SUCCESS`.**

| Clase | Tests |
|---|---|
| `MySqlIntegrationTests` | 2 |
| `PetClinicIntegrationTests` | 3 |
| `PostgresIntegrationTests` | 2 |
| `model.ValidatorTests` | 2 |
| `modernization.ModernizationApiIntegrationTests` | 4 |
| `owner.OwnerControllerTests` | 13 |
| `owner.PetControllerTests` | 10 |
| `owner.PetTypeFormatterTests` | 3 |
| `owner.PetValidatorTests` | 4 |
| `owner.VisitControllerTests` | 4 |
| `service.ClinicServiceTests` | 10 |
| `system.CrashControllerIntegrationTests` | 2 |
| `system.CrashControllerTests` | 1 |
| `system.I18nPropertiesSyncTest` | 2 |
| `vet.VetControllerTests` | 2 |
| `vet.VetTests` | 1 |

`MySqlIntegrationTests` y `PostgresIntegrationTests` levantan su base vía Testcontainers/Docker Compose (`docker/docker-compose.yml`) — requieren Docker corriendo y el puerto correspondiente libre.

Cobertura de este mismo run: ver [`cobertura-jacoco.md`](./cobertura-jacoco.md).

## Playwright (`npm run test:e2e`, `modernized-ui/tests/preexperiment.spec.js`)

**6/6 pasaron.**

| Test | Qué valida | Tiempo |
|---|---|---|
| RQ-01 — búsqueda de dueños | Búsqueda por apellido resuelve a un único resultado y muestra el detalle | 2.1s |
| RQ-06 — registro de visita | Registra una visita futura y refresca el historial | 1.0s |
| UI operativa en mobile | Búsqueda funciona en viewport 390×844 sin overflow horizontal | 0.7s |
| Slides semana 7 (desktop) | Las 14 slides entran en el viewport sin overflow | 1.1s |
| Slides semana 7 (mobile) | Navegación de slides sin overflow en mobile | 0.8s |
| Deck semana 8 | El deck completo (19 slides) carga y es navegable | 0.6s |

Este mismo spec también se corrió con éxito (6/6) apuntando directo al despliegue real en AWS (frontend S3 + backend EC2), usando el override `PLAYWRIGHT_BASE_URL` agregado a `playwright.config.js` — ver `documentación/como-funciona-despliegue-aws.md`.

## Cómo reproducir

```bash
./mvnw test

./mvnw spring-boot:run &          # backend, puerto 8080
cd modernized-ui && npm run dev & # frontend, puerto 5174
npm run test:e2e                  # o: npx playwright test
```

Para correr Playwright contra otro origen (p. ej. un despliegue en AWS):

```bash
PLAYWRIGHT_BASE_URL="http://<frontend-url>" npx playwright test
```
