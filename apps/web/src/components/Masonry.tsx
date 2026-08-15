import { getVariant, type Photo } from "../lib/types";

interface MasonryProps {
  photos: Photo[];
  onSelect: (index: number, trigger: HTMLButtonElement) => void;
}

export function Masonry({ photos, onSelect }: MasonryProps) {
  if (photos.length === 0) {
    return <p className="gallery__empty">Todavía no hay fotos publicadas.</p>;
  }

  return (
    <div className="masonry">
      {photos.map((photo, index) => {
        const variant = getVariant(photo, "MEDIUM");
        const ratio = variant ? `${variant.width} / ${variant.height}` : undefined;
        return (
          <button
            key={photo.id}
            type="button"
            className="masonry__item"
            onClick={(event) => onSelect(index, event.currentTarget)}
            aria-label={`Ver detalle: ${photo.caption ?? "foto"}`}
          >
            <span
              className="masonry__frame"
              style={{ "--ratio": ratio } as React.CSSProperties}
            >
              <img
                className="masonry__img"
                src={variant?.url}
                alt={photo.caption ?? ""}
                width={variant?.width}
                height={variant?.height}
                loading="lazy"
              />
            </span>
            {(photo.tags.length > 0 || photo.caption) && (
              <span className="masonry__meta">
                <div>
                {photo.tags.map((tag) => (
                  <span key={tag} className="masonry__tag">
                    {tag} {photo.tags.length > 1 && "· "}
                  </span>
                ))}
                </div>
                {photo.caption && (
                  <span className="masonry__caption">{photo.caption}</span>
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
