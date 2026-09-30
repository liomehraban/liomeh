/** M19 · Panel de gobierno: cálculos puros sobre metricas_gobierno.json. */
import type { MetricasGobierno } from "./schemas";

type Alcaldia = MetricasGobierno["por_alcaldia"][number];

/** Rampa secuencial (un solo tono, claro → oscuro) para la adopción por alcaldía. */
export const RAMPA_ADOPCION = ["#EBD5E9", "#D3A5CF", "#B470AF", "#9B2694", "#5E2A5B"] as const;
/** Cortes superiores de cada paso (el último es abierto). */
export const CORTES_ADOPCION = [0.2, 0.35, 0.5, 0.65] as const;

export function adopcion(a: Pick<Alcaldia, "mercados" | "mercados_activos_en_app">): number {
  return a.mercados > 0 ? a.mercados_activos_en_app / a.mercados : 0;
}

export function pasoAdopcion(ratio: number): number {
  const i = CORTES_ADOPCION.findIndex((c) => ratio < c);
  return i === -1 ? CORTES_ADOPCION.length : i;
}

export function colorAdopcion(ratio: number): string {
  return RAMPA_ADOPCION[pasoAdopcion(ratio)];
}

/** Normaliza para cruzar «Cuauhtémoc» de mercados.json con el de metricas (mayúsculas/acentos). */
export const claveAlcaldia = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function mapaAdopcion(por: Alcaldia[]): Map<string, number> {
  return new Map(por.map((a) => [claveAlcaldia(a.alcaldia), adopcion(a)]));
}

/** Toneladas rescatadas: la cifra del piloto más lo rescatado en esta demo (kg del store). */
export function toneladasRescatadas(baseTon: number, kgDemo: number): number {
  return Math.round((baseTon + kgDemo / 1000) * 1000) / 1000;
}

/** Ordena por ventas (desc) para las barras. */
export function alcaldiasPorVentas(por: Alcaldia[]): Alcaldia[] {
  return [...por].sort((a, b) => b.ventas_mes_mxn - a.ventas_mes_mxn);
}

const celda = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const fila = (xs: (string | number)[]) => xs.map(celda).join(",");

/** CSV con las cuatro tablas del panel, separadas por una línea en blanco. Incluye BOM para Excel. */
export function csvMetricas(m: MetricasGobierno, nombres: Record<string, string> = {}): string {
  const bloques: string[][] = [];
  bloques.push([fila(["# nota", m.nota]), fila(["kpi", "valor"]), ...Object.entries(m.kpis_hoy).map(([k, v]) => fila([k, v]))]);
  const colsA = ["alcaldia", "mercados", "mercados_activos_en_app", "adopcion_pct", "locatarios_activos", "ventas_mes_mxn", "visitas_turistas_mes"];
  bloques.push([
    fila(colsA),
    ...m.por_alcaldia.map((a) => fila([a.alcaldia, a.mercados, a.mercados_activos_en_app, Math.round(adopcion(a) * 100), a.locatarios_activos, a.ventas_mes_mxn, a.visitas_turistas_mes])),
  ]);
  const colsS = Object.keys(m.serie_mensual[0] ?? {}) as (keyof MetricasGobierno["serie_mensual"][number])[];
  bloques.push([fila(colsS), ...m.serie_mensual.map((s) => fila(colsS.map((c) => s[c])))]);
  bloques.push([fila(["mercado_id", "mercado", "visitas_mes"]), ...m.top_mercados.map((t) => fila([t.id, nombres[t.id] ?? t.id, t.visitas_mes]))]);
  return "﻿" + bloques.map((b) => b.join("\n")).join("\n\n") + "\n";
}
