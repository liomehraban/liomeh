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
