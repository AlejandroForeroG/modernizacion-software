# Scripts de arranque (Docker, un solo comando)

Levantan PetClinic completo (Postgres + backend + frontend) con un comando.
Solo requieren Docker Desktop instalado y corriendo. Validan las
dependencias (`docker` en el PATH, daemon activo, plugin `compose`) antes de
construir nada, y **Ctrl+C detiene y limpia los tres contenedores**.

```
scripts/mac/start-app.sh        # macOS / Linux
scripts/windows/start-app.ps1   # Windows
```

## Cómo correrlo

**macOS / Linux**

```bash
./scripts/mac/start-app.sh
# si falta permiso de ejecución: chmod +x scripts/mac/start-app.sh
```

**Windows**

```powershell
.\scripts\windows\start-app.ps1
```

Si PowerShell bloquea el script (política `Restricted`), usar:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\windows\start-app.ps1
```

## URLs

- Frontend: http://localhost:5174
- Backend: http://localhost:8080
- Postgres: `localhost:5432` (`petclinic`/`petclinic`/`petclinic`)

## Notas

- Los datos de Postgres persisten entre corridas (el script solo hace
  `down`, no `down -v`). Para borrarlos: `docker compose -p petclinic -f docker/docker-compose.yml down -v`.
