import type { Resena } from "./schemas";

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
