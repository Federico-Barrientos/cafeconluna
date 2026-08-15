# Imagen de PRODUCCIÓN para apps/api (Railway). Multi-stage:
#   1. "builder": instala TODAS las deps (incluye devDependencies), genera
#      el cliente de Prisma y compila TypeScript a dist/.
#   2. "runtime": imagen liviana con solo las dependencias de producción
#      y el código ya compilado. No usa bind mounts ni `tsx watch`.
#
# Se construye con el CONTEXTO EN LA RAÍZ DEL MONOREPO (no en apps/api),
# porque el lockfile es único para todo el workspace:
#
#   docker build -f apps/api/Dockerfile -t cafeconluna-api .
#
# Usamos node:22-bookworm-slim (glibc) en ambas etapas en vez de alpine:
# sharp y los engines de Prisma resuelven binarios nativos con más fricción
# en musl (mismo criterio que apps/api/Dockerfile.dev, la imagen de
# desarrollo). Sigue siendo una imagen bastante liviana.

# ---------- Stage 1: builder ----------
FROM node:22-bookworm-slim AS builder

# openssl para que `prisma generate` detecte la versión de libssl y baje
# el binario de motor correcto (si no, tira warnings y asume una versión
# por defecto). El cliente generado acá solo se usa para tipar el build de
# TypeScript: el que realmente corre en runtime se regenera en ese stage.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Manifests primero (cache de capas): el lockfile es único para todo el
# monorepo, así que copiamos los package.json de ambos apps.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

# Resto del código de apps/api (schema de Prisma, src, etc).
COPY apps/api ./apps/api

RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api run build

# ---------- Stage 2: runtime ----------
FROM node:22-bookworm-slim AS runtime

# Prisma necesita openssl para su motor de consultas en runtime.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
# El schema y las migraciones deben estar presentes ANTES de instalar,
# porque el postinstall de @prisma/client corre `prisma generate` y
# necesita encontrar apps/api/prisma/schema.prisma.
COPY apps/api/prisma ./apps/api/prisma

# Solo dependencias de producción del paquete "api" (prisma y tsx están
# en "dependencies" -no devDependencies- porque el entrypoint de
# producción los necesita para `prisma migrate deploy` y para sembrar
# la usuaria admin al arrancar el contenedor).
RUN pnpm install --frozen-lockfile --prod --filter api...

# Por las dudas de que el postinstall no haya corrido (p. ej. scripts
# bloqueados por policy de pnpm), generamos el cliente explícitamente.
RUN pnpm --filter api exec prisma generate

# Código ya compilado, generado en el stage anterior (esto es lo que
# efectivamente corre el server).
COPY --from=builder /app/apps/api/dist ./apps/api/dist
# prisma/seed.ts se ejecuta con tsx (no está compilado a dist/, ver
# tsconfig.json: solo "src" está en "include"), e importa módulos de
# src/lib directamente, así que ese código fuente también tiene que
# estar presente en runtime.
COPY apps/api/src ./apps/api/src
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
RUN chmod +x ./apps/api/docker-entrypoint.sh

EXPOSE 4000

# Corre migraciones (migrate deploy, no migrate dev), siembra la usuaria
# admin de forma idempotente y recién ahí levanta el server compilado.
CMD ["sh", "apps/api/docker-entrypoint.sh"]
