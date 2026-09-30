import type { Evento } from "./schemas";

export type EstadoEvento = "en curso" | "proximo" | "pasado" | "siempre";

/** Fecha ISO (YYYY-MM-DD) en hora de la CDMX. */
export function hoyCDMX(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
}

/** «En curso» si hoy cae entre inicio y fin; «Próximo» si es futuro; recurrente = siempre. */
export function estadoEvento(e: Pick<Evento, "inicio" | "fin">, now = new Date()): EstadoEvento {
  if (e.inicio === "recurrente") return "siempre";
  const hoy = hoyCDMX(now);
  const fin = e.fin ?? e.inicio;
  if (fin < hoy) return "pasado";
  if (e.inicio > hoy) return "proximo";
  return "en curso";
}

/** Vigentes (no pasados), ordenados por inicio; los recurrentes al final. */
export function eventosVigentes<T extends Pick<Evento, "inicio" | "fin">>(eventos: T[], now = new Date()): T[] {
  return eventos
    .filter((e) => estadoEvento(e, now) !== "pasado")
    .sort((a, b) => (a.inicio === "recurrente" ? 1 : b.inicio === "recurrente" ? -1 : a.inicio.localeCompare(b.inicio)));
}

const fecha = (iso: string) => new Date(`${iso}T12:00:00Z`);

/** «3–25 oct», «31 oct – 2 nov», «15 dic 2026 – 6 ene 2027». */
export function formatRangoFechas(inicio: string, fin: string | null, locale = "es"): string {
  const loc = locale === "en" ? "en-US" : "es-MX";
  const f = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(loc, { timeZone: "UTC", ...opts }).format(fecha(iso)).replace(".", "");
  if (!fin || fin === inicio) return f(inicio, { day: "numeric", month: "short" });
  const [ai, mi] = inicio.split("-");
  const [af, mf] = fin.split("-");
  if (ai !== af) return `${f(inicio, { day: "numeric", month: "short", year: "numeric" })} – ${f(fin, { day: "numeric", month: "short", year: "numeric" })}`;
  if (mi === mf) {
    return locale === "en"
      ? `${f(inicio, { month: "short" })} ${Number(inicio.slice(8))}–${Number(fin.slice(8))}`
      : `${Number(inicio.slice(8))}–${Number(fin.slice(8))} ${f(inicio, { month: "short" })}`;
  }
  return `${f(inicio, { day: "numeric", month: "short" })} – ${f(fin, { day: "numeric", month: "short" })}`;
}

// ---------- Agenda (M10) ----------

export type EtiquetaEvento = "en curso" | "proximo" | "por confirmar" | "siempre";

/** «En curso» si hoy cae en el rango; si no, «Fecha por confirmar» cuando no está confirmada; si no, «Próximo». */
export function etiquetaEvento(e: Pick<Evento, "inicio" | "fin" | "fecha_confirmada">, now = new Date()): EtiquetaEvento | "pasado" {
  const est = estadoEvento(e, now);
  if (est === "pasado" || est === "siempre" || est === "en curso") return est;
  return e.fecha_confirmada ? "proximo" : "por confirmar";
}

export const CATEGORIAS_AGENDA = ["tradicion", "mercado", "feria", "ciudad", "experiencia"] as const;
export type CategoriaAgenda = (typeof CATEGORIAS_AGENDA)[number];

/** Chip de filtro de cada categoría de eventos.json («productores» cae en Feria de productores). */
export function categoriaAgenda(c: Evento["categoria"]): CategoriaAgenda {
  switch (c) {
    case "tradición":
      return "tradicion";
    case "mercado":
      return "mercado";
    case "feria productores":
    case "productores":
      return "feria";
    case "ciudad":
      return "ciudad";
    default:
      return "experiencia";
  }
}

/** Vigentes agrupados por mes «YYYY-MM»; los recurrentes van aparte («Siempre disponibles»). */
export function agruparPorMes<T extends Pick<Evento, "inicio" | "fin">>(eventos: T[], now = new Date()) {
  const vig = eventosVigentes(eventos, now);
  const hoy = hoyCDMX(now);
  const meses = new Map<string, T[]>();
  for (const e of vig.filter((x) => x.inicio !== "recurrente")) {
    // un evento en curso se agrupa en el mes actual
    const clave = (e.inicio < hoy ? hoy : e.inicio).slice(0, 7);
    meses.set(clave, [...(meses.get(clave) ?? []), e]);
  }
  return { meses: [...meses.entries()], siempre: vig.filter((x) => x.inicio === "recurrente") };
}

/** Celdas de un mes (lunes primero): null = hueco antes del día 1. */
export function celdasMes(anio: number, mes0: number): (string | null)[] {
  const primero = new Date(Date.UTC(anio, mes0, 1));
  const dias = new Date(Date.UTC(anio, mes0 + 1, 0)).getUTCDate();
  const offset = (primero.getUTCDay() + 6) % 7;
  const pad = (n: number) => String(n).padStart(2, "0");
  return [...Array(offset).fill(null), ...Array.from({ length: dias }, (_, i) => `${anio}-${pad(mes0 + 1)}-${pad(i + 1)}`)];
}

/** Eventos (no recurrentes) que ocurren en el día ISO. */
export const eventosDelDia = <T extends Pick<Evento, "inicio" | "fin">>(eventos: T[], dia: string) =>
  eventos.filter((e) => e.inicio !== "recurrente" && e.inicio <= dia && (e.fin ?? e.inicio) >= dia);

/** «hoy», «ayer», «hace 4 días», «hace 2 meses» para una fecha ISO (YYYY-MM-DD) respecto a hoy en CDMX. */
export function fechaRelativa(iso: string, now = new Date(), locale = "es"): string {
  const dias = Math.round((Date.parse(`${hoyCDMX(now)}T12:00:00Z`) - Date.parse(`${iso.slice(0, 10)}T12:00:00Z`)) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(locale === "en" ? "en" : "es", { numeric: "auto" });
  if (Math.abs(dias) < 30) return rtf.format(-dias, "day");
  if (Math.abs(dias) < 365) return rtf.format(-Math.round(dias / 30), "month");
  return rtf.format(-Math.round(dias / 365), "year");
}
