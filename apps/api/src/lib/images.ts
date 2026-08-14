import sharp from "sharp";
import type { PhotoVariantKind } from "@prisma/client";

interface VariantSpec {
  kind: PhotoVariantKind;
  maxWidth: number;
}

// Anchos máximos por variante. Las fotos nunca se agrandan (withoutEnlargement).
const VARIANT_SPECS: VariantSpec[] = [
  { kind: "THUMBNAIL", maxWidth: 500 },
  { kind: "MEDIUM", maxWidth: 1600 },
  { kind: "FULL", maxWidth: 2800 },
];

export interface GeneratedVariant {
  kind: PhotoVariantKind;
  buffer: Buffer;
  width: number;
  height: number;
  format: "webp";
}

/**
 * A partir del buffer original de una foto subida, genera las variantes
 * (thumbnail/medium/full) en WebP que se guardan en el storage.
 */
export async function generatePhotoVariants(
  original: Buffer,
): Promise<GeneratedVariant[]> {
  const variants: GeneratedVariant[] = [];

  for (const spec of VARIANT_SPECS) {
    const buffer = await sharp(original)
      .rotate() // respeta la orientación EXIF
      .resize({ width: spec.maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const metadata = await sharp(buffer).metadata();

    variants.push({
      kind: spec.kind,
      buffer,
      width: metadata.width ?? spec.maxWidth,
      height: metadata.height ?? 0,
      format: "webp",
    });
  }

  return variants;
}
