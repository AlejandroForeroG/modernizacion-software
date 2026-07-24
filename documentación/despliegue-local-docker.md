# Despliegue local con Docker

```bash
docker compose -f docker/docker-compose.yml up -d --build
```

- Frontend: http://localhost:5174
- Backend: http://localhost:8080

Detener:

```bash
docker compose -f docker/docker-compose.yml down
```
