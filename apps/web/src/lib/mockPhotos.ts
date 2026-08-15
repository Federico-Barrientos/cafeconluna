import type { Photo } from "./types";

// Datos de placeholder para poder desarrollar la galería sin depender de la
// API. Las imágenes salen de picsum.photos con un seed fijo por foto para
// que las proporciones (y el resultado del masonry) sean estables entre
// recargas. Cuando la API esté levantada, este archivo deja de usarse.
interface MockSpec {
  id: string;
  seed: string;
  width: number;
  height: number;
  caption: string;
  camera: string;
  film: string;
  aperture: string;
  shutterSpeed: string;
  tags: string[];
  daysAgo: number;
}

const SPECS: MockSpec[] = [
  { id: "1", seed: "luna-01", width: 1000, height: 1400, caption: "Costa al amanecer", camera: "Pentax K1000", film: "Kodak Portra 400", aperture: "f/5.6", shutterSpeed: "1/125", tags: ["paisaje"], daysAgo: 2 },
  { id: "2", seed: "luna-02", width: 1200, height: 800, caption: "Sierra en invierno", camera: "Nikon FM2", film: "Ilford HP5 400", aperture: "f/8", shutterSpeed: "1/250", tags: ["paisaje"], daysAgo: 5 },
  { id: "3", seed: "luna-03", width: 900, height: 900, caption: "Retrato en el patio", camera: "Canon AE-1", film: "Kodak Gold 200", aperture: "f/2.8", shutterSpeed: "1/60", tags: ["retrato"], daysAgo: 8 },
  { id: "4", seed: "luna-04", width: 1100, height: 1500, caption: "Perro de siesta", camera: "Pentax K1000", film: "Kodak Portra 400", aperture: "f/4", shutterSpeed: "1/125", tags: ["animales"], daysAgo: 10 },
  { id: "5", seed: "luna-05", width: 1300, height: 850, caption: "Feria de pueblo", camera: "Olympus OM-1", film: "Fujifilm Superia 400", aperture: "f/5.6", shutterSpeed: "1/250", tags: ["costumbrismo"], daysAgo: 14 },
  { id: "6", seed: "luna-06", width: 950, height: 1300, caption: "Luna llena sobre el cerro", camera: "Nikon FM2", film: "Ilford Delta 3200", aperture: "f/2", shutterSpeed: "1/30", tags: ["luna", "paisaje"], daysAgo: 18 },
  { id: "7", seed: "luna-07", width: 1200, height: 1200, caption: "Manos y lana", camera: "Canon AE-1", film: "Kodak Tri-X 400", aperture: "f/4", shutterSpeed: "1/125", tags: ["costumbrismo"], daysAgo: 21 },
  { id: "8", seed: "luna-08", width: 1400, height: 950, caption: "Camino de tierra", camera: "Pentax K1000", film: "Kodak Portra 160", aperture: "f/8", shutterSpeed: "1/250", tags: ["paisaje"], daysAgo: 25 },
  { id: "9", seed: "luna-09", width: 1000, height: 1350, caption: "Gato en la ventana", camera: "Olympus OM-1", film: "Kodak Gold 200", aperture: "f/2.8", shutterSpeed: "1/60", tags: ["animales"], daysAgo: 30 },
  { id: "10", seed: "luna-10", width: 1250, height: 830, caption: "Río al atardecer", camera: "Nikon FM2", film: "Fujifilm Superia 400", aperture: "f/11", shutterSpeed: "1/125", tags: ["paisaje"], daysAgo: 35 },
  { id: "11", seed: "luna-11", width: 900, height: 1200, caption: "Retrato de abuela", camera: "Canon AE-1", film: "Ilford HP5 400", aperture: "f/2.8", shutterSpeed: "1/60", tags: ["retrato", "costumbrismo"], daysAgo: 40 },
  { id: "12", seed: "luna-12", width: 1300, height: 900, caption: "Caballos al galope", camera: "Pentax K1000", film: "Kodak Tri-X 400", aperture: "f/8", shutterSpeed: "1/500", tags: ["animales"], daysAgo: 45 },
];

function buildVariants(spec: MockSpec): Photo["variants"] {
  const ratio = spec.height / spec.width;
  const sizes: { kind: Photo["variants"][number]["kind"]; width: number }[] = [
    { kind: "THUMBNAIL", width: 500 },
    { kind: "MEDIUM", width: 1000 },
    { kind: "FULL", width: 1800 },
  ];

  return sizes.map(({ kind, width }) => ({
    kind,
    url: `https://picsum.photos/seed/${spec.seed}/${width}/${Math.round(width * ratio)}`,
    width,
    height: Math.round(width * ratio),
  }));
}

export const mockPhotos: Photo[] = SPECS.map((spec) => ({
  id: spec.id,
  caption: spec.caption,
  camera: spec.camera,
  film: spec.film,
  aperture: spec.aperture,
  shutterSpeed: spec.shutterSpeed,
  tags: spec.tags,
  createdAt: new Date(Date.now() - spec.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  variants: buildVariants(spec),
}));

/** Simula el delay de una llamada a la API. */
export function fetchMockPhotos(): Promise<Photo[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockPhotos), 150));
}
