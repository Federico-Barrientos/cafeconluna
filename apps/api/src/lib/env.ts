import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "cafeconluna_session",
  uploadsDir: process.env.UPLOADS_DIR ?? "./uploads",
  port: Number(process.env.PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production",
};
