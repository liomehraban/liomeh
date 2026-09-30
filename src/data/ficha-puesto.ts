import type { PuestoResumen } from "./comercio";
import { esPuestoSimulado, mercadoDePuestoSimulado } from "@/lib/catalogo-simulado";
import { getRepository } from "./repository";

/** Todos los puestos en línea (hoy, los de mercados con interior) con su mercado. */
export async function puestosEnLinea() {
  const repo = getRepository();
  const conInterior = await repo.mercados();
  const out: { puestoId: string; mercadoId: string }[] = [];
  for (const m of conInterior.filter((x) => x.interior_disponible)) {
    const i = await repo.interior(m.id);
    i?.puestos.forEach((p) => out.push({ puestoId: p.id, mercadoId: m.id }));
  }
  return out;
}

/** Datos de la pantalla de puesto (M4) desde el repositorio. Incluye los puestos del catálogo simulado. */
export async function datosPuesto(id: string) {
  const repo = getRepository();
  const puesto = await repo.puesto(id);
  if (!puesto) return null;
  const mercadoId = esPuestoSimulado(id) ? mercadoDePuestoSimulado(id) : (await puestosEnLinea()).find((x) => x.puestoId === id)?.mercadoId;
  if (!mercadoId) return null;
  const [mercado, hermanos, resenas] = await Promise.all([repo.mercado(mercadoId), repo.puestosDeMercado(mercadoId), repo.resenas(id)]);
  if (!mercado) return null;
  const huertos = [...new Set((puesto.origen ?? []).map((o) => o.huerto_id).filter((h): h is string => !!h))];
  const productores = (await Promise.all(huertos.map((h) => repo.productor(h)))).filter((p) => p !== null);
  return {
    puesto,
    mercado: { id: mercado.id, nombre: mercado.nombre_display, interior: !!mercado.interior_disponible, lat: mercado.lat, lng: mercado.lng },
    resenas,
    productores,
    nombresPuestos: Object.fromEntries(hermanos.map((p) => [p.id, p.nombre])),
    vendedor: {
      id: puesto.id,
      tipo: "puesto",
      nombre: puesto.nombre,
      plan: puesto.plan,
      giro: puesto.giro,
      ubicacion: puesto.ubicacion_texto,
      mercadoId: mercado.id,
      mercadoNombre: mercado.nombre_display,
      lat: mercado.lat,
      lng: mercado.lng,
    } satisfies PuestoResumen,
  };
}
