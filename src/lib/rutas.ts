/** Rutas y experiencias (M11). */
import type { Checkin } from "./loyalty";

export type EstadoRuta = {
  checkins: Checkin[];
  pedidos: { puestoId: string; fecha: string }[];
  reservasVisita: { productorId: string; creada: string }[];
};

/**
 * Paradas completadas desde que se inició la ruta: un mercado cuenta con un check-in ahí;
 * un productor, con una compra o una visita reservada.
 */
export function paradasHechas(paradas: string[], e: EstadoRuta, inicio: string): Set<string> {
  const desde = (iso: string) => iso >= inicio;
  const hechas = new Set<string>();
  for (const id of paradas) {
    if (
      e.checkins.some((c) => c.mercadoId === id && desde(c.fecha)) ||
      e.pedidos.some((p) => p.puestoId === id && desde(p.fecha)) ||
      e.reservasVisita.some((r) => r.productorId === id && desde(r.creada))
    )
      hechas.add(id);
  }
  return hechas;
}

/** Proyecta paradas lat/lng a un lienzo w×h con margen (mini mapa SVG). */
export function proyectar(puntos: { lat: number; lng: number }[], w: number, h: number, margen = 12) {
  if (!puntos.length) return [];
  const lats = puntos.map((p) => p.lat);
  const lngs = puntos.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const sx = (w - 2 * margen) / Math.max(maxLng - minLng, 1e-6);
  const sy = (h - 2 * margen) / Math.max(maxLat - minLat, 1e-6);
  const s = Math.min(sx, sy);
  const ox = (w - (maxLng - minLng) * s) / 2;
  const oy = (h - (maxLat - minLat) * s) / 2;
  return puntos.map((p) => ({ x: ox + (p.lng - minLng) * s, y: oy + (maxLat - p.lat) * s }));
}
