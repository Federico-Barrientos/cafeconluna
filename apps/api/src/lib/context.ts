import { parseCookie } from "cookie";
import type { User } from "@prisma/client";
import { prisma } from "./prisma.js";
import { env } from "./env.js";
import { renewSession, serializeSessionCookie } from "./auth.js";

export interface GraphQLContext {
  prisma: typeof prisma;
  user: User | null;
  sessionId: string | null;
  /** Cookies (ya serializadas) que hay que mandar en la respuesta. */
  responseCookies: string[];
}

/**
 * Cookies pendientes de escribir en la respuesta HTTP, indexadas por el
 * Request original. `createContext` las llena y el hook `onResponse` del
 * server (ver src/index.ts) las vuelca en los headers de la respuesta.
 */
export const pendingCookiesByRequest = new WeakMap<Request, string[]>();

async function resolveSession(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const cookies = parseCookie(cookieHeader);
  const sessionId = cookies[env.sessionCookieName];
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function createContext({
  request,
}: {
  request: Request;
}): Promise<GraphQLContext> {
  const responseCookies: string[] = [];
  pendingCookiesByRequest.set(request, responseCookies);

  const session = await resolveSession(request.headers.get("cookie"));
  if (!session) {
    return { prisma, user: null, sessionId: null, responseCookies };
  }

  // Sliding expiration: cada request autenticado renueva el TTL en DB y en la cookie.
  await renewSession(prisma, session.id);
  responseCookies.push(serializeSessionCookie(session.id));

  return {
    prisma,
    user: session.user,
    sessionId: session.id,
    responseCookies,
  };
}
