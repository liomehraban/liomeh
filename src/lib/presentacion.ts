/**
 * Modo presentación: el guion de docs/06_demo.md como datos. El conductor (componente cliente)
 * interpreta cada acción sobre la UI real, usando los atributos `data-demo` de las pantallas.
 */
import type { Locale } from "@/i18n/routing";

export type PerfilDemo = "consumidor" | "locatario" | "productor" | "gobierno";

export type AccionDemo =
  | { tipo: "ir"; ruta: string }
  | { tipo: "clic"; demo: string; dentro?: string }
  /** Mueve el dedo y desplaza hasta el elemento, sin tocarlo. */
  | { tipo: "senalar"; demo: string }
  | { tipo: "escribir"; demo: string; texto: string; enviar?: boolean }
  /** Toca el elemento mientras exista (p. ej. «Siguiente» de la ruta hasta llegar). */
  | { tipo: "clicMientras"; demo: string; max: number }
  | { tipo: "esperar"; ms: number }
  | { tipo: "esperarRuta"; contiene: string }
  | { tipo: "esperarElemento"; demo: string };

export type PasoDemo = { id: string; perfil: PerfilDemo; locale: Locale; acciones: AccionDemo[] };

export const PUESTO_DEMO = "pancita-dona-chela";
export const RUTA_DEMO = "metro-merced__pancita-dona-chela";
export const PRODUCTOR_FAIRTRADE = "prod-milpa-01";
export const PUESTO_CHECKIN = "jugos-moreno";
export const EVENTO_DEMO = "mole-2026";

export const PASOS: PasoDemo[] = [
  {
    id: "buscar",
    perfil: "consumidor",
    locale: "en",
    acciones: [
      { tipo: "ir", ruta: "/explorar" },
      { tipo: "esperarElemento", demo: "buscar" },
      { tipo: "esperar", ms: 1200 },
      { tipo: "escribir", demo: "buscar", texto: "pancita", enviar: true },
      { tipo: "esperarElemento", demo: "ver-mercado" },
      { tipo: "senalar", demo: "ver-mercado" },
    ],
  },
  {
    id: "interior",
    perfil: "consumidor",
    locale: "en",
    acciones: [
      { tipo: "clic", demo: "ver-mercado" },
      { tipo: "esperarRuta", contiene: "/mercado/la-merced" },
      { tipo: "esperarElemento", demo: "ver-interior" },
      { tipo: "esperar", ms: 900 },
      { tipo: "senalar", demo: "ver-interior" },
      { tipo: "ir", ruta: `/mercado/la-merced/interior?puesto=${PUESTO_DEMO}` },
      { tipo: "esperarElemento", demo: "llevame" },
    ],
  },
  {
    id: "ruta",
    perfil: "consumidor",
    locale: "en",
    acciones: [
      { tipo: "clic", demo: "llevame" },
      { tipo: "clic", demo: "origen-metro-merced" },
      { tipo: "clic", demo: "confirmar-origen" },
      { tipo: "esperar", ms: 1200 },
      { tipo: "clicMientras", demo: "ruta-siguiente", max: 12 },
    ],
  },
  {
    id: "pagar",
    perfil: "consumidor",
    locale: "en",
    acciones: [
      { tipo: "ir", ruta: `/puesto/${PUESTO_DEMO}` },
      { tipo: "clic", demo: "mas", dentro: "producto:Pancita (pata, libro y cuaderno)" },
      { tipo: "clic", demo: "agregar", dentro: "producto:Pancita (pata, libro y cuaderno)" },
      { tipo: "clic", demo: "mas", dentro: "producto:Sope" },
      { tipo: "clic", demo: "agregar", dentro: "producto:Sope" },
      { tipo: "esperar", ms: 600 },
      { tipo: "ir", ruta: `/checkout?puesto=${PUESTO_DEMO}` },
      { tipo: "clic", demo: "generar-qr" },
      { tipo: "esperarRuta", contiene: "/pedido/" },
    ],
  },
  {
    id: "huerto",
    perfil: "consumidor",
    locale: "es",
    acciones: [
      { tipo: "ir", ruta: "/huertos" },
      { tipo: "esperar", ms: 1200 },
      { tipo: "ir", ruta: `/huertos/${PRODUCTOR_FAIRTRADE}` },
      { tipo: "esperarElemento", demo: "fairtrade" },
      { tipo: "senalar", demo: "fairtrade" },
    ],
  },
  {
    id: "asistente",
    perfil: "consumidor",
    locale: "es",
    acciones: [
      { tipo: "ir", ruta: "/asistente" },
      { tipo: "escribir", demo: "chat-input", texto: "¿Qué eventos hay este mes?", enviar: true },
      { tipo: "esperarElemento", demo: `recordar:${EVENTO_DEMO}` },
      { tipo: "clic", demo: `recordar:${EVENTO_DEMO}` },
    ],
  },
  {
    id: "checkin",
    perfil: "consumidor",
    locale: "es",
    acciones: [
      { tipo: "ir", ruta: `/yo/escanear?puesto=${PUESTO_CHECKIN}` },
      { tipo: "clic", demo: "escanear" },
      { tipo: "esperar", ms: 2500 },
    ],
  },
  {
    id: "cobrar",
    perfil: "locatario",
    locale: "es",
    acciones: [
      { tipo: "ir", ruta: "/locatario/pedidos" },
      { tipo: "esperar", ms: 2200 },
      { tipo: "ir", ruta: "/locatario/cobrar" },
      { tipo: "clic", demo: "tecla-2" },
      { tipo: "clic", demo: "tecla-5" },
      { tipo: "clic", demo: "tecla-0" },
      { tipo: "clic", demo: "generar-cobro" },
      { tipo: "esperar", ms: 5000 },
      { tipo: "ir", ruta: "/locatario" },
    ],
  },
  {
    id: "cosecha",
    perfil: "productor",
    locale: "es",
    acciones: [
      { tipo: "ir", ruta: "/productor" },
      { tipo: "escribir", demo: "lote-cantidad", texto: "200" },
      { tipo: "escribir", demo: "lote-precio", texto: "12" },
      { tipo: "senalar", demo: "publicar-lote" },
      { tipo: "clic", demo: "publicar-lote" },
    ],
  },
  {
    id: "gobierno",
    perfil: "gobierno",
    locale: "es",
    acciones: [
      { tipo: "ir", ruta: "/gobierno" },
      { tipo: "esperar", ms: 1500 },
      { tipo: "clic", demo: "tab-sedema" },
    ],
  },
];

/** Ruta inicial de cada perfil, para validar que el guion no salte de perfil sin navegar. */
export const INICIO_PERFIL: Record<PerfilDemo, string> = {
  consumidor: "/explorar",
  locatario: "/locatario",
  productor: "/productor",
  gobierno: "/gobierno",
};

export function progreso(paso: number, total = PASOS.length): number {
  return Math.max(0, Math.min(1, (paso + 1) / total));
}

/** Espera `ms` respetando un token de cancelación; devuelve false si se canceló. */
export function dormir(ms: number, vivo: () => boolean): Promise<boolean> {
  return new Promise((r) => setTimeout(() => r(vivo()), ms));
}
