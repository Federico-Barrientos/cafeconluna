import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { createYoga } from "graphql-yoga";
import { schema } from "./schema/index.js";
import { createContext, pendingCookiesByRequest } from "./lib/context.js";
import { env } from "./lib/env.js";

const yoga = createYoga({
  schema,
  context: createContext,
  cors: {
    origin: env.webOrigin,
    credentials: true,
  },
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

  yoga(req, res);
});

server.listen(env.port, () => {
  console.log(`API lista en http://localhost:${env.port}/graphql`);
});
