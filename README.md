# cafeconluna

Portfolio fotográfico de Cafeconluna — fotógrafa analógica de 35mm (paisaje, costumbrismo, retratos, animales, luna).

## Stack

- **API**: Node.js + TypeScript, GraphQL Yoga + Pothos, Prisma + PostgreSQL
- **Web**: React
- **Monorepo**: pnpm workspaces (`apps/api`, `apps/web`)

## MVP

- Galería pública en masonry editorial, con vista de detalle a pantalla completa
- Panel de admin (login por sesión) para subir, editar y borrar fotos
- Pipeline de procesamiento de imágenes (sharp) para variantes optimizadas (WebP, múltiples tamaños)

## Desarrollo con Docker

Requiere Docker Desktop (o Docker Engine + Compose plugin).

```bash
docker compose up
```

Con eso alcanza: levanta Postgres, y las apps `api` y `web` con hot reload
(el código se monta como bind mount, así que los cambios se reflejan sin
reconstruir la imagen). En el primer arranque, el servicio `api` genera el
cliente de Prisma, crea/aplica las migraciones y siembra la usuaria admin
automáticamente (usuario `admin` / contraseña `changeme` por defecto).

- API: http://localhost:4000/graphql
- Web: http://localhost:5173
- Postgres: `localhost:5432` (usuario/clave/db `cafeconluna` por defecto)

Los uploads (`apps/api/uploads`) y los datos de Postgres persisten en
volúmenes nombrados entre reinicios (`docker compose down` sin `-v`).

Para cambiar valores por defecto (por ejemplo la contraseña admin), copiar
`.env.example` a `.env` en la raíz del repo y editarlo — `docker-compose.yml`
lo toma automáticamente. Este `.env` de la raíz es independiente de
`apps/api/.env` y `apps/web/.env`, que se siguen usando para el flujo manual
de abajo.

Esta imagen y compose son solo de desarrollo (no aptos para producción/deploy).

## Desarrollo (manual, sin Docker)

Requiere Node 20+ y pnpm.

```bash
pnpm install

# apps/api: copiar .env.example a .env y ajustar DATABASE_URL
# (requiere Postgres corriendo aparte; alternativa: sección "Desarrollo con
# Docker" más arriba, que ya incluye Postgres)
cp apps/api/.env.example apps/api/.env
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed   # crea la usuaria admin

# apps/web: copiar .env.example a .env si se quiere apuntar a otra URL de API
cp apps/web/.env.example apps/web/.env

pnpm dev:api   # http://localhost:4000/graphql
pnpm dev:web   # http://localhost:5173
```

La galería pública funciona con datos mock mientras la API no esté corriendo
(`apps/web/src/lib/mockPhotos.ts`).
