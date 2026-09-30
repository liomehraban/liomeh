import { getRepository } from "./repository";

export type Parada = { id: string; nombre: string; lat: number; lng: number; tipo: "mercado" | "productor"; href: string };

/** Paradas de todas las rutas resueltas contra mercados y productores. */
export async function paradasRutas(): Promise<Record<string, Parada>> {
  const repo = getRepository();
  const [rutas, mercados, productores] = await Promise.all([repo.rutas(), repo.mercados(), repo.productores()]);
  const ids = new Set(rutas.flatMap((r) => r.paradas));
  const out: Record<string, Parada> = {};
  for (const m of mercados) if (ids.has(m.id)) out[m.id] = { id: m.id, nombre: m.nombre_display, lat: m.lat, lng: m.lng, tipo: "mercado", href: `/mercado/${m.id}` };
  for (const p of productores) if (ids.has(p.id)) out[p.id] = { id: p.id, nombre: p.nombre, lat: p.lat, lng: p.lng, tipo: "productor", href: `/huertos/${p.id}` };
  return out;
}
