/** Rescata hoy (M20): productos por perderse con −40%. */

export const DESCUENTO_RESCATE = 0.4;

export type OfertaRescate = {
  id: string;
  mercadoId: string;
  mercadoNombre: string;
  /** Puesto del catálogo si la oferta sale de un puesto en línea. */
  puestoId?: string;
  producto: string;
  unidad: string;
  cantidad: number;
  precioOriginal: number;
  precio: number;
  kg: number;
  /** «HH:MM»: cierre del mercado (o 18:00 si no hay horario). */
  vence: string;
  giro: string;
};

export const precioRescate = (p: number) => Math.round(p * (1 - DESCUENTO_RESCATE));

/** Toneladas del mes = KPI de metricas_gobierno + lo rescatado localmente (kg). */
export const toneladasRescatadas = (kpiTon: number, kgLocales: number) => Math.round((kpiTon + kgLocales / 1000) * 1000) / 1000;
