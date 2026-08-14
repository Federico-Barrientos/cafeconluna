import { useEffect, useState } from "react";
import { Masonry } from "../components/Masonry";
import { PhotoOverlay } from "../components/PhotoOverlay";
import { fetchMockPhotos } from "../lib/mockPhotos";
import type { Photo } from "../lib/types";

export function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    // TODO: reemplazar por la query `photos` de la API cuando esté levantada.
    fetchMockPhotos().then(setPhotos);
  }, []);

  return (
    <main className="gallery">
      <Masonry photos={photos} onSelect={setSelectedIndex} />

      {selectedIndex !== null && (
        <PhotoOverlay
          photos={photos}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </main>
  );
}
