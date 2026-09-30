/** Vistas del locatario (M13–M16). Puros y con tests. */

export const LIMITE_CATALOGO_GRATIS = 20;
export type PlanLocatario = "Gratis" | "Pro" | "Plus";

export type KpisBase = { ventas_mxn: number; pedidos_app: number; cobros_qr: number; checkins_efectivo: number; ticket_promedio: number };

/**
 * KPIs de hoy = los de usuarios_demo + lo que pasó en la demo (cobros, pedidos nuevos de la app, check-ins).
 * El ticket promedio se recalcula con las transacciones implícitas de la base (ventas / ticket).
 */
export function kpisHoy(base: KpisBase, extra: { cobros: number[]; pedidosApp: number[]; checkins: number }) {
  const sumaCobros = extra.cobros.reduce((a, b) => a + b, 0);
  const sumaPedidos = extra.pedidosApp.reduce((a, b) => a + b, 0);
  const ventas = base.ventas_mxn + sumaCobros + sumaPedidos;
  const txBase = base.ticket_promedio ? base.ventas_mxn / base.ticket_promedio : 0;
  const tx = txBase + extra.cobros.length + extra.pedidosApp.length;
  return {
    ventas_mxn: ventas,
    pedidos_app: base.pedidos_app + extra.pedidosApp.length,
    cobros_qr: base.cobros_qr + extra.cobros.length,
    checkins_efectivo: base.checkins_efectivo + extra.checkins,
    ticket_promedio: tx ? Math.round(ventas / tx) : 0,
  };
}

/** «buenos días» antes de las 12, «buenas tardes» hasta las 19, luego «buenas noches» (hora CDMX). */
export function saludoPorHora(now = new Date()): "dias" | "tardes" | "noches" {
  const h = Number(now.toLocaleTimeString("en-US", { timeZone: "America/Mexico_City", hour: "2-digit", hourCycle: "h23" }));
  return h < 12 ? "dias" : h < 19 ? "tardes" : "noches";
}

/** Índice del día de la semana en la serie «Lun…Dom» de usuarios_demo (0 = Lun). */
export function indiceSemana(now = new Date()): number {
  const d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(now.toLocaleDateString("en-US", { timeZone: "America/Mexico_City", weekday: "short" }));
  return (d + 6) % 7;
}

/** Suma lo vendido hoy a la barra del día actual. */
export function semanaConHoy<T extends { d: string; v: number }>(semana: T[], extraHoy: number, now = new Date()): T[] {
  const i = indiceSemana(now);
  return semana.map((x, j) => (j === i ? { ...x, v: x.v + extraHoy } : x));
}

// ---------- pedidos del locatario ----------

export const ESTADOS_LOCATARIO = ["nuevo", "preparando", "listo", "entregado"] as const;
export type EstadoLocatario = (typeof ESTADOS_LOCATARIO)[number];

export function siguienteEstadoLocatario(e: EstadoLocatario | undefined): EstadoLocatario {
  const i = ESTADOS_LOCATARIO.indexOf(e ?? "nuevo");
  return ESTADOS_LOCATARIO[Math.min(i + 1, ESTADOS_LOCATARIO.length - 1)];
}

// ---------- catálogo ----------

export function puedeAgregarProducto(total: number, plan: PlanLocatario): boolean {
  return plan !== "Gratis" || total < LIMITE_CATALOGO_GRATIS;
}

// ---------- teclado de cobro ----------

/** Aplica una tecla al monto (enteros MXN, máx. 6 dígitos). «⌫» borra, «C» limpia. */
export function teclear(monto: string, tecla: string): string {
  if (tecla === "C") return "";
  if (tecla === "⌫") return monto.slice(0, -1);
  if (!/^\d$/.test(tecla)) return monto;
  if (!monto && tecla === "0") return "";
  return (monto + tecla).slice(0, 6);
}

export type ItemCatalogo = { n: string; p: number; u: string; disponible?: boolean; origen?: string; fotoUrl?: string };

/** Catálogo visible: el del puesto + lo agregado, con precio y disponibilidad editados. */
export function catalogoEfectivo(base: ItemCatalogo[], extra: ItemCatalogo[], ediciones: Record<string, { p?: number; disponible?: boolean }> = {}) {
  return [...base, ...extra].map((x) => {
    const e = ediciones[x.n] ?? {};
    return { ...x, p: e.p ?? x.p, disponible: e.disponible ?? x.disponible ?? true, extra: extra.includes(x) };
  });
}
