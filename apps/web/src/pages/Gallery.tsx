import { useEffect, useState } from "react";
import { Masonry } from "../components/Masonry";
import { PhotoOverlay } from "../components/PhotoOverlay";
import { fetchPhotos } from "../lib/api";
import type { Photo } from "../lib/types";

export function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos().then(setPhotos);
  }, []);

  return (
    <main className="gallery">
      <p className="intro">
        Fotografía analógica de paisaje, costumbrismo, retratos y animales —
        capturada entre la última luz del atardecer y las noches de luna
        llena.
      </p>

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
