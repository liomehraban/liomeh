/**
 * Ofertas de «Rescata hoy» (M20). Se generan desde puestos de La Merced (productos y precios del catálogo)
 * y dos lotes simulados de la CEDA y del Mercado de Jamaica, que no tienen puestos en línea.
 */
import { precioRescate, type OfertaRescate } from "@/lib/rescate";
import { getRepository } from "./repository";

const CIERRE_DEFAULT = "18:00";

export async function ofertasRescate(): Promise<OfertaRescate[]> {
  const repo = getRepository();
  const [merced, interior, ceda, jamaica] = await Promise.all([
    repo.mercado("la-merced"),
    repo.interior("la-merced"),
    repo.mercado("central-de-abasto"),
    repo.mercado("235-jamaica-nuevo"),
  ]);
  const vence = (h?: { abre: string; cierra: string }) => (!h || (h.abre === "00:00" && h.cierra >= "23:59") ? CIERRE_DEFAULT : h.cierra);
  const out: OfertaRescate[] = [];

  if (merced && interior) {
    const frutas = interior.puestos.filter((p) => p.giro === "Frutas y verduras");
    for (const p of [frutas[1], frutas[frutas.length - 1]].filter(Boolean)) {
      const x = p.productos.find((y) => y.u === "kg") ?? p.productos[0];
      const cantidad = 2;
      out.push({
        id: `rescate-${p.id}`,
        mercadoId: merced.id,
        mercadoNombre: merced.nombre_display,
        puestoId: p.id,
        producto: `${x.n} (${p.nombre})`,
        unidad: x.u,
        cantidad,
        precioOriginal: x.p * cantidad,
        precio: precioRescate(x.p * cantidad),
        kg: x.u === "kg" ? cantidad : 1,
        vence: vence(merced.horario),
        giro: p.giro,
      });
    }
  }
  // Lotes simulados (sin puestos en línea en estos mercados).
  if (ceda) {
    out.push({ id: "rescate-ceda-caja", mercadoId: ceda.id, mercadoNombre: ceda.nombre_display, producto: "Caja surtida de frutas y legumbres", unidad: "caja", cantidad: 1, precioOriginal: 180, precio: precioRescate(180), kg: 10, vence: vence(ceda.horario), giro: "frutas y legumbres" });
  }
  if (jamaica) {
    out.push({ id: "rescate-jamaica-flores", mercadoId: jamaica.id, mercadoNombre: jamaica.nombre_display, producto: "Ramo de flores del día", unidad: "ramo", cantidad: 1, precioOriginal: 120, precio: precioRescate(120), kg: 1.5, vence: vence(jamaica.horario), giro: "flores" });
  }
  return out;
}
