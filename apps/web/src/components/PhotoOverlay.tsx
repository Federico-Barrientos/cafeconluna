import { useEffect, useRef } from "react";
import { getVariant, type Photo } from "../lib/types";

interface PhotoOverlayProps {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoOverlay({
  photos,
  index,
  onClose,
  onNavigate,
}: PhotoOverlayProps) {
  const photo = photos[index];
  const prevIndex = (index - 1 + photos.length) % photos.length;
  const nextIndex = (index + 1) % photos.length;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onNavigate(prevIndex);
      if (event.key === "ArrowRight") onNavigate(nextIndex);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevIndex, nextIndex, onClose, onNavigate]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!photo) return null;

  const variant = getVariant(photo, "FULL");
  const ratio = variant ? `${variant.width} / ${variant.height}` : undefined;
  const rollData = [
    photo.camera,
    photo.film,
    photo.aperture,
    photo.shutterSpeed,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="photo-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Vista de detalle de la fotografía"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        className="photo-overlay__nav photo-overlay__nav--prev"
        onClick={() => onNavigate(prevIndex)}
        aria-label="Foto anterior"
      >
        ‹
      </button>
      <button
        type="button"
        className="photo-overlay__nav photo-overlay__nav--next"
        onClick={() => onNavigate(nextIndex)}
        aria-label="Foto siguiente"
      >
        ›
      </button>
      <button
        ref={closeButtonRef}
        type="button"
        className="photo-overlay__close"
        onClick={onClose}
        aria-label="Cerrar vista de detalle"
      >
        ×
      </button>

      <div className="photo-overlay__frame">
        <div
          className="photo-overlay__img"
          style={{ "--ratio": ratio } as React.CSSProperties}
        >
          <img src={variant?.url} alt={photo.caption ?? ""} />
        </div>
      </div>

      <div className="photo-overlay__caption">
        {photo.tags.length > 0 && (
          <p className="photo-overlay__tags">{photo.tags.join(" · ")}</p>
        )}
        {photo.caption && (
          <h2 className="photo-overlay__title">{photo.caption}</h2>
        )}
        {photo.description && (
          <p className="photo-overlay__description">{photo.description}</p>
        )}
        {rollData && <p className="photo-overlay__data">{rollData}</p>}
      </div>
    </div>
  );
}
