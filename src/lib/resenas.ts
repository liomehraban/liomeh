import type { Resena } from "./schemas";
import { PUNTOS_RESENA_FOTO } from "./loyalty";

export type Rating = { promedio: number; total: number };

/** Promedio de estrellas (1 decimal). null si no hay reseñas. */
export function ratingPromedio(resenas: Pick<Resena, "estrellas">[]): Rating | null {
  if (!resenas.length) return null;
  const suma = resenas.reduce((s, r) => s + r.estrellas, 0);
  return { promedio: Math.round((suma / resenas.length) * 10) / 10, total: resenas.length };
}

/** Ratings por objetivo_id. */
export function ratingsPorObjetivo(resenas: Resena[]): Record<string, Rating> {
  const grupos: Record<string, Resena[]> = {};
  for (const r of resenas) (grupos[r.objetivo_id] ??= []).push(r);
  return Object.fromEntries(Object.entries(grupos).map(([id, rs]) => [id, ratingPromedio(rs)!]));
}

/**
 * Combina un rating base (del JSON: promedio y número de reseñas) con reseñas propias del store.
 * Promedio ponderado a 1 decimal.
 */
export function combinarRating(base: Rating | null, propias: Pick<Resena, "estrellas">[]): Rating | null {
  if (!propias.length) return base;
  const n0 = base?.total ?? 0;
  const s0 = (base?.promedio ?? 0) * n0;
  const total = n0 + propias.length;
  const promedio = Math.round(((s0 + propias.reduce((s, r) => s + r.estrellas, 0)) / total) * 10) / 10;
  return { promedio, total };
}

export const MIN_CARACTERES_RESENA = 20;
export const resenaValida = (r: { estrellas: number; texto: string }) =>
  r.estrellas >= 1 && r.estrellas <= 5 && r.texto.trim().length >= MIN_CARACTERES_RESENA;

/**
 * Sello de verificación de una reseña: solo si la persona compró en ese lugar (puesto, mercado o
 * productor) o hizo check-in en él. Sin evidencia, la reseña se publica sin sello.
 */
export function verificacionResena(
  objetivoId: string,
  h: { checkins: { objetivo: string; mercadoId: string }[]; pedidos: { puestoId: string; mercadoId: string }[] },
): Resena["verificada"] | undefined {
  if (h.pedidos.some((p) => p.puestoId === objetivoId || p.mercadoId === objetivoId)) return "compra";
  if (h.checkins.some((c) => c.objetivo === objetivoId || c.mercadoId === objetivoId || c.objetivo === `mercado:${objetivoId}`)) return "check-in QR";
  return undefined;
}

/** Puntos por reseña (lealtad.json: «Reseña con foto: 15 puntos»), solo la primera vez en cada lugar. */
export const puntosPorResena = (yaReseno: boolean, conFoto: boolean) => (!yaReseno && conFoto ? PUNTOS_RESENA_FOTO : 0);
