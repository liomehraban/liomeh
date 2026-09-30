/**
 * Cálculo del resumen de un pedido (M5). Montos enteros en MXN.
 * Reglas: tarifa de servicio $9 (0 con Mercado+); 10% con Pase Turista en puestos Pro o Plus;
 * envío con terceros ±$10 según la distancia a la colonia.
 */
import type { LineaCarrito } from "./carrito";
import { subtotalGrupo } from "./carrito";

export type PlanConsumidor = "Gratis" | "Pase Turista" | "Mercado+";
export type PlanPuesto = "Gratis" | "Pro" | "Plus";

export const TARIFA_SERVICIO = 9;
export const DESCUENTO_PASE = 0.1;

export const PROVEEDORES = [
  { id: "rappi", nombre: "Rappi", precio: 49, minutos: 35 },
  { id: "uber", nombre: "Uber", precio: 55, minutos: 30 },
  { id: "99", nombre: "99", precio: 45, minutos: 40 },
] as const;
export type ProveedorId = (typeof PROVEEDORES)[number]["id"];

export type Entrega = { tipo: "recoger" } | { tipo: "envio"; proveedor: ProveedorId; distanciaKm: number };

/** Ajuste por distancia: −$10 si < 3 km, $0 hasta 8 km, +$10 si es más lejos. */
export function ajusteDistancia(km: number): number {
  if (km < 3) return -10;
  if (km <= 8) return 0;
  return 10;
}

export function costoEnvio(proveedor: ProveedorId, distanciaKm: number): number {
  const p = PROVEEDORES.find((x) => x.id === proveedor)!;
  return p.precio + ajusteDistancia(distanciaKm);
}

export type Resumen = {
  subtotal: number;
  descuento: number;
  servicio: number;
  /** Tarifa que se habría cobrado (para mostrarla tachada con Mercado+). */
  servicioOriginal: number;
  envio: number;
  total: number;
};

export function resumenPedido(linea: LineaCarrito, planUsuario: PlanConsumidor, planPuesto: PlanPuesto, entrega: Entrega): Resumen {
  const subtotal = subtotalGrupo(linea);
  const descuento = planUsuario === "Pase Turista" && (planPuesto === "Pro" || planPuesto === "Plus") ? Math.round(subtotal * DESCUENTO_PASE) : 0;
  const servicio = planUsuario === "Mercado+" ? 0 : TARIFA_SERVICIO;
  const envio = entrega.tipo === "envio" ? costoEnvio(entrega.proveedor, entrega.distanciaKm) : 0;
  return { subtotal, descuento, servicio, servicioOriginal: TARIFA_SERVICIO, envio, total: subtotal - descuento + servicio + envio };
}

/** Luhn (mod 10) sobre los dígitos de la tarjeta. */
export function luhn(numero: string): boolean {
  const d = numero.replace(/\D/g, "");
  if (d.length < 12 || d.length > 19) return false;
  let suma = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    suma += n;
  }
  return suma % 10 === 0;
}

/** «MM/AA» vigente respecto a `now`. */
export function vigenciaValida(mmaa: string, now = new Date()): boolean {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(mmaa.trim());
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  return anio > now.getFullYear() || (anio === now.getFullYear() && mes >= now.getMonth() + 1);
}

/** Agrupa en bloques de 4: «4242 4242 4242 4242». */
export const formatearTarjeta = (s: string) => s.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

/** Payload simulado de CoDi/SPEI para el QR (no es un formato bancario real). */
export function payloadCoDi(folio: string, monto: number, puestoId: string): string {
  return `BARABARA-CODI-DEMO|folio=${folio}|monto=${monto.toFixed(2)}|mxn|puesto=${puestoId}`;
}
