/** Pasaporte de Mercados: puntos y niveles (data/lealtad.json). */
import type { Lealtad } from "./schemas";

export const PUNTOS_CHECKIN = 10;
export const PUNTOS_PRIMER_CHECKIN_MERCADO = 50;
export const PUNTOS_RESENA_FOTO = 15;

/** 1 punto por cada $10 del total; dobles si compra directo a un huerto o con Mercado+. */
export function puntosPorCompra(total: number, { dobles = false } = {}): number {
  const base = Math.floor(Math.max(0, total) / 10);
  return dobles ? base * 2 : base;
}

export type Nivel = Lealtad["niveles"][number];

export function nivelActual(puntos: number, niveles: Nivel[]): Nivel {
  const orden = [...niveles].sort((a, b) => a.desde - b.desde);
  return orden.filter((n) => puntos >= n.desde).at(-1) ?? orden[0];
}

/** Avance hacia el siguiente nivel (pct 0–100). En el último nivel, siguiente = null y pct = 100. */
export function progreso(puntos: number, niveles: Nivel[]) {
  const orden = [...niveles].sort((a, b) => a.desde - b.desde);
  const actual = nivelActual(puntos, orden);
  const siguiente = orden.find((n) => n.desde > puntos) ?? null;
  if (!siguiente) return { actual, siguiente, faltan: 0, pct: 100 };
  const pct = Math.round(((puntos - actual.desde) / (siguiente.desde - actual.desde)) * 100);
  return { actual, siguiente, faltan: siguiente.desde - puntos, pct };
}
