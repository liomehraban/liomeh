/**
 * «Abierto ahora» en hora de la CDMX. Implementación de referencia.
 * Horario.dias: 0 = domingo … 6 = sábado. cierra "23:59" + abre "00:00" = 24 h.
 * Soporta horarios que cruzan medianoche (abre > cierra).
 */
import type { Horario } from "./schemas";

const TZ = "America/Mexico_City";

export function ahoraCDMX(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { dia, minutos: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

export type EstadoHorario =
  | { estado: "desconocido" }
  | { estado: "abierto"; cierraEn: number; es24h: boolean }
  | { estado: "cerrado"; abreDia: number; abre: string };

export function estadoHorario(h: Horario | undefined, now = new Date()): EstadoHorario {
  if (!h) return { estado: "desconocido" };
  const { dia, minutos } = ahoraCDMX(now);
  const a = toMin(h.abre), c = toMin(h.cierra);
  const es24h = a === 0 && c >= 23 * 60 + 59;
  if (es24h && h.dias.includes(dia)) return { estado: "abierto", cierraEn: Infinity, es24h: true };
  const cruza = c < a;
  const abiertoHoy = h.dias.includes(dia) && (cruza ? minutos >= a : minutos >= a && minutos < c);
  const abiertoAyer = cruza && h.dias.includes((dia + 6) % 7) && minutos < c;
  if (abiertoHoy || abiertoAyer) {
    const cierraEn = abiertoHoy && cruza ? 24 * 60 - minutos + c : c - minutos;
    return { estado: "abierto", cierraEn, es24h: false };
  }
  for (let k = 0; k < 8; k++) {
    const d = (dia + k) % 7;
    if (h.dias.includes(d) && (k > 0 || minutos < a)) return { estado: "cerrado", abreDia: d, abre: h.abre };
  }
  return { estado: "desconocido" };
}

export const abiertoAhora = (h: Horario | undefined, now = new Date()) => estadoHorario(h, now).estado === "abierto";
