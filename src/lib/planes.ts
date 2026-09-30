/** Efectos del plan del consumidor (M12). */
import type { PlanConsumidor } from "./checkout";

export const LIMITE_ASISTENTE_GRATIS = 20;

/** Preguntas al día al asistente: 20 en Gratis; ilimitado con Pase Turista o Mercado+. */
export const limiteAsistente = (plan: PlanConsumidor) => (plan === "Gratis" ? LIMITE_ASISTENTE_GRATIS : Infinity);

/** Rutas premium: solo con Pase Turista (según modelo_negocio: «Rutas premium con audioguía»). */
export const accesoRutaPremium = (plan: PlanConsumidor) => plan === "Pase Turista";

/** Nombre del plan en modelo_negocio.json → id del store. */
export function planDesdeModelo(nombre: string): PlanConsumidor {
  if (/^pase turista/i.test(nombre)) return "Pase Turista";
  if (/^mercado\+/i.test(nombre)) return "Mercado+";
  return "Gratis";
}
