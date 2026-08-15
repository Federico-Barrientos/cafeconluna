import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  deletePhoto,
  fetchPhotos,
  logout,
  updatePhoto,
  uploadPhoto,
  type PhotoMetadata,
} from "../lib/api";
import { useAuth } from "../lib/auth";
import { PhotoFormModal } from "../components/PhotoFormModal";
import { getVariant, type Photo } from "../lib/types";

const EMPTY_METADATA: PhotoMetadata = {
  caption: "",
  camera: "",
  film: "",
  aperture: "",
  shutterSpeed: "",
  tags: [],
};

function metadataFromPhoto(photo: Photo): PhotoMetadata {
  return {
    caption: photo.caption ?? "",
    camera: photo.camera ?? "",
    film: photo.film ?? "",
    aperture: photo.aperture ?? "",
    shutterSpeed: photo.shutterSpeed ?? "",
    tags: photo.tags,
  };
}

type Modal = { kind: "create"; file: File } | { kind: "edit"; photo: Photo };

export function Admin() {
  const navigate = useNavigate();
  const { user, loading: checkingSession, refresh } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<Modal | null>(null);
  const [metadata, setMetadata] = useState<PhotoMetadata>(EMPTY_METADATA);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!checkingSession && !user) {
      navigate("/login");
    }
  }, [checkingSession, user, navigate]);

  useEffect(() => {
    if (checkingSession || !user) return;
    fetchPhotos()
      .then(setPhotos)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las fotos"))
      .finally(() => setLoading(false));
  }, [checkingSession, user]);

  useEffect(() => {
    if (!modal) {
      setPreviewUrl(null);
      return;
    }
    if (modal.kind === "create") {
      const url = URL.createObjectURL(modal.file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    const variant = getVariant(modal.photo, "MEDIUM");
    setPreviewUrl(variant?.url ?? null);
  }, [modal]);

  async function handleLogout() {
    await logout();
    await refresh();
    navigate("/login");
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setError(null);
    setDeleteTarget(null);
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la foto");
    }
  }

  function handleEdit(id: string) {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    setError(null);
    setMetadata(metadataFromPhoto(photo));
    setModal({ kind: "edit", photo });
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setMetadata(EMPTY_METADATA);
    setModal({ kind: "create", file });
  }

  function handleModalCancel() {
    setModal(null);
    setMetadata(EMPTY_METADATA);
  }

  async function handleModalSubmit(event: FormEvent) {
    event.preventDefault();
    if (!modal) return;

    setError(null);
    setSubmitting(true);
    try {
      if (modal.kind === "create") {
        const photo = await uploadPhoto(modal.file, metadata);
        setPhotos((prev) => [photo, ...prev]);
      } else {
        const updated = await updatePhoto(modal.photo.id, metadata);
        setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setModal(null);
      setMetadata(EMPTY_METADATA);
    } catch (err) {
      const fallback = modal.kind === "create" ? "No se pudo subir la foto" : "No se pudo editar la foto";
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingSession || !user) {
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
            disabled={submitting}
            onClick={() => fileInputRef.current?.click()}
          >
            {submitting ? "Subiendo…" : "Subir foto"}
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
                      onClick={() => setDeleteTarget(photo)}
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

      {modal && (
        <PhotoFormModal
          title={modal.kind === "create" ? modal.file.name : "Editar foto"}
          previewUrl={previewUrl}
          metadata={metadata}
          setMetadata={setMetadata}
          onCancel={handleModalCancel}
          onSubmit={handleModalSubmit}
          submitting={submitting}
          submitLabel={modal.kind === "create" ? "Subir" : "Guardar"}
          submittingLabel={modal.kind === "create" ? "Subiendo…" : "Guardando…"}
        />
      )}

      {deleteTarget && (
        <div
          className="upload-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar borrado"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className="upload-modal__card">
            <h3>Borrar foto</h3>
            <p>
              ¿Borrar «{deleteTarget.caption || "esta foto"}»? No se puede
              deshacer.
            </p>
            <div className="upload-modal__actions">
              <button
                type="button"
                className="btn-small"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary btn-primary--danger"
                onClick={handleDeleteConfirmed}
              >
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
