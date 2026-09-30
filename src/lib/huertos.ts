/** Huertos del suelo de conservación (M6). Puros y con tests. */
import type { Productor, ZonaHuerto } from "./schemas";

/** `poligono_ilustrativo` viene como [lat, lng][]: se invierte a [lng, lat] y se cierra el anillo (GeoJSON). */
export function anilloGeoJSON(poligono: ZonaHuerto["poligono_ilustrativo"]): [number, number][] {
  const ring = poligono.map(([lat, lng]) => [lng, lat] as [number, number]);
  const [a, z] = [ring[0], ring.at(-1)];
  if (a && z && (a[0] !== z[0] || a[1] !== z[1])) ring.push([a[0], a[1]]);
  return ring;
}

// ---------- «De temporada ahora» ----------

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function mesesEnRango(a: number, b: number): number[] {
  const out = [a];
  for (let m = a; m !== b; m = (m + 1) % 12) out.push((m + 1) % 12);
  return out;
}

/**
 * Meses (0 = enero) que cubre un texto de temporada. Heurística con los nombres de los meses:
 * «Todo el año» → los 12; «nov–ene» → nov, dic, ene; «oct» → oct; «Semana Santa» → mar, abr.
 */
export function mesesDeTemporada(texto: string): number[] {
  const t = norm(texto);
  if (t.includes("todo el ano")) return MESES.map((_, i) => i);
  const meses = new Set<number>();
  if (t.includes("semana santa")) [2, 3].forEach((m) => meses.add(m));
  const re = new RegExp(`(${MESES.join("|")})[a-z]*(?:\\s*[–-]\\s*(${MESES.join("|")})[a-z]*)?`, "g");
  for (const m of t.matchAll(re)) {
    const a = MESES.indexOf(m[1]);
    const b = m[2] ? MESES.indexOf(m[2]) : a;
    mesesEnRango(a, b).forEach((x) => meses.add(x));
  }
  return [...meses].sort((a, b) => a - b);
}

/** Mes actual en la CDMX (0 = enero). */
export const mesCDMX = (now = new Date()) =>
  Number(now.toLocaleDateString("en-US", { timeZone: "America/Mexico_City", month: "numeric" })) - 1;

export const deTemporada = (temporada: string, mes: number) => mesesDeTemporada(temporada).includes(mes);

// ---------- chips de cultivo ----------

export const CULTIVOS = ["nopal", "maiz", "hortalizas", "amaranto", "flores", "hongos"] as const;
export type Cultivo = (typeof CULTIVOS)[number];

const REGLAS: Record<Cultivo, RegExp> = {
  nopal: /nopal|xoconostle/,
  maiz: /maiz/,
  hortalizas: /lechuga|acelga|verdolaga|brocoli|coliflor|espinaca|apio|hortaliza|romerito|cilantro|flor de calabaza/,
  amaranto: /amaranto|alegria/,
  flores: /nochebuena|cempasuchil|suculenta|planta/,
  hongos: /hongo/,
};

export function cultivosDe(p: Pick<Productor, "producto_principal" | "catalogo">): Cultivo[] {
  const texto = norm([p.producto_principal, ...p.catalogo].join(" "));
  return CULTIVOS.filter((c) => REGLAS[c].test(texto));
}

export type FiltroHuertos = { cultivos: Cultivo[]; temporada: boolean };

/** Cultivos con OR entre sí; «De temporada ahora» con AND. */
export function filtrarProductores<T extends Pick<Productor, "producto_principal" | "catalogo" | "temporada">>(ps: T[], f: FiltroHuertos, mes: number): T[] {
  return ps.filter((p) => (!f.cultivos.length || cultivosDe(p).some((c) => f.cultivos.includes(c))) && (!f.temporada || deTemporada(p.temporada, mes)));
}

/** Unidad de venta al mayoreo en el carrito: «Nopal verdura (ciento)». */
export const nombreMayoreo = (p: Pick<Productor, "producto_principal" | "precio_mayoreo_app">) => `${p.producto_principal} (${p.precio_mayoreo_app.unidad})`;

/** Los próximos `n` días (ISO, hora CDMX) a partir de mañana, para reservar visitas. */
export function proximosDias(n: number, now = new Date()): string[] {
  const base = new Date(`${now.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" })}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) => new Date(base.getTime() + (i + 1) * 86_400_000).toISOString().slice(0, 10));
}

/**
 * Cantidad mínima de compra al mayoreo en la unidad del precio. «10 kg» con precio por kg → 10;
 * si la venta mínima viene en otra unidad (p. ej. «1 caja» y precio por kg), no se puede convertir → 1.
 */
export function minimoMayoreo(ventaMinima: string, unidadPrecio: string): number {
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*(.+?)\s*$/.exec(ventaMinima);
  if (!m) return 1;
  const n = Number(m[1].replace(",", "."));
  return m[2].toLowerCase() === unidadPrecio.toLowerCase() && n > 0 ? Math.ceil(n) : 1;
}
