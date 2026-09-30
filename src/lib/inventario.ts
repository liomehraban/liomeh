/**
 * Inventario vivo (simulado): cada producto amanece surtido, se va vendiendo durante el día
 * (curva de ventas del mercado, hora CDMX) y se resurte al día siguiente. A eso se le restan las
 * compras que hizo la persona en esta demo. Determinista por (producto, día, hora): todos ven lo mismo.
 */
import { azar, hashTexto } from "./catalogo-simulado";
import { hoyCDMX } from "./eventos";
import { ahoraCDMX } from "./horario";

export type EstadoStock = "surtido" | "ok" | "pocas" | "agotado";
export type Stock = { inicial: number; disponible: number; estado: EstadoStock };

export const claveProducto = (puestoId: string, producto: string) => `${puestoId}::${producto}`;
/** Clave de lo vendido por la persona hoy: `AAAA-MM-DD|puesto::producto`. */
export const claveVenta = (dia: string, puestoId: string, producto: string) => `${dia}|${claveProducto(puestoId, producto)}`;

/** Existencia con la que amanece un producto (depende de su unidad y precio). */
export function stockInicial(puestoId: string, producto: { n: string; p: number; u: string }, dia: string): number {
  const r = azar(hashTexto(`${claveProducto(puestoId, producto.n)}|${dia}`));
  const u = producto.u.toLowerCase();
  if (producto.p >= 900) return r.entero(2, 8);
  if (producto.p >= 300) return r.entero(4, 15);
  if (u.includes("caja") || u.includes("bulto")) return r.entero(12, 60);
  if (u === "kg" || u === "l") return r.entero(15, 80);
  if (["plato", "menú", "vaso", "vaso 1/2 l"].includes(u)) return r.entero(25, 90);
  return r.entero(10, 60);
}

const APERTURA = 7 * 60;
const CIERRE = 18 * 60;

/** Fracción de la venta del día ya realizada a esta hora (curva en S, 0 antes de abrir, 1 al cierre). */
export function avanceDelDia(minutos: number): number {
  if (minutos <= APERTURA) return 0;
  if (minutos >= CIERRE) return 1;
  const x = (minutos - APERTURA) / (CIERRE - APERTURA);
  return x * x * (3 - 2 * x);
}

export type OpcionesStock = {
  /** Lo que compró la persona hoy de este producto. */
  vendidosDemo?: number;
  /** El locatario lo marcó como no disponible. */
  pausado?: boolean;
  /** Puestos reales de la guía (y del guion de demo): la simulación nunca los agota. */
  protegido?: boolean;
};

/** Existencia actual del producto a esta hora. */
export function stockActual(puestoId: string, producto: { n: string; p: number; u: string }, now = new Date(), o: OpcionesStock = {}): Stock {
  const { vendidosDemo = 0, pausado = false, protegido = false } = o;
  const dia = hoyCDMX(now);
  const inicial = stockInicial(puestoId, producto, dia);
  if (pausado) return { inicial, disponible: 0, estado: "agotado" };
  const r = azar(hashTexto(`venta|${claveProducto(puestoId, producto.n)}|${dia}`));
  // Se vende entre 45 % y 95 % de lo surtido; ~6 % de los productos se acaba en el día.
  const seAcaba = !protegido && r.sig() < 0.06;
  const venta = seAcaba ? 1 : protegido ? 0.3 + r.sig() * 0.4 : 0.45 + r.sig() * 0.5;
  const { minutos } = ahoraCDMX(now);
  const vendido = Math.floor(inicial * venta * avanceDelDia(minutos));
  const disponible = Math.max(0, inicial - vendido - vendidosDemo);
  const estado: EstadoStock =
    disponible === 0 ? "agotado" : disponible <= Math.max(3, Math.ceil(inicial * 0.12)) ? "pocas" : minutos < 10 * 60 && vendido === 0 ? "surtido" : "ok";
  return { inicial, disponible, estado };
}

/**
 * Actividad del puesto hoy (pedidos por la app y minutos desde el último), para que se sienta vivo.
 * Después del cierre ya no hay «último pedido»: solo el total del día.
 */
export function actividadPuesto(puestoId: string, now = new Date()): { pedidosHoy: number; hace: number | null } {
  const dia = hoyCDMX(now);
  const r = azar(hashTexto(`actividad|${puestoId}|${dia}`));
  const { minutos } = ahoraCDMX(now);
  const pedidosHoy = Math.round(r.entero(8, 45) * avanceDelDia(minutos));
  if (pedidosHoy === 0 || minutos >= CIERRE) return { pedidosHoy, hace: null };
  // El último pedido fue hace 1–25 min (cambia cada 5 min).
  const r2 = azar(hashTexto(`${puestoId}|${dia}|${Math.floor(minutos / 5)}`));
  return { pedidosHoy, hace: Math.min(minutos - APERTURA, r2.entero(1, 25)) };
}

/** «plato» → «platos», «vaso 1/2 L» → «vasos 1/2 L»; kg, L y g no cambian. */
export function unidadPlural(u: string, n: number): string {
  if (n === 1 || /^(kg|l|g|ml)$/i.test(u)) return u;
  const [primera, ...resto] = u.split(" ");
  const plural = /[aeiouáéíóú]$/i.test(primera) ? `${primera}s` : `${primera}es`;
  return [plural.replace(/ú(s)$/, "ús"), ...resto].join(" ");
}
