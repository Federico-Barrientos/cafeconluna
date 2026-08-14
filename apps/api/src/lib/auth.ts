import bcrypt from "bcryptjs";
import { stringifySetCookie } from "cookie";
import { GraphQLError } from "graphql";
import type { PrismaClient, User } from "@prisma/client";
import { env } from "./env.js";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(prisma: PrismaClient, userId: string) {
  return prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
}

/** Renueva el TTL de una sesión existente (sliding expiration). */
export async function renewSession(prisma: PrismaClient, sessionId: string) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
}

export function serializeSessionCookie(sessionId: string): string {
  return stringifySetCookie({
    name: env.sessionCookieName,
    value: sessionId,
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function serializeExpiredSessionCookie(): string {
  return stringifySetCookie({
    name: env.sessionCookieName,
    value: "",
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

/** Exige que la request tenga sesión de admin válida; si no, corta con un error de GraphQL. */
export function requireAdmin(ctx: { user: User | null }): User {
  if (!ctx.user) {
    throw new GraphQLError("No autenticado", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.user;
}
