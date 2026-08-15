export type PhotoVariantKind = "THUMBNAIL" | "MEDIUM" | "FULL";

export interface PhotoVariant {
  kind: PhotoVariantKind;
  url: string;
  width: number;
  height: number;
}

export interface Photo {
  id: string;
  caption: string | null;
  description: string | null;
  camera: string | null;
  film: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
  tags: string[];
  createdAt: string;
  variants: PhotoVariant[];
}

export function getVariant(
  photo: Photo,
  kind: PhotoVariantKind,
): PhotoVariant | undefined {
  return (
    photo.variants.find((v) => v.kind === kind) ?? photo.variants[0]
  );
}
