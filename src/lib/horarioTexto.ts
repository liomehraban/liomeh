import type { Horario } from "./schemas";

const ORDEN = [1, 2, 3, 4, 5, 6, 0]; // lunes primero

function nombreDia(d: number, locale: string, width: "short" | "long" = "short") {
  // 2026-10-04 fue domingo (d = 0)
  const fecha = new Date(Date.UTC(2026, 9, 4 + d, 12));
  const s = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { weekday: width, timeZone: "UTC" }).format(fecha);
  return s.charAt(0).toUpperCase() + s.slice(1).replace(".", "");
}

export function nombreDiaLargo(d: number, locale: string) {
  return nombreDia(d, locale, "long");
}

/** Días agrupados en rangos: «Lun–Dom», «Lun, Mié–Dom». */
export function rangoDias(dias: number[], locale: string): string {
  const set = new Set(dias);
  if (set.size === 7) return locale === "en" ? "Daily" : "Todos los días";
  const orden = ORDEN.filter((d) => set.has(d));
  const grupos: number[][] = [];
  for (const d of orden) {
    const g = grupos.at(-1);
    if (g && ORDEN.indexOf(d) === ORDEN.indexOf(g.at(-1)!) + 1) g.push(d);
    else grupos.push([d]);
  }
  return grupos
    .map((g) => (g.length >= 3 ? `${nombreDia(g[0], locale)}–${nombreDia(g.at(-1)!, locale)}` : g.map((d) => nombreDia(d, locale)).join(", ")))
    .join(", ");
}

/** «Todos los días · 06:30–18:00», «Daily · 24 h». */
export function describirHorario(h: Horario, locale: string): string {
  const es24 = h.abre === "00:00" && h.cierra >= "23:59";
  return `${rangoDias(h.dias, locale)} · ${es24 ? "24 h" : `${h.abre}–${h.cierra}`}`;
}

/** «2 h 15 min», «45 min». */
export function formatMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}
