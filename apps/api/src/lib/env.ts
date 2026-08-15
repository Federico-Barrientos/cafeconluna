import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === "production";

export const env = {
  databaseUrl: required("DATABASE_URL"),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "cafeconluna_session",
  uploadsDir: process.env.UPLOADS_DIR ?? "./uploads",
  port: Number(process.env.PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  isProduction,
  // En producción, api y web viven en dominios distintos (Railway + Cloudflare
  // Pages), así que la cookie de sesión necesita SameSite=None + Secure para
  // viajar en requests cross-site. En desarrollo local ambos corren en
  // localhost sin https, así que "strict" (sin secure) sigue andando.
  cookieSameSite: (isProduction ? "none" : "strict") as "none" | "strict",
};
