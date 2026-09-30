import { getRepository } from "./repository";

/** Datos de la ficha desde el repositorio (compartido con el test que recorre los 346 ids). */
export async function datosFicha(id: string) {
  const repo = getRepository();
  const mercado = await repo.mercado(id);
  if (!mercado) return null;
  const [puestos, resenas, eventos, rutas] = await Promise.all([
    repo.puestosDeMercado(id),
    repo.resenas(id),
    repo.eventos(),
    repo.rutas(),
  ]);
  return {
    mercado,
    puestos,
    resenas,
    eventos: eventos.filter((e) => e.mercado_id === id),
    rutas: rutas.filter((r) => r.paradas.includes(id)),
  };
}
