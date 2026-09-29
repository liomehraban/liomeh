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

/** Datos de la pantalla de puesto (M4) desde el repositorio. */
export async function datosPuesto(id: string) {
  const repo = getRepository();
  const ref = (await puestosEnLinea()).find((x) => x.puestoId === id);
  if (!ref) return null;
  const [mercado, interior, resenas] = await Promise.all([repo.mercado(ref.mercadoId), repo.interior(ref.mercadoId), repo.resenas(id)]);
  const puesto = interior?.puestos.find((p) => p.id === id);
  if (!mercado || !interior || !puesto) return null;
  const huertos = [...new Set((puesto.origen ?? []).map((o) => o.huerto_id).filter((h): h is string => !!h))];
  const productores = (await Promise.all(huertos.map((h) => repo.productor(h)))).filter((p) => p !== null);
  return {
    puesto,
    mercado: { id: mercado.id, nombre: mercado.nombre_display },
    resenas,
    productores,
    nombresPuestos: Object.fromEntries(interior.puestos.map((p) => [p.id, p.nombre])),
  };
}
