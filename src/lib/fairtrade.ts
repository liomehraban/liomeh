/** Precio justo del huerto a tu mesa (M7). Todos los valores salen de `comercio_justo`. */
import type { Productor } from "./schemas";

export type PrecioJusto = {
  precio: number;
  unidad: string;
  recibe: number;
  antes: number;
  pctApp: number;
  pctIntermediarios: number;
  mejoraPct: number;
  /** true cuando mejora_pct ≥ 95: el copy dice «el doble». */
  esDoble: boolean;
};

export function precioJusto(p: Pick<Productor, "comercio_justo">): PrecioJusto {
  const c = p.comercio_justo;
  return {
    precio: c.precio_consumidor_final,
    unidad: c.unidad,
    recibe: c.productor_recibe_con_app,
    antes: c.productor_recibia_con_intermediarios,
    pctApp: c.participacion_productor_pct_app,
    pctIntermediarios: c.participacion_productor_pct_intermediarios,
    mejoraPct: c.mejora_pct,
    esDoble: c.mejora_pct >= 95,
  };
}

/** Nombre corto del producto para el copy: «Nopal verdura» → «nopal», «Hortalizas de chinampa» → «hortalizas de chinampa». */
export function productoCorto(principal: string): string {
  const p = principal.toLowerCase();
  if (p.startsWith("nopal")) return "nopal";
  return p.split(" y ")[0];
}
