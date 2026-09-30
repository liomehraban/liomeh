import type { DatosAsistente } from "@/lib/assistant/types";
import { getRepository } from "./repository";
import { cacheConVigencia, VIGENCIA_DATOS_MS } from "./cache";

/** Datos que usa el asistente (fallback y contexto del modelo), vía repositorio. */
export const datosAsistente = cacheConVigencia(async (): Promise<DatosAsistente> => {
  const repo = getRepository();
  const [mercados, productores, eventos, rutas, lealtad, enLinea] = await Promise.all([
    repo.mercados(),
    repo.productores(),
    repo.eventos(),
    repo.rutas(),
    repo.lealtad(),
    repo.puestosEnLinea(),
  ]);
  const puestos = enLinea.map(({ puesto, mercado }) => ({ ...puesto, mercadoId: mercado.id }));
  return { mercados, puestos, productores, eventos, rutas, lealtad };
}, VIGENCIA_DATOS_MS);
