import type { DatosAsistente } from "@/lib/assistant/types";
import { getRepository } from "./repository";

let cache: Promise<DatosAsistente> | null = null;

/** Datos que usa el asistente (fallback y contexto del modelo), vía repositorio. */
export function datosAsistente(): Promise<DatosAsistente> {
  cache ??= (async () => {
    const repo = getRepository();
    const [mercados, productores, eventos, rutas, lealtad] = await Promise.all([repo.mercados(), repo.productores(), repo.eventos(), repo.rutas(), repo.lealtad()]);
    const puestos = [];
    for (const m of mercados.filter((x) => x.interior_disponible)) {
      const i = await repo.interior(m.id);
      if (i) puestos.push(...i.puestos.map((p) => ({ ...p, mercadoId: m.id })));
    }
    return { mercados, puestos, productores, eventos, rutas, lealtad };
  })();
  return cache;
}
