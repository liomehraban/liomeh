/** Datos de apoyo para carrito, checkout y pedidos (vía repositorio). */
import { getRepository } from "./repository";
import { puestosEnLinea } from "./ficha-puesto";

export type PuestoResumen = {
  id: string;
  nombre: string;
  plan: "Gratis" | "Pro" | "Plus";
  giro: string;
  ubicacion: string;
  mercadoId: string;
  mercadoNombre: string;
  lat: number;
  lng: number;
};

export async function resumenPuestos(): Promise<Record<string, PuestoResumen>> {
  const repo = getRepository();
  const out: Record<string, PuestoResumen> = {};
  for (const { puestoId, mercadoId } of await puestosEnLinea()) {
    const [p, m] = await Promise.all([repo.puesto(puestoId), repo.mercado(mercadoId)]);
    if (!p || !m) continue;
    out[p.id] = { id: p.id, nombre: p.nombre, plan: p.plan, giro: p.giro, ubicacion: p.ubicacion_texto, mercadoId: m.id, mercadoNombre: m.nombre_display, lat: m.lat, lng: m.lng };
  }
  return out;
}

export type ColoniaEntrega = { alcaldia: string; colonia: string; lat: number; lng: number };

/** Colonias de entrega: las de los mercados del directorio, con su centroide. */
export async function coloniasEntrega(): Promise<ColoniaEntrega[]> {
  const grupos = new Map<string, { alcaldia: string; colonia: string; lat: number; lng: number; n: number }>();
  for (const m of await getRepository().mercados()) {
    const k = `${m.alcaldia}|${m.colonia}`;
    const g = grupos.get(k) ?? { alcaldia: m.alcaldia, colonia: m.colonia, lat: 0, lng: 0, n: 0 };
    g.lat += m.lat;
    g.lng += m.lng;
    g.n++;
    grupos.set(k, g);
  }
  return [...grupos.values()]
    .map(({ n, ...g }) => ({ ...g, lat: g.lat / n, lng: g.lng / n }))
    .sort((a, b) => a.alcaldia.localeCompare(b.alcaldia, "es") || a.colonia.localeCompare(b.colonia, "es"));
}
