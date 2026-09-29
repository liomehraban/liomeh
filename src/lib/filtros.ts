/** Filtros del mapa de la ciudad (M1). Puros: reciben la hora para poder probarse. */
import { estadoHorario } from "./horario";
import { categoriaGiro, type CategoriaGiro } from "./giros";
import type { Horario } from "./schemas";

export const CHIPS = ["abierto", "destacados", "comida", "flores", "artesanias", "pescados", "mayoreo"] as const;
export type Chip = (typeof CHIPS)[number];
const CHIPS_GIRO: Chip[] = ["comida", "flores", "artesanias", "pescados", "mayoreo"];

export type FiltrosMapa = { chips: Chip[]; alcaldias: string[]; tipos: string[] };
export const FILTROS_VACIOS: FiltrosMapa = { chips: [], alcaldias: [], tipos: [] };

type MercadoFiltrable = { alcaldia: string; tipos: string[]; giros: string[]; destacado: boolean; horario?: Horario };

export function categoriasDe(m: Pick<MercadoFiltrable, "giros" | "tipos">): Set<CategoriaGiro> {
  const s = new Set(m.giros.map(categoriaGiro));
  if (m.tipos.includes("mayorista")) s.add("mayoreo");
  return s;
}

/**
 * - «Abierto ahora» usa estadoHorario() y excluye mercados sin horario.
 * - Los chips de giro se combinan con OR entre sí; todo lo demás con AND.
 */
export function filtrarMercados<T extends MercadoFiltrable>(mercados: T[], f: FiltrosMapa, now = new Date()): T[] {
  const giros = f.chips.filter((c) => CHIPS_GIRO.includes(c)) as CategoriaGiro[];
  return mercados.filter((m) => {
    if (f.chips.includes("abierto") && estadoHorario(m.horario, now).estado !== "abierto") return false;
    if (f.chips.includes("destacados") && !m.destacado) return false;
    if (f.alcaldias.length && !f.alcaldias.includes(m.alcaldia)) return false;
    if (f.tipos.length && !m.tipos.some((t) => f.tipos.includes(t))) return false;
    if (giros.length) {
      const cats = categoriasDe(m);
      if (!giros.some((g) => cats.has(g))) return false;
    }
    return true;
  });
}

export function cuantosFiltros(f: FiltrosMapa): number {
  return f.chips.length + f.alcaldias.length + f.tipos.length;
}
