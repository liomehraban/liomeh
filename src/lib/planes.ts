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

export type ContadorAsistente = { fecha: string; usados: number };

/**
 * Consume una pregunta del día (día CDMX). Devuelve si se permite, las restantes y el nuevo contador.
 * Con plan de pago no hay límite.
 */
export function consumirPregunta(c: ContadorAsistente, plan: PlanConsumidor, now = new Date()) {
  const hoy = now.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  const usados = c.fecha === hoy ? c.usados : 0;
  const limite = limiteAsistente(plan);
  if (usados >= limite) return { ok: false as const, restantes: 0, contador: { fecha: hoy, usados } };
  return { ok: true as const, restantes: limite === Infinity ? Infinity : limite - usados - 1, contador: { fecha: hoy, usados: usados + 1 } };
}

export function preguntasRestantes(c: ContadorAsistente, plan: PlanConsumidor, now = new Date()) {
  const hoy = now.toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
  const limite = limiteAsistente(plan);
  return limite === Infinity ? Infinity : Math.max(0, limite - (c.fecha === hoy ? c.usados : 0));
}
