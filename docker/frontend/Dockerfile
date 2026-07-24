# Etapa 1: build de producción del cliente React con Vite
FROM node:20-alpine AS build
WORKDIR /app

COPY modernized-ui/package.json ./
COPY modernized-ui/pnpm-lock.yaml* ./
RUN npm install

COPY modernized-ui/ .
# Empty by default (same-origin, local/dev behavior). Set to the backend's
# public URL when building a frontend deployed on a separate origin (e.g. S3).
ARG VITE_API_BASE=""
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# Etapa 2: servir el build estático con nginx, proxyando /api, /owners y
# /resources hacia el backend (mismo comportamiento que el proxy de Vite en
# desarrollo, ver modernized-ui/vite.config.js)
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
