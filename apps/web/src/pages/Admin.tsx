import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  deletePhoto,
  fetchPhotos,
  logout,
  me,
  updatePhoto,
  uploadPhoto,
  type PhotoMetadata,
} from "../lib/api";
import { getVariant, type Photo } from "../lib/types";

const EMPTY_METADATA: PhotoMetadata = {
  caption: "",
  camera: "",
  film: "",
  aperture: "",
  shutterSpeed: "",
};

export function Admin() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PhotoMetadata>(EMPTY_METADATA);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    me().then((user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setCheckingSession(false);
    });
  }, [navigate]);

  useEffect(() => {
    if (checkingSession) return;
    fetchPhotos()
      .then(setPhotos)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las fotos"))
      .finally(() => setLoading(false));
  }, [checkingSession]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la foto");
    }
  }

  async function handleEdit(id: string) {
    const current = photos.find((p) => p.id === id);
    const next = window.prompt("Nuevo pie de foto", current?.caption ?? "");
    if (next === null) return;
    setError(null);
    try {
      const updated = await updatePhoto(id, { caption: next });
      setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo editar la foto");
    }
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setMetadata(EMPTY_METADATA);
    setPendingFile(file);
  }

  function handleUploadCancel() {
    setPendingFile(null);
    setMetadata(EMPTY_METADATA);
  }

  async function handleUploadConfirm(event: FormEvent) {
    event.preventDefault();
    if (!pendingFile) return;

    setError(null);
    setUploading(true);
    try {
      const photo = await uploadPhoto(pendingFile, metadata);
      setPhotos((prev) => [photo, ...prev]);
      setPendingFile(null);
      setMetadata(EMPTY_METADATA);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto");
    } finally {
      setUploading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-page">
        <p>Verificando sesión…</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-page__toolbar">
        <h2>Fotos ({photos.length})</h2>
        <div className="admin-page__toolbar-actions">
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
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Subiendo…" : "Subir foto"}
          </button>
          <button type="button" className="btn-small" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="admin-grid">
          {photos.map((photo) => {
            const variant = getVariant(photo, "THUMBNAIL");
            const rollData = [photo.camera, photo.film, photo.aperture, photo.shutterSpeed]
              .filter(Boolean)
              .join(" · ");
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
                  {rollData && <p className="photo-overlay__data">{rollData}</p>}
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
      )}

      {pendingFile && (
        <div
          className="upload-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Datos de la fotografía"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleUploadCancel();
          }}
        >
          <form className="upload-modal__card" onSubmit={handleUploadConfirm}>
            <h3>{pendingFile.name}</h3>

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
              <button type="button" className="btn-small" onClick={handleUploadCancel}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? "Subiendo…" : "Subir"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
