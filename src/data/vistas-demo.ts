/** Datos de las vistas de locatario y productor (vía repositorio). */
import { getRepository } from "./repository";
import { datosPuesto } from "./ficha-puesto";

export async function datosLocatario() {
  const repo = getRepository();
  const demo = await repo.demo();
  const [ficha, productores, modelo] = await Promise.all([datosPuesto(demo.locatario.puesto_id), repo.productores(), repo.modeloNegocio()]);
  if (!ficha) throw new Error(`Puesto demo inexistente: ${demo.locatario.puesto_id}`);
  return {
    demo: demo.locatario,
    puesto: ficha.puesto,
    mercado: ficha.mercado,
    resenas: ficha.resenas,
    productores: productores.map((p) => ({ id: p.id, nombre: p.nombre })),
    planes: (modelo.precios.locatario ?? []) as { plan: string; precio: number; moneda?: string; incluye: string[] }[],
  };
}

export async function datosProductor() {
  const repo = getRepository();
  const demo = await repo.demo();
  const productor = await repo.productor(demo.productor.productor_id);
  if (!productor) throw new Error(`Productor demo inexistente: ${demo.productor.productor_id}`);
  const modelo = await repo.modeloNegocio();
  return { demo: demo.productor, productor, planProductor: ((modelo.precios.productor ?? [])[0] ?? null) as { plan: string; comision?: string } | null };
}
