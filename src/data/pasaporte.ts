/** Datos de apoyo del pasaporte (M9) vía repositorio. */
import type { ContextoInsignias } from "@/lib/loyalty";
import { getRepository } from "./repository";
import { puestosEnLinea } from "./ficha-puesto";

export async function contextoInsignias(): Promise<ContextoInsignias & { nombres: Record<string, string> }> {
  const repo = getRepository();
  const [mercados, productores] = await Promise.all([repo.mercados(), repo.productores()]);
  return {
    mercados: Object.fromEntries(mercados.map((m) => [m.id, { alcaldia: m.alcaldia, colonia: m.colonia, lat: m.lat, lng: m.lng }])),
    productores: Object.fromEntries(productores.map((p) => [p.id, { alcaldia: p.alcaldia }])),
    nombres: Object.fromEntries(mercados.map((m) => [m.id, m.nombre_display])),
  };
}

export type ObjetivoCheckin = { objetivo: string; nombre: string; mercadoId: string; mercadoNombre: string; tipo: "puesto" | "mostrador" };

/** Lo que se puede escanear en la demo: puestos en línea + mostrador general de los mercados destacados sin puestos en línea. */
export async function objetivosCheckin(): Promise<ObjetivoCheckin[]> {
  const repo = getRepository();
  const out: ObjetivoCheckin[] = [];
  for (const { puestoId, mercadoId } of await puestosEnLinea()) {
    const [p, m] = await Promise.all([repo.puesto(puestoId), repo.mercado(mercadoId)]);
    if (p && m) out.push({ objetivo: p.id, nombre: p.nombre, mercadoId: m.id, mercadoNombre: m.nombre_display, tipo: "puesto" });
  }
  for (const m of await repo.mercados({ destacados: true })) {
    if (m.interior_disponible) continue;
    out.push({ objetivo: `mercado:${m.id}`, nombre: m.nombre_display, mercadoId: m.id, mercadoNombre: m.nombre_display, tipo: "mostrador" });
  }
  return out;
}
