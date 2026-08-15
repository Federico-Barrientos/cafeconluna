import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { PhotoMetadata } from "../lib/api";

interface PhotoFormModalProps {
  title: string;
  previewUrl: string | null;
  metadata: PhotoMetadata;
  setMetadata: Dispatch<SetStateAction<PhotoMetadata>>;
  onCancel: () => void;
  onSubmit: (event: FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
}

export function PhotoFormModal({
  title,
  previewUrl,
  metadata,
  setMetadata,
  onCancel,
  onSubmit,
  submitting,
  submitLabel,
  submittingLabel,
}: PhotoFormModalProps) {
  return (
    <div
      className="upload-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Datos de la fotografía"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <form className="upload-modal__card" onSubmit={onSubmit}>
        <h3>{title}</h3>

        {previewUrl && (
          <img className="upload-modal__preview" src={previewUrl} alt="" />
        )}

        <div className="field">
          <label htmlFor="caption">Pie de foto</label>
          <input
            id="caption"
            type="text"
            value={metadata.caption}
            onChange={(e) => setMetadata((prev) => ({ ...prev, caption: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="camera">Cámara</label>
          <input
            id="camera"
            type="text"
            value={metadata.camera}
            onChange={(e) => setMetadata((prev) => ({ ...prev, camera: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="film">Rollo</label>
          <input
            id="film"
            type="text"
            value={metadata.film}
            onChange={(e) => setMetadata((prev) => ({ ...prev, film: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="aperture">Apertura</label>
          <input
            id="aperture"
            type="text"
            value={metadata.aperture}
            onChange={(e) => setMetadata((prev) => ({ ...prev, aperture: e.target.value }))}
          />
        </div>

        <div className="field">
          <label htmlFor="shutterSpeed">Velocidad de obturación</label>
          <input
            id="shutterSpeed"
            type="text"
            value={metadata.shutterSpeed}
            onChange={(e) =>
              setMetadata((prev) => ({ ...prev, shutterSpeed: e.target.value }))
            }
          />
        </div>

        <div className="upload-modal__actions">
          <button type="button" className="btn-small" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
