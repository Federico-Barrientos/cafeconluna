import { useEffect } from "react";
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
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) onNavigate(index - 1);
      if (event.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  if (!photo) return null;

  const variant = getVariant(photo, "FULL");
  const metaItems: { label: string; value: string | null }[] = [
    { label: "cámara", value: photo.camera },
    { label: "rollo", value: photo.film },
    { label: "apertura", value: photo.aperture },
    { label: "velocidad", value: photo.shutterSpeed },
  ];

  return (
    <div className="photo-overlay" role="dialog" aria-modal="true">
      <div className="photo-overlay__top">
        <button
          type="button"
          className="photo-overlay__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <div className="photo-overlay__body">
        <button
          type="button"
          className="photo-overlay__nav-btn"
          onClick={() => onNavigate(index - 1)}
          disabled={!hasPrev}
          aria-label="Foto anterior"
        >
          ‹
        </button>

        <img
          className="photo-overlay__image"
          src={variant?.url}
          alt={photo.caption ?? ""}
        />

        <button
          type="button"
          className="photo-overlay__nav-btn"
          onClick={() => onNavigate(index + 1)}
          disabled={!hasNext}
          aria-label="Foto siguiente"
        >
          ›
        </button>
      </div>

      {photo.caption && (
        <p className="photo-overlay__caption">{photo.caption}</p>
      )}

      <div className="photo-overlay__meta">
        {metaItems
          .filter((item) => item.value)
          .map((item) => (
            <span key={item.label}>
              {item.label}: <strong>{item.value}</strong>
            </span>
          ))}
      </div>
    </div>
  );
}
