import { GraphQLError } from "graphql";
import { nanoid } from "nanoid";
import { generatePhotoVariants } from "../../lib/images.js";
import {
  createSession,
  requireAdmin,
  serializeExpiredSessionCookie,
  serializeSessionCookie,
  verifyPassword,
} from "../../lib/auth.js";
import { storage } from "../../storage/index.js";
import { builder } from "../builder.js";
import { PhotoRef } from "../types/photo.js";
import { UserRef } from "../types/user.js";
import "../types/upload.js";

const UpdatePhotoInput = builder.inputType("UpdatePhotoInput", {
  fields: (t) => ({
    caption: t.string(),
    camera: t.string(),
    film: t.string(),
    aperture: t.string(),
    shutterSpeed: t.string(),
  }),
});

builder.mutationFields((t) => ({
  login: t.field({
    type: UserRef,
    args: {
      username: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const user = await ctx.prisma.user.findUnique({
        where: { username: args.username },
      });

      if (!user || !(await verifyPassword(args.password, user.passwordHash))) {
        throw new GraphQLError("Usuario o contraseña inválidos", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const session = await createSession(ctx.prisma, user.id);
      ctx.responseCookies.push(serializeSessionCookie(session.id));

      return user;
    },
  }),

  logout: t.field({
    type: "Boolean",
    resolve: async (_root, _args, ctx) => {
      if (ctx.sessionId) {
        await ctx.prisma.session.delete({ where: { id: ctx.sessionId } });
      }
      ctx.responseCookies.push(serializeExpiredSessionCookie());
      return true;
    },
  }),

  uploadPhoto: t.field({
    type: PhotoRef,
    args: {
      file: t.arg({ type: "Upload", required: true }),
      caption: t.arg.string(),
      camera: t.arg.string(),
      film: t.arg.string(),
      aperture: t.arg.string(),
      shutterSpeed: t.arg.string(),
    },
    resolve: async (_root, args, ctx) => {
      requireAdmin(ctx);

      const original = Buffer.from(await args.file.arrayBuffer());
      const variants = await generatePhotoVariants(original);

      const photo = await ctx.prisma.photo.create({
        data: {
          caption: args.caption ?? null,
          camera: args.camera ?? null,
          film: args.film ?? null,
          aperture: args.aperture ?? null,
          shutterSpeed: args.shutterSpeed ?? null,
        },
      });

      for (const variant of variants) {
        const key = `${photo.id}/${variant.kind.toLowerCase()}-${nanoid(8)}.webp`;
        await storage.uploadFile(key, variant.buffer);
        await ctx.prisma.photoVariant.create({
          data: {
            photoId: photo.id,
            kind: variant.kind,
            path: key,
            width: variant.width,
            height: variant.height,
            format: variant.format,
          },
        });
      }

      return ctx.prisma.photo.findUniqueOrThrow({
        where: { id: photo.id },
        include: { variants: true },
      });
    },
  }),

  updatePhoto: t.field({
    type: PhotoRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: UpdatePhotoInput, required: true }),
    },
    resolve: (_root, args, ctx) => {
      requireAdmin(ctx);
      return ctx.prisma.photo.update({
        where: { id: String(args.id) },
        data: { ...args.input },
        include: { variants: true },
      });
    },
  }),

  deletePhoto: t.field({
    type: "Boolean",
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      requireAdmin(ctx);

      const photo = await ctx.prisma.photo.findUnique({
        where: { id: String(args.id) },
        include: { variants: true },
      });
      if (!photo) return false;

      for (const variant of photo.variants) {
        await storage.deleteFile(variant.path);
      }
      await ctx.prisma.photo.delete({ where: { id: photo.id } });

      return true;
    },
  }),
}));
