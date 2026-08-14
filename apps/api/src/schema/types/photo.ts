import type {
  Photo as PhotoModel,
  PhotoVariant as PhotoVariantModel,
} from "@prisma/client";
import { storage } from "../../storage/index.js";
import { builder } from "../builder.js";

export const PhotoVariantKindEnum = builder.enumType("PhotoVariantKind", {
  values: ["THUMBNAIL", "MEDIUM", "FULL"] as const,
});

export const PhotoVariantRef = builder.objectRef<PhotoVariantModel>(
  "PhotoVariant",
);

PhotoVariantRef.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    kind: t.expose("kind", { type: PhotoVariantKindEnum }),
    url: t.string({ resolve: (variant) => storage.getFileUrl(variant.path) }),
    width: t.exposeInt("width"),
    height: t.exposeInt("height"),
  }),
});

type PhotoWithVariants = PhotoModel & { variants: PhotoVariantModel[] };

export const PhotoRef = builder.objectRef<PhotoWithVariants>("Photo");

PhotoRef.implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    caption: t.exposeString("caption", { nullable: true }),
    camera: t.exposeString("camera", { nullable: true }),
    film: t.exposeString("film", { nullable: true }),
    aperture: t.exposeString("aperture", { nullable: true }),
    shutterSpeed: t.exposeString("shutterSpeed", { nullable: true }),
    createdAt: t.string({ resolve: (photo) => photo.createdAt.toISOString() }),
    variants: t.field({
      type: [PhotoVariantRef],
      resolve: (photo) => photo.variants,
    }),
  }),
});
