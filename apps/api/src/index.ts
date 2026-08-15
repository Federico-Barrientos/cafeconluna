import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema/index.js";
import { createContext, pendingCookiesByRequest } from "./lib/context.js";
import { env } from "./lib/env.js";

const yoga = createYoga({
  schema,
  context: createContext,
  // En producción front y api viven en el mismo origen (mismo proceso
  // Node sirviendo ambos, ver el static handler más abajo), así que no
  // hace falta CORS. En desarrollo local siguen en puertos distintos
  // (web :5173, api :4000), así que ahí sí es cross-origin.
  cors: env.isProduction ? false : { origin: env.webOrigin, credentials: true },
  plugins: [
    {
      onResponse({ request, response }) {
        const cookies = pendingCookiesByRequest.get(request);
        if (!cookies) return;
        pendingCookiesByRequest.delete(request);
        for (const cookie of cookies) {
          response.headers.append("set-cookie", cookie);
        }
      },
    },
  ],
});

const uploadsRoot = path.resolve(env.uploadsDir);

// Build estático de apps/web, copiado al lado de este server compilado por
// apps/api/Dockerfile (ver stage "web-builder"). En desarrollo esta carpeta
// no existe -web corre aparte con Vite en :5173-, así que el static handler
// de abajo no se activa y todo lo que no sea /uploads/* sigue yendo a Yoga.
const webDistRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../web/dist",
);
const webIndexHtml = path.join(webDistRoot, "index.html");

const STATIC_MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function serveStaticFile(filePath: string, res: import("node:http").ServerResponse) {
  const contentType = STATIC_MIME_TYPES[path.extname(filePath)] ?? "application/octet-stream";
  res.writeHead(200, { "content-type": contentType });
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  if (req.url?.startsWith("/uploads/")) {
    const filePath = path.join(uploadsRoot, req.url.replace("/uploads/", ""));
    if (
      filePath.startsWith(uploadsRoot) &&
      existsSync(filePath) &&
      statSync(filePath).isFile()
    ) {
      res.writeHead(200, { "content-type": "image/webp" });
      createReadStream(filePath).pipe(res);
      return;
    }
    res.writeHead(404);
    res.end();
    return;
  }

  if (req.url === "/graphql" || req.url?.startsWith("/graphql?")) {
    yoga(req, res);
    return;
  }

  if (existsSync(webDistRoot)) {
    const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const filePath = path.join(webDistRoot, pathname);
    if (
      filePath.startsWith(webDistRoot) &&
      existsSync(filePath) &&
      statSync(filePath).isFile()
    ) {
      serveStaticFile(filePath, res);
      return;
    }
    // Fallback de SPA routing: cualquier ruta que no matchee un archivo
    // real (ej. /admin) la resuelve react-router del lado del cliente.
    serveStaticFile(webIndexHtml, res);
    return;
  }

  yoga(req, res);
});

server.listen(env.port, () => {
  console.log(`API lista en http://localhost:${env.port}/graphql`);
});
