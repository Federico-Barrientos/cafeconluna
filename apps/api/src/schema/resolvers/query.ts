import { builder } from "../builder.js";
import { PhotoRef } from "../types/photo.js";
import { UserRef } from "../types/user.js";

builder.queryFields((t) => ({
  me: t.field({
    type: UserRef,
    nullable: true,
    resolve: (_root, _args, ctx) => ctx.user,
  }),

  photos: t.field({
    type: [PhotoRef],
    resolve: (_root, _args, ctx) =>
      ctx.prisma.photo.findMany({
        orderBy: { createdAt: "desc" },
        include: { variants: true },
      }),
  }),

  photo: t.field({
    type: PhotoRef,
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (_root, args, ctx) =>
      ctx.prisma.photo.findUnique({
        where: { id: String(args.id) },
        include: { variants: true },
      }),
  }),
}));
