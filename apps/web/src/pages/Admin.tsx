import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePhoto, fetchPhotos, logout, me, updatePhoto, uploadPhoto } from "../lib/api";
import { getVariant, type Photo } from "../lib/types";

export function Admin() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const photo = await uploadPhoto(file, {});
      setPhotos((prev) => [photo, ...prev]);
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
      )}
    </main>
  );
}
