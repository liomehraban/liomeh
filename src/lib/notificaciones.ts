/**
 * Notificaciones simuladas: qué aviso toca según el perfil, la hora (CDMX) y lo que ya pasó en la demo.
 * Los avisos se construyen con datos reales (/data) o con el catálogo/inventario simulado, y nunca se
 * repiten (cada uno tiene una clave única, por día cuando aplica). El texto sale de messages/*.json.
 */
import { azar } from "./catalogo-simulado";
import { hoyCDMX } from "./eventos";
import { ahoraCDMX } from "./horario";
import { avanceDelDia, stockActual, unidadPlural } from "./inventario";
import { etapaActual, etapas, type Pedido } from "./pedidos";

export type TipoAviso = "bienvenida" | "pedido" | "evento" | "rescate" | "surtido" | "checkin" | "nuevoPedido" | "stock" | "cobro" | "mayoreo" | "lote" | "impacto";

export type Aviso = {
  /** Clave única (dedupe): no se vuelve a entregar un aviso con la misma. */
  id: string;
  tipo: TipoAviso;
  /** Clave de texto en `notificaciones.avisos.<clave>.{titulo,texto}`. */
  clave: string;
  params: Record<string, string | number>;
  href?: string;
  fecha: string;
  leida: boolean;
};

export type PerfilAviso = "consumidor" | "locatario" | "productor" | "gobierno";

/** Datos de apoyo (del servidor, vía repositorio). */
export type DatosAvisos = {
  eventos: { id: string; titulo: string; inicio: string; fin: string | null }[];
  ofertas: { id: string; producto: string; mercadoNombre: string; precio: number; precioOriginal: number; unidad: string }[];
  surtidos: { puestoId: string; puesto: string; mercado: string; producto: string }[];
  puestoDemo: { id: string; nombre: string; productos: { n: string; p: number; u: string }[] };
  productor: { nombre: string; catalogo: string[] };
  impacto: { transaccionesDia: number; checkinsDia: number; kgRescatadosDia: number };
};

export type EstadoAvisos = {
  pedidos: Pick<Pedido, "folio" | "fecha" | "entrega">[];
  recordatorios: string[];
  lotes: { producto: string }[];
  entregados: string[];
};

/** Efecto en la demo que acompaña al aviso (un pedido nuevo que llega de verdad al tablero). */
export type EfectoAviso =
  | { tipo: "pedidoLocatario"; pedido: { id: string; folio: string; cliente: string; items: string; total: number; tipo: string; hora: string; estado: "nuevo" } }
  | { tipo: "pedidoMayoreo"; pedido: { id: string; folio: string; cliente: string; producto: string; cantidad: string; total: number; estado: string; estadoId: "nuevo" } }
  | { tipo: "cobro"; monto: number };

type Candidato = { peso: number; aviso: Omit<Aviso, "fecha" | "leida">; efecto?: EfectoAviso };

const CLIENTES = ["Mariana G.", "Carlos R.", "Ana Sofía P.", "Luis M.", "Fer T.", "Daniela V.", "Jorge H.", "Paola C.", "Oficina Pino Suárez", "Hostal Centro"];
const COMPRADORES = ["Fonda La Abuela (Mercado 44)", "Restaurante Roma Norte", "Frutería Doña Lupe (La Merced)", "Cocina Económica Lupita", "Taquería El Paisa", "Verduras Los Güeros (Jamaica)"];

const diasEntre = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
const horaCDMX = (now: Date) => now.toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/** Avisos por cambio de etapa de los pedidos de la persona (preparando, listo, en ruta, entregado). */
export function avisosDePedidos(pedidos: EstadoAvisos["pedidos"], now: Date, entregados: string[]): Omit<Aviso, "fecha" | "leida">[] {
  const ya = new Set(entregados);
  const out: Omit<Aviso, "fecha" | "leida">[] = [];
  for (const p of pedidos) {
    if (now.getTime() - Date.parse(p.fecha) > 3 * 3600_000) continue;
    const i = etapaActual(p, now);
    if (i === 0) continue;
    const etapa = etapas(p.entrega)[i];
    const id = `pedido:${p.folio}:${etapa}`;
    if (!ya.has(id)) out.push({ id, tipo: "pedido", clave: `pedido_${etapa.replace(" ", "_")}`, params: { folio: p.folio }, href: `/pedido/${p.folio}` });
  }
  return out;
}

/** Pedido simulado que llega al puesto de la demo. */
export function pedidoLocatarioSimulado(productos: DatosAvisos["puestoDemo"]["productos"], semilla: number, now: Date): Extract<EfectoAviso, { tipo: "pedidoLocatario" }>["pedido"] {
  const r = azar(semilla);
  const items = r.muestra(productos, r.entero(1, Math.min(3, productos.length))).map((x) => ({ ...x, q: r.entero(1, 3) }));
  const folio = `PED-${4830 + (semilla % 9000)}`;
  return {
    id: folio,
    folio,
    cliente: r.elegir(CLIENTES),
    items: items.map((x) => `${x.q} ${x.n.split(" (")[0].toLowerCase()}`).join(" + "),
    total: items.reduce((s, x) => s + x.p * x.q, 0),
    tipo: r.sig() < 0.7 ? "Recoger en puesto" : "Envío (terceros)",
    hora: horaCDMX(new Date(now.getTime() + r.entero(20, 60) * 60_000)),
    estado: "nuevo",
  };
}

/** Pedido de mayoreo simulado para la productora de la demo. */
export function pedidoMayoreoSimulado(catalogo: string[], semilla: number): Extract<EfectoAviso, { tipo: "pedidoMayoreo" }>["pedido"] {
  const r = azar(semilla);
  const producto = r.elegir(catalogo).split(" (")[0];
  const unidad = /\((pieza|manojo)/.test(catalogo.find((c) => c.startsWith(producto)) ?? "") ? "piezas" : "kg";
  const n = r.entero(3, 12) * 5;
  const folio = `MAY-${1200 + (semilla % 9000)}`;
  return { id: folio, folio, cliente: r.elegir(COMPRADORES), producto, cantidad: `${n} ${unidad}`, total: n * r.entero(10, 22), estado: "Nuevo", estadoId: "nuevo" };
}

function candidatos(perfil: PerfilAviso, d: DatosAvisos, e: EstadoAvisos, now: Date, semilla: number): Candidato[] {
  const dia = hoyCDMX(now);
  const { minutos } = ahoraCDMX(now);
  const r = azar(semilla);
  const c: Candidato[] = [];
  if (perfil === "consumidor") {
    for (const ev of d.eventos) {
      const fin = ev.fin ?? ev.inicio;
      if (fin < dia) continue;
      const faltan = diasEntre(dia, ev.inicio);
      if (e.recordatorios.includes(ev.id) && faltan <= 7)
        c.push({ peso: 4, aviso: { id: `evento:${ev.id}:${dia}`, tipo: "evento", clave: faltan <= 0 ? "eventoHoy" : "eventoPronto", params: { titulo: ev.titulo, dias: Math.max(0, faltan) }, href: "/agenda" } });
      else if (faltan >= 0 && faltan <= 14)
        c.push({ peso: 1, aviso: { id: `eventoNuevo:${ev.id}`, tipo: "evento", clave: "eventoNuevo", params: { titulo: ev.titulo, dias: faltan }, href: "/agenda" } });
    }
    if (minutos >= 10 * 60 && minutos < 22 * 60)
      for (const o of d.ofertas)
        c.push({ peso: 2, aviso: { id: `rescate:${o.id}:${dia}`, tipo: "rescate", clave: "rescate", params: { producto: o.producto, mercado: o.mercadoNombre, precio: o.precio, antes: o.precioOriginal, unidad: o.unidad }, href: "/explorar" } });
    if (minutos < 13 * 60)
      for (const s of d.surtidos)
        c.push({ peso: 2, aviso: { id: `surtido:${s.puestoId}:${s.producto}:${dia}`, tipo: "surtido", clave: "surtido", params: { producto: s.producto, puesto: s.puesto, mercado: s.mercado }, href: `/puesto/${s.puestoId}` } });
    c.push({ peso: 1, aviso: { id: `checkin:${dia}`, tipo: "checkin", clave: "checkin", params: {}, href: "/yo/escanear" } });
  }
  // Sin límite de hora: la demo se presenta a cualquier hora (los pedidos quedan para la siguiente hora).
  if (perfil === "locatario") {
    const pedido = pedidoLocatarioSimulado(d.puestoDemo.productos, semilla, now);
    c.push({ peso: 4, aviso: { id: `nuevoPedido:${pedido.folio}:${dia}`, tipo: "nuevoPedido", clave: "nuevoPedido", params: { folio: pedido.folio, items: pedido.items, total: pedido.total }, href: "/locatario/pedidos" }, efecto: { tipo: "pedidoLocatario", pedido } });
    const monto = r.entero(6, 40) * 10;
    c.push({ peso: 2, aviso: { id: `cobro:${semilla}`, tipo: "cobro", clave: "cobro", params: { monto }, href: "/locatario" }, efecto: { tipo: "cobro", monto } });
    for (const p of d.puestoDemo.productos) {
      const s = stockActual(d.puestoDemo.id, p, now, { protegido: true });
      if (s.disponible <= s.inicial * 0.45)
        c.push({ peso: 2, aviso: { id: `stock:${p.n}:${dia}`, tipo: "stock", clave: "stockBajo", params: { producto: p.n, n: s.disponible, unidad: unidadPlural(p.u, s.disponible) }, href: "/locatario/catalogo" } });
    }
  }
  if (perfil === "productor") {
    const pedido = pedidoMayoreoSimulado(d.productor.catalogo, semilla);
    c.push({ peso: 3, aviso: { id: `mayoreo:${pedido.folio}:${dia}`, tipo: "mayoreo", clave: "mayoreo", params: { cliente: pedido.cliente, producto: pedido.producto, cantidad: pedido.cantidad }, href: "/productor/pedidos" }, efecto: { tipo: "pedidoMayoreo", pedido } });
    for (const l of e.lotes)
      c.push({ peso: 1, aviso: { id: `lote:${l.producto}:${dia}`, tipo: "lote", clave: "loteVisto", params: { producto: l.producto, n: r.entero(6, 24) }, href: "/productor" } });
  }
  if (perfil === "gobierno") {
    const avance = Math.max(0.05, avanceDelDia(minutos));
    const redondo = (n: number) => Math.round((n * avance) / 10) * 10;
    c.push({ peso: 1, aviso: { id: `impacto:checkins:${dia}:${Math.floor(minutos / 120)}`, tipo: "impacto", clave: "impactoCheckins", params: { n: redondo(d.impacto.checkinsDia) }, href: "/gobierno" } });
    c.push({ peso: 1, aviso: { id: `impacto:kg:${dia}:${Math.floor(minutos / 120)}`, tipo: "impacto", clave: "impactoRescate", params: { kg: redondo(d.impacto.kgRescatadosDia) }, href: "/gobierno#sedema" } });
    c.push({ peso: 1, aviso: { id: `impacto:tx:${dia}:${Math.floor(minutos / 120)}`, tipo: "impacto", clave: "impactoTransacciones", params: { n: redondo(d.impacto.transaccionesDia) }, href: "/gobierno" } });
  }
  return c;
}

/** Elige el siguiente aviso (ponderado) entre los que aún no se entregan. `null` si no hay nada nuevo. */
export function siguienteAviso(perfil: PerfilAviso, d: DatosAvisos, e: EstadoAvisos, now: Date, semilla: number): { aviso: Aviso; efecto?: EfectoAviso } | null {
  const ya = new Set(e.entregados);
  const libres = candidatos(perfil, d, e, now, semilla).filter((x) => !ya.has(x.aviso.id));
  if (!libres.length) return null;
  const total = libres.reduce((s, x) => s + x.peso, 0);
  let t = azar(semilla ^ 0x9e3779b9).sig() * total;
  const elegido = libres.find((x) => (t -= x.peso) < 0) ?? libres[libres.length - 1];
  return { aviso: { ...elegido.aviso, fecha: now.toISOString(), leida: false }, efecto: elegido.efecto };
}

/** Bandeja con la que arranca cada perfil, para que no se vea vacía. */
export function bandejaInicial(perfil: PerfilAviso, d: DatosAvisos, now: Date): Aviso[] {
  const hace = (min: number) => new Date(now.getTime() - min * 60_000).toISOString();
  const base: Aviso[] = [{ id: `bienvenida:${perfil}`, tipo: "bienvenida", clave: `bienvenida_${perfil}`, params: {}, fecha: hace(95), leida: true }];
  const dia = hoyCDMX(now);
  if (perfil === "consumidor") {
    const ev = d.eventos.find((x) => (x.fin ?? x.inicio) >= dia);
    if (ev) base.unshift({ id: `eventoNuevo:${ev.id}`, tipo: "evento", clave: "eventoNuevo", params: { titulo: ev.titulo, dias: Math.max(0, diasEntre(dia, ev.inicio)) }, href: "/agenda", fecha: hace(40), leida: false });
  }
  if (perfil === "locatario") base.unshift({ id: `inicio:locatario:${dia}`, tipo: "cobro", clave: "resumenDia", params: {}, href: "/locatario", fecha: hace(30), leida: false });
  return base;
}

/** «hace un momento», «hace 5 min», «hace 2 h», «hace 3 días» para marcas de tiempo ISO. */
export function haceTiempo(iso: string, now: Date, locale = "es"): string {
  const seg = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 1000));
  if (seg < 60) return locale === "en" ? "just now" : "hace un momento";
  const rtf = new Intl.RelativeTimeFormat(locale === "en" ? "en" : "es-MX", { numeric: "auto" });
  if (seg < 3600) return rtf.format(-Math.round(seg / 60), "minute");
  if (seg < 86_400) return rtf.format(-Math.round(seg / 3600), "hour");
  return rtf.format(-Math.round(seg / 86_400), "day");
}
