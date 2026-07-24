# Despliegue local

Guía paso a paso para levantar el proyecto en un entorno local: el backend
Spring Boot (Thymeleaf + API REST de modernización) y, opcionalmente, el
cliente React (`modernized-ui`).

## Requisitos previos

- **Java 17** o superior (JDK completo, no solo JRE).
- **Git**.
- **Node.js** (LTS reciente) y **npm** o **pnpm**, solo si vas a correr el
  cliente React (`modernized-ui`).
- No es necesario tener Maven ni Gradle instalados: el repo incluye los
  wrappers `./mvnw` y `./gradlew`.
- Opcional: **Docker**, para levantar todo el stack (BD + backend + frontend)
  sin instalar nada más — ver [`despliegue-local-docker.md`](./despliegue-local-docker.md).

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd modernizacion-software
```

## 2. Levantar el backend (Spring Boot)

Por defecto la app usa la base de datos **H2 en memoria**, que se
autopobla al arrancar (no requiere instalación adicional).

Con Maven:

```bash
./mvnw spring-boot:run
```

Con Gradle:

```bash
./gradlew bootRun
```

La aplicación queda disponible en:

- Vista clásica (Thymeleaf): http://localhost:8080
- Consola H2 (inspección de la BD): http://localhost:8080/h2-console
  (la URL JDBC `jdbc:h2:mem:<uuid>` se imprime en la consola al arrancar)
- API REST de modernización: http://localhost:8080/api/owners

## 3. Levantar el cliente React (`modernized-ui`) — opcional

Este cliente consume la API REST del backend, así que **el backend del
paso 2 debe estar corriendo en el puerto 8080** antes de iniciarlo.

```bash
cd modernized-ui
npm install
npm run dev
```

Abrir http://localhost:5174 en el navegador.

- El servidor de desarrollo de Vite redirige automáticamente las rutas
  `/api`, `/owners` y `/resources` hacia `http://localhost:8080`
  (ver `modernized-ui/vite.config.js`).
- Dentro de la app hay un enlace "Vista legada" que abre la interfaz
  Thymeleaf original para comparación lado a lado.
- Las presentaciones del proyecto están disponibles en `/slides` (avance
  semana 7) y `/slides/semana-8` (entrega final).

## 4. Verificar que todo funciona

- Backend: abrir http://localhost:8080 y confirmar que carga el listado
  de dueños/mascotas.
- API REST: `curl http://localhost:8080/api/owners?lastName=Davis`
  debería devolver un JSON con resultados paginados.
- UI React: abrir http://localhost:5174 y probar la búsqueda de dueños y
  el registro de una visita.

## Comandos útiles adicionales

```bash
# Ejecutar toda la suite de tests + checkstyle (lo que corre en CI)
./mvnw -B verify

# Compilar el CSS de Bootstrap/SCSS si se modificó src/main/scss
./mvnw package -P css

# Build de producción del cliente React
cd modernized-ui && npm run build

# Tests end-to-end con Playwright (requiere backend en :8080 y Vite en :5174 corriendo)
cd modernized-ui && npm run test:e2e
```
