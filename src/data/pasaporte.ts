/** Datos de apoyo del pasaporte (M9) vía repositorio. */
import type { ContextoInsignias } from "@/lib/loyalty";
import { getRepository } from "./repository";

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
  const [enLinea, destacados] = await Promise.all([repo.puestosEnLinea(), repo.mercados({ destacados: true })]);
  const out: ObjetivoCheckin[] = enLinea.map(({ puesto: p, mercado: m }) => ({ objetivo: p.id, nombre: p.nombre, mercadoId: m.id, mercadoNombre: m.nombre_display, tipo: "puesto" }));
  for (const m of destacados) {
    if (m.interior_disponible) continue;
    out.push({ objetivo: `mercado:${m.id}`, nombre: m.nombre_display, mercadoId: m.id, mercadoNombre: m.nombre_display, tipo: "mostrador" });
  }
  return out;
}
