/** Utilidades geográficas puras. Coordenadas en grados decimales. */

export type LatLng = { lat: number; lng: number };

/** Zócalo de la CDMX: origen por default si se niega la geolocalización. */
export const ZOCALO: LatLng = { lat: 19.4326, lng: -99.1332 };
/** Centro inicial del mapa de la ciudad (M1). */
export const CENTRO_CDMX: LatLng = { lat: 19.4, lng: -99.13 };

const R = 6371008.8; // radio medio de la Tierra en metros
const rad = (g: number) => (g * Math.PI) / 180;

/** Distancia en metros entre dos puntos (fórmula de haversine). */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** «850 m», «1.2 km», «24 km». Usa el separador decimal del locale. */
export function formatDistance(metros: number, locale = "es"): string {
  if (metros < 1000) return `${Math.max(10, Math.round(metros / 10) * 10)} m`;
  const km = metros / 1000;
  const n = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: km < 10 ? 1 : 0 }).format(km);
  return `${n} km`;
}

export type BBox = [minLng: number, minLat: number, maxLng: number, maxLat: number];

export function bbox(puntos: LatLng[]): BBox | null {
  if (!puntos.length) return null;
  let [minLng, minLat, maxLng, maxLat] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const p of puntos) {
    minLng = Math.min(minLng, p.lng);
    minLat = Math.min(minLat, p.lat);
    maxLng = Math.max(maxLng, p.lng);
    maxLat = Math.max(maxLat, p.lat);
  }
  return [minLng, minLat, maxLng, maxLat];
}

/** Los `n` más cercanos a `origen`, con su distancia. */
export function masCercanos<T extends LatLng>(items: T[], origen: LatLng, n: number): (T & { distancia: number })[] {
  return items
    .map((it) => ({ ...it, distancia: haversine(origen, it) }))
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, n);
}

/** Link de Google Maps en transporte público (M1 «Cómo llegar»). */
export function comoLlegarUrl({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
}
