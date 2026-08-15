import { useEffect, useState } from "react";
import { Masonry } from "../components/Masonry";
import { PhotoOverlay } from "../components/PhotoOverlay";
import { fetchPhotos } from "../lib/api";
import type { Photo } from "../lib/types";

export function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPhotos(activeTag).then((result) => {
      setPhotos(result);
      if (activeTag === null) {
        setAllTags(Array.from(new Set(result.flatMap((photo) => photo.tags))).sort());
      }
    });
  }, [activeTag]);

  return (
    <main className="gallery">
      <p className="intro">
        escuchando la mar, hoy y para siempre soy libre
      </p>

      {allTags.length > 0 && (
        <div className="gallery__filters">
          <button
            type="button"
            className={`tag-chip${activeTag === null ? " tag-chip--active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            Todas
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag-chip${activeTag === tag ? " tag-chip--active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

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
