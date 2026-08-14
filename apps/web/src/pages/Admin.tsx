import { useRef, useState } from "react";
import { mockPhotos } from "../lib/mockPhotos";
import { getVariant, type Photo } from "../lib/types";

// TODO: reemplazar el estado local por las mutaciones uploadPhoto /
// updatePhoto / deletePhoto de la API cuando esté levantada.
export function Admin() {
  const [photos, setPhotos] = useState<Photo[]>(mockPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDelete(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(id: string) {
    const current = photos.find((p) => p.id === id);
    const next = window.prompt("Nuevo pie de foto", current?.caption ?? "");
    if (next === null) return;
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption: next } : p)),
    );
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // TODO: mandar `file` a la mutation uploadPhoto (multipart).
    console.log("Foto seleccionada para subir:", file.name);
    event.target.value = "";
  }

  return (
    <main className="admin-page">
      <div className="admin-page__toolbar">
        <h2>Fotos ({photos.length})</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileSelected}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Subir foto
          </button>
        </div>
      </div>

      <div className="admin-grid">
        {photos.map((photo) => {
          const variant = getVariant(photo, "THUMBNAIL");
          return (
            <div key={photo.id} className="admin-card">
              <img
                className="admin-card__img"
                src={variant?.url}
                alt={photo.caption ?? ""}
              />
              <div className="admin-card__body">
                <p className="admin-card__caption">
                  {photo.caption || "Sin pie de foto"}
                </p>
                <div className="admin-card__actions">
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => handleEdit(photo.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-small btn-small--danger"
                    onClick={() => handleDelete(photo.id)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
