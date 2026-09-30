/** Pasaporte de Mercados: puntos y niveles (data/lealtad.json). */
import type { Lealtad } from "./schemas";

export const PUNTOS_CHECKIN = 10;
export const PUNTOS_PRIMER_CHECKIN_MERCADO = 50;
export const PUNTOS_RESENA_FOTO = 15;

/** 1 punto por cada $10 del total; dobles si compra directo a un huerto o con Mercado+. */
export function puntosPorCompra(total: number, { dobles = false } = {}): number {
  const base = Math.floor(Math.max(0, total) / 10);
  return dobles ? base * 2 : base;
}

export type Nivel = Lealtad["niveles"][number];

export function nivelActual(puntos: number, niveles: Nivel[]): Nivel {
  const orden = [...niveles].sort((a, b) => a.desde - b.desde);
  return orden.filter((n) => puntos >= n.desde).at(-1) ?? orden[0];
}

/** Avance hacia el siguiente nivel (pct 0–100). En el último nivel, siguiente = null y pct = 100. */
export function progreso(puntos: number, niveles: Nivel[]) {
  const orden = [...niveles].sort((a, b) => a.desde - b.desde);
  const actual = nivelActual(puntos, orden);
  const siguiente = orden.find((n) => n.desde > puntos) ?? null;
  if (!siguiente) return { actual, siguiente, faltan: 0, pct: 100 };
  const pct = Math.round(((puntos - actual.desde) / (siguiente.desde - actual.desde)) * 100);
  return { actual, siguiente, faltan: siguiente.desde - puntos, pct };
}

// ---------- Check-in QR (M9) ----------

export type Checkin = {
  /** puestoId, o «mercado:<id>» para el mostrador general de un mercado sin puestos en línea. */
  objetivo: string;
  mercadoId: string;
  fecha: string;
};

export type ResultadoCheckin =
  | { ok: false; motivo: "yaHoy" }
  | { ok: true; puntos: number; selloNuevo: boolean; checkin: Checkin };

const diaCDMX = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });

/**
 * +10 puntos, máximo 1 por objetivo al día (día en CDMX).
 * Si aún no tiene el sello de ese mercado: +50 y sello nuevo.
 */
export function evaluarCheckin(
  estado: { checkins: Checkin[]; sellos: string[] },
  objetivo: string,
  mercadoId: string,
  now = new Date(),
): ResultadoCheckin {
  const hoy = diaCDMX(now);
  if (estado.checkins.some((c) => c.objetivo === objetivo && diaCDMX(new Date(c.fecha)) === hoy)) return { ok: false, motivo: "yaHoy" };
  const selloNuevo = !estado.sellos.includes(mercadoId);
  return {
    ok: true,
    puntos: PUNTOS_CHECKIN + (selloNuevo ? PUNTOS_PRIMER_CHECKIN_MERCADO : 0),
    selloNuevo,
    checkin: { objetivo, mercadoId, fecha: now.toISOString() },
  };
}

// ---------- Insignias ----------

export type ContextoInsignias = {
  mercados: Record<string, { alcaldia: string; colonia: string; lat: number; lng: number }>;
  productores: Record<string, { alcaldia: string }>;
};

export type EstadoInsignias = {
  sellos: string[];
  checkins: Checkin[];
  /** Ids de productor (huertoId) de lo comprado. */
  huertosComprados: string[];
};

const ZOCALO = { lat: 19.4326, lng: -99.1332 };
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = (g: number) => (g * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

/** Centro Histórico: colonia «Centro» en Cuauhtémoc o V. Carranza, o a menos de 1.8 km del Zócalo. */
export function esCentroHistorico(m: { alcaldia: string; colonia: string; lat: number; lng: number }): boolean {
  if (!["Cuauhtémoc", "Venustiano Carranza"].includes(m.alcaldia)) return false;
  return /centro/i.test(m.colonia) || km(m, ZOCALO) < 1.8;
}

/** Mercados visitados: sellos + check-ins. */
const visitados = (e: EstadoInsignias) => new Set([...e.sellos, ...e.checkins.map((c) => c.mercadoId)]);

/** Reglas de data/lealtad.json › insignias. Devuelve los ids desbloqueados. */
export function evaluarInsignias(e: EstadoInsignias, ctx: ContextoInsignias): string[] {
  const out: string[] = [];
  const vis = [...visitados(e)].map((id) => ctx.mercados[id]).filter(Boolean);

  // centro: 5 mercados del Centro Histórico
  if (vis.filter(esCentroHistorico).length >= 5) out.push("centro");

  // chinampero: compra en 2 huertos de Xochimilco o Tláhuac
  const chinamperos = new Set(e.huertosComprados.filter((h) => ["Xochimilco", "Tláhuac"].includes(ctx.productores[h]?.alcaldia ?? "")));
  if (chinamperos.size >= 2) out.push("chinampero");

  // madrugador: check-in en la CEDA antes de las 7:00 (hora CDMX)
  const hora = (iso: string) => Number(new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/Mexico_City", hour: "2-digit", hourCycle: "h23" }));
  if (e.checkins.some((c) => c.mercadoId === "central-de-abasto" && hora(c.fecha) < 7)) out.push("madrugador");

  // 16: un mercado en cada alcaldía
  if (new Set(vis.map((m) => m.alcaldia)).size >= 16) out.push("16");

  // antojo: huarache en Río Blanco + pancita en La Merced + carnitas en Jamaica (check-ins)
  const ci = new Set(e.checkins.map((c) => c.objetivo));
  const enMercado = (id: string) => e.checkins.some((c) => c.mercadoId === id);
  if (enMercado("53-rio-blanco") && ci.has("pancita-dona-chela") && enMercado("65-jamaica-comidas")) out.push("antojo");

  return out;
}

// ---------- Recompensas ----------

export type Cupon = { id: string; recompensaId: string; titulo: string; puntos: number; codigo: string; fecha: string };

export function puedeCanjear(puntos: number, costo: number) {
  return puntos >= costo;
}

export function nuevoCupon(r: { id: string; titulo: string; puntos: number }, rnd: () => number = Math.random, now = new Date()): Cupon {
  const codigo = `PSL-${r.id.toUpperCase().slice(0, 4)}-${Math.floor(100000 + rnd() * 900000)}`;
  return { id: codigo, recompensaId: r.id, titulo: r.titulo, puntos: r.puntos, codigo, fecha: now.toISOString() };
}
