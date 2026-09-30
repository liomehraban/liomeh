/** Documentos de búsqueda de Explorar (vía repositorio). Se sirven como JSON estático bajo demanda. */
import { documentosBusqueda, type DocBusqueda } from "@/lib/search";
import { getRepository } from "./repository";

export async function datosBusqueda(): Promise<DocBusqueda[]> {
  const repo = getRepository();
  const [mercados, interior, productores] = await Promise.all([repo.mercados(), repo.interior("la-merced"), repo.productores()]);
  // Productos del catálogo simulado de cada mercado sin interior (nombres únicos).
  const productosPorMercado: Record<string, string[]> = {};
  for (const m of mercados) {
    if (m.interior_disponible) continue;
    const puestos = await repo.puestosDeMercado(m.id);
    productosPorMercado[m.id] = [...new Set(puestos.flatMap((p) => p.productos.map((x) => x.n)))];
  }
  return documentosBusqueda(mercados, interior ? { [interior.mercado_id]: interior.puestos } : {}, productores, productosPorMercado);
}
