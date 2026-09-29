/** Geometría del plano interior (SVG 1200×800, y hacia abajo). */
import type { Interior, RutaInterior } from "./schemas";

export type Punto = { x: number; y: number };

/** Orígenes ofrecidos en «Llévame» (ids de accesos que también son nodos del grafo). */
export const ORIGENES = ["metro-merced", "metro-candelaria", "circunvalacion"] as const;
export type Origen = (typeof ORIGENES)[number];
export const esOrigen = (s: string | null | undefined): s is Origen => !!s && (ORIGENES as readonly string[]).includes(s);

/** Coordenadas de la polilínea: nodos de la ruta + el punto del puesto. */
export function puntosDeRuta(interior: Interior, ruta: RutaInterior): Punto[] {
  const pos = new Map(interior.grafo.nodos.map((n) => [n.id, n]));
  const pts = ruta.nodos.map((id) => pos.get(id)).filter((n): n is NonNullable<typeof n> => !!n).map(({ x, y }) => ({ x, y }));
  const puesto = interior.puestos.find((p) => p.id === ruta.hacia_puesto);
  if (puesto) pts.push({ x: puesto.x, y: puesto.y });
  return pts;
}

/** Nodo donde está el marcador «Estás aquí» cuando se muestra el paso `i` (0-based). */
export function nodoEnPaso(ruta: RutaInterior, i: number): string {
  return i <= 0 ? ruta.desde : ruta.pasos[Math.min(i, ruta.pasos.length) - 1].hasta_nodo;
}

export function posicionNodo(interior: Interior, id: string): Punto | null {
  const n = interior.grafo.nodos.find((x) => x.id === id);
  return n ? { x: n.x, y: n.y } : null;
}

/** Transformación (pan/zoom) que centra el punto `p` del lienzo en un contenedor de `w`×`h`. */
export function transformacionCentrada(p: Punto, lienzo: { w: number; h: number }, cont: { w: number; h: number }, escala: number) {
  const s0 = cont.w / lienzo.w; // el SVG ocupa el ancho del contenedor a escala 1
  return { x: cont.w / 2 - p.x * s0 * escala, y: cont.h / 2 - p.y * s0 * escala, escala };
}
