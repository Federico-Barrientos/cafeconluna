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
  // Solo se usa en desarrollo, para el CORS de Yoga (web :5173 vs api :4000,
  // dos orígenes distintos). En producción front y api viven en el mismo
  // proceso/origen (ver apps/api/src/index.ts), así que no hace falta y esta
  // variable no se setea en Railway.
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  isProduction,
  // En producción, api y web viven en el mismo origen (mismo proceso Node
  // sirviendo ambos), así que la cookie de sesión no necesita viajar
  // cross-site: "lax" alcanza y es más seguro que "none" (no depende de que
  // el browser coopere con cookies de terceros). En desarrollo se mantiene
  // "strict", como hasta ahora.
  cookieSameSite: (isProduction ? "lax" : "strict") as "lax" | "strict",
};
