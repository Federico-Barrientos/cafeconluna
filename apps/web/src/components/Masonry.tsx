import { getVariant, type Photo } from "../lib/types";

interface MasonryProps {
  photos: Photo[];
  onSelect: (index: number) => void;
}

export function Masonry({ photos, onSelect }: MasonryProps) {
  if (photos.length === 0) {
    return <p className="gallery__empty">Todavía no hay fotos publicadas.</p>;
  }

  return (
    <div className="masonry">
      {photos.map((photo, index) => {
        const variant = getVariant(photo, "MEDIUM");
        return (
          <figure
            key={photo.id}
            className="masonry__item"
            onClick={() => onSelect(index)}
          >
            <img
              className="masonry__img"
              src={variant?.url}
              alt={photo.caption ?? ""}
              width={variant?.width}
              height={variant?.height}
              loading="lazy"
            />
          </figure>
        );
      })}
    </div>
  );
}
