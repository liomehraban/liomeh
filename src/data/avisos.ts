/** Datos de apoyo para las notificaciones simuladas (vía repositorio). Pequeños: viajan en el layout. */
import type { DatosAvisos } from "@/lib/notificaciones";
import { getRepository } from "./repository";
import { ofertasRescate } from "./rescate";

let cache: Promise<DatosAvisos> | null = null;

export function datosAvisos(): Promise<DatosAvisos> {
  cache ??= (async () => {
    const repo = getRepository();
    const [demo, eventos, metricas, ofertas] = await Promise.all([repo.demo(), repo.eventos(), repo.metricas(), ofertasRescate()]);
    const [puestoDemo, productor] = await Promise.all([repo.puesto(demo.locatario.puesto_id), repo.productor(demo.productor.productor_id)]);

    // «Recién surtido»: frutas y verduras de los mercados más visitados.
    const surtidos: DatosAvisos["surtidos"] = [];
    for (const { id } of metricas.top_mercados) {
      const m = await repo.mercado(id);
      if (!m) continue;
      const p = (await repo.puestosDeMercado(id)).find((x) => /frutas/i.test(x.giro));
      if (p) surtidos.push({ puestoId: p.id, puesto: p.nombre, mercado: m.nombre_display, producto: p.productos[0].n });
    }

    const mes = metricas.serie_mensual.find((s) => s.gmv_mxn >= metricas.kpis_hoy.derrama_digital_mes_mxn) ?? metricas.serie_mensual.at(-1)!;
    return {
      eventos: eventos.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.inicio)).map((e) => ({ id: e.id, titulo: e.titulo, inicio: e.inicio, fin: e.fin ?? null })),
      ofertas: ofertas.slice(0, 6).map((o) => ({ id: o.id, producto: o.producto, producto_en: o.producto_en, mercadoNombre: o.mercadoNombre, precio: o.precio, precioOriginal: o.precioOriginal, unidad: o.unidad })),
      surtidos,
      puestoDemo: { id: puestoDemo?.id ?? demo.locatario.puesto_id, nombre: puestoDemo?.nombre ?? "", productos: puestoDemo?.productos ?? [] },
      productor: { nombre: productor?.nombre ?? "", catalogo: productor?.catalogo ?? [] },
      impacto: {
        transaccionesDia: Math.round(metricas.kpis_hoy.transacciones_mes / 30),
        checkinsDia: Math.round(mes.checkins_efectivo / 30),
        kgRescatadosDia: Math.round((metricas.kpis_hoy.alimento_rescatado_mes_ton * 1000) / 30),
      },
    };
  })();
  return cache;
}
