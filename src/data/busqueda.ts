/** Documentos de búsqueda de Explorar (vía repositorio). Se sirven como JSON estático bajo demanda. */
import type { Puesto } from "@/lib/schemas";
import { documentosBusqueda, type DocBusqueda } from "@/lib/search";
import { getRepository } from "./repository";

export async function datosBusqueda(): Promise<DocBusqueda[]> {
  const repo = getRepository();
  const [mercados, enLinea, productores, productos] = await Promise.all([repo.mercados(), repo.puestosEnLinea(), repo.productores(), repo.productosPorMercado()]);
  // Puestos reales en línea: documento propio por puesto y producto. Los demás mercados se encuentran
  // por los productos de su catálogo simulado (sin documento por puesto).
  const puestosPorMercado: Record<string, Puesto[]> = {};
  for (const { puesto, mercado } of enLinea) (puestosPorMercado[mercado.id] ??= []).push(puesto);
  const productosSimulados = Object.fromEntries(Object.entries(productos).filter(([id]) => !puestosPorMercado[id]));
  return documentosBusqueda(mercados, puestosPorMercado, productores, productosSimulados);
}
