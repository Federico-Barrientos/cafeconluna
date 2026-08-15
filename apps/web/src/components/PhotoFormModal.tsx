import { useState, type Dispatch, type FormEvent, type KeyboardEvent, type SetStateAction } from "react";
import type { PhotoMetadata } from "../lib/api";

const SUGGESTED_TAGS = ["paisaje", "retrato", "costumbrismo", "animales", "luna"];

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
  const [tagInput, setTagInput] = useState("");
  const tags = metadata.tags ?? [];

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setMetadata((prev) => ({ ...prev, tags: [...(prev.tags ?? []), tag] }));
  }

  function removeTag(tag: string) {
    setMetadata((prev) => ({ ...prev, tags: (prev.tags ?? []).filter((t) => t !== tag) }));
  }

  function handleTagInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  }

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

        <div className="field">
          <label htmlFor="tags">Tags</label>
          {tags.length > 0 && (
            <div className="tag-chips">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag-chip tag-chip--removable"
                  onClick={() => removeTag(tag)}
                  aria-label={`Quitar tag ${tag}`}
                >
                  {tag} ×
                </button>
              ))}
            </div>
          )}
          <input
            id="tags"
            type="text"
            placeholder="Escribí un tag y presioná Enter o coma"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            onBlur={() => {
              if (tagInput.trim()) {
                addTag(tagInput);
                setTagInput("");
              }
            }}
          />
          <div className="tag-chips">
            {SUGGESTED_TAGS.filter((tag) => !tags.includes(tag)).map((tag) => (
              <button
                key={tag}
                type="button"
                className="tag-chip"
                onClick={() => addTag(tag)}
              >
                + {tag}
              </button>
            ))}
          </div>
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
