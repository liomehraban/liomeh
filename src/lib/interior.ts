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

/** Márgenes (px) del contenedor tapados por controles flotantes; el encuadre los respeta. */
export type Margen = { top?: number; right?: number; bottom?: number; left?: number };

/**
 * Transformación (pan/zoom) que centra el punto `p` del lienzo en un contenedor de `w`×`h`.
 * Con `margen`, centra en el área libre (descontando los controles superpuestos).
 */
export function transformacionCentrada(
  p: Punto,
  lienzo: { w: number; h: number },
  cont: { w: number; h: number },
  escala: number,
  margen: Margen = {},
) {
  const { top = 0, right = 0, bottom = 0, left = 0 } = margen;
  const s0 = cont.w / lienzo.w; // el SVG ocupa el ancho del contenedor a escala 1
  const cx = left + (cont.w - left - right) / 2;
  const cy = top + (cont.h - top - bottom) / 2;
  return { x: cx - p.x * s0 * escala, y: cy - p.y * s0 * escala, escala };
}

/** Escala a la que el lienzo completo cabe (ancho y alto) en el área libre del contenedor. */
export function escalaAjuste(lienzo: { w: number; h: number }, cont: { w: number; h: number }, margen: Margen = {}) {
  const { top = 0, right = 0, bottom = 0, left = 0 } = margen;
  const s0 = cont.w / lienzo.w;
  const libreW = Math.max(1, cont.w - left - right);
  const libreH = Math.max(1, cont.h - top - bottom);
  return Math.min(libreW / (lienzo.w * s0), libreH / (lienzo.h * s0));
}

/**
 * Tamaño (en unidades del plano) de una etiqueta para que mida al menos `minPx` en pantalla.
 * Devuelve `null` si a ese tamaño el texto no cabe en `disponible` (se oculta hasta acercarse).
 */
export function tamEtiqueta(texto: string, base: number, disponible: number, pxPorUnidad: number, minPx = 10): number | null {
  const tam = Math.max(base, minPx / Math.max(pxPorUnidad, 1e-6));
  return texto.length * 0.6 * tam <= disponible ? tam : null;
}

/** Aleja `p` de los marcadores de `otros` que estén a menos de `dist` (evita íconos encimados). */
export function separarDe(p: Punto, otros: Punto[], dist: number): Punto {
  let { x, y } = p;
  for (const o of otros) {
    const dx = x - o.x;
    const dy = y - o.y;
    const d = Math.hypot(dx, dy);
    if (d >= dist) continue;
    const [ux, uy] = d > 0.001 ? [dx / d, dy / d] : [0, 1];
    x = o.x + ux * dist;
    y = o.y + uy * dist;
  }
  return { x, y };
}
