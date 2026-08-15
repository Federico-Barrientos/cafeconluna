#!/bin/sh
# Entrypoint de PRODUCCIÓN para apps/api (usado por apps/api/Dockerfile).
# Se ejecuta en cada arranque/restart del contenedor (por ejemplo, en cada
# deploy de Railway):
#
#   1. `prisma migrate deploy` — aplica migraciones ya generadas en
#      prisma/migrations/ sin pedir confirmación interactiva ni crear
#      migraciones nuevas (a diferencia de `migrate dev`, que sí lo hace y
#      no debe usarse en producción).
#   2. seed del usuario admin — es idempotente (prisma/seed.ts usa
#      `upsert` sobre `username`), así que puede correr en cada restart
#      sin fallar ni duplicar la fila si el usuario ya existe.
#   3. arranca el server compilado (`node dist/index.js`), reemplazando
#      este proceso shell (exec) para que reciba señales (SIGTERM) de
#      forma directa cuando Railway reinicie o detenga el contenedor.
set -e

echo "[entrypoint] Aplicando migraciones (prisma migrate deploy)..."
pnpm --filter api exec prisma migrate deploy

echo "[entrypoint] Sembrando usuaria admin (idempotente)..."
pnpm --filter api exec tsx prisma/seed.ts

echo "[entrypoint] Iniciando servidor..."
exec node apps/api/dist/index.js
