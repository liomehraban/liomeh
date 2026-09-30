/** Pedidos (M5): folio, puntos y timeline automático. Puros, sin datos de tarjeta. */
import type { ItemCarrito } from "./carrito";
import type { Resumen } from "./checkout";
import { puntosPorCompra } from "./loyalty";
import { ESTADOS_LOCATARIO, type EstadoLocatario } from "./locatario";

export type MetodoPago = "qr" | "tarjeta";
export type TipoEntrega = "recoger" | "envio";
export type EtapaPedido = "pagado" | "preparando" | "listo" | "en ruta" | "entregado";

export type Pedido = {
  folio: string;
  /** ISO de creación; el timeline se calcula a partir de aquí. */
  fecha: string;
  puestoId: string;
  mercadoId: string;
  items: ItemCarrito[];
  resumen: Resumen;
  total: number;
  metodo: MetodoPago;
  /** Solo los últimos 4 dígitos, nunca el número completo. */
  tarjetaUltimos4?: string;
  entrega: TipoEntrega;
  proveedor?: string;
  puntos: number;
  dobles: boolean;
};

export const INTERVALO_DEMO_MS = 8000;

export const etapas = (entrega: TipoEntrega): EtapaPedido[] =>
  entrega === "recoger" ? ["pagado", "preparando", "listo"] : ["pagado", "preparando", "en ruta", "entregado"];

/** Etapa actual: avanza sola cada 8 s en modo demo y se queda en la última. */
export function etapaActual(p: Pick<Pedido, "fecha" | "entrega">, now = new Date(), intervalo = INTERVALO_DEMO_MS): number {
  const n = Math.floor((now.getTime() - new Date(p.fecha).getTime()) / intervalo);
  return Math.max(0, Math.min(n, etapas(p.entrega).length - 1));
}

/** «BB-XXXX» con 4 dígitos que no choquen con los existentes. */
export function nuevoFolio(existentes: string[], rnd: () => number = Math.random): string {
  const usados = new Set(existentes);
  for (let i = 0; i < 1000; i++) {
    const f = `BB-${String(Math.floor(1000 + rnd() * 9000))}`;
    if (!usados.has(f)) return f;
  }
  throw new Error("Sin folios disponibles");
}

export type NuevoPedido = Omit<Pedido, "folio" | "fecha" | "puntos" | "dobles" | "total"> & { planMercadoMas?: boolean };

export function construirPedido(input: NuevoPedido, existentes: string[], now = new Date(), rnd?: () => number): Pedido {
  const { planMercadoMas, ...resto } = input;
  const dobles = resto.items.some((i) => !!i.huertoId) || !!planMercadoMas;
  return {
    ...resto,
    folio: nuevoFolio(existentes, rnd),
    fecha: now.toISOString(),
    total: resto.resumen.total,
    dobles,
    puntos: puntosPorCompra(resto.resumen.total, { dobles }),
  };
}

/**
 * Etapa del pedido que ven el consumidor y el locatario por igual: la más avanzada entre el reloj
 * de la demo y lo que marcó el locatario en su tablero (nuevo → preparando → listo → entregado).
 */
export function etapaSincronizada(p: Pick<Pedido, "fecha" | "entrega">, estadoLocatario: string | undefined, now = new Date()): number {
  const ultima = etapas(p.entrega).length - 1;
  const manual = estadoLocatario ? (ESTADOS_LOCATARIO as readonly string[]).indexOf(estadoLocatario) : -1;
  return Math.max(etapaActual(p, now), Math.min(manual, ultima));
}

/** Estado del tablero del locatario que corresponde a una etapa del consumidor. */
export const estadoLocatarioDeEtapa = (i: number): EstadoLocatario => ESTADOS_LOCATARIO[Math.min(Math.max(i, 0), ESTADOS_LOCATARIO.length - 1)];
