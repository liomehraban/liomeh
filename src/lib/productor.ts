/** Vistas del productor (M17–M18). */

export type EstadoMayoreo = "nuevo" | "confirmado" | "listo" | "enviado" | "entregado";

/** Estado normalizado desde el texto de usuarios_demo («Por recoger», «En ruta (terceros)»…). */
export function normalizarEstadoMayoreo(texto: string | undefined): EstadoMayoreo {
  const t = (texto ?? "").toLowerCase();
  if (t.includes("entregad")) return "entregado";
  if (t.includes("ruta") || t.includes("enviad") || t.includes("tercer")) return "enviado";
  if (t.includes("recoger") || t.includes("listo")) return "listo";
  if (t.includes("confirm")) return "confirmado";
  return "nuevo";
}

/** Nuevo → Confirmado → Listo para recoger | Enviado con terceros → Entregado. */
export function siguientesEstadosMayoreo(e: EstadoMayoreo): EstadoMayoreo[] {
  switch (e) {
    case "nuevo":
      return ["confirmado"];
    case "confirmado":
      return ["listo", "enviado"];
    case "listo":
    case "enviado":
      return ["entregado"];
    default:
      return [];
  }
}

/** Diferencia % del precio propuesto vs el de referencia del mercado (precio_mayoreo_app). */
export const difPrecio = (precio: number, referencia: number) => (referencia ? Math.round(((precio - referencia) / referencia) * 100) : 0);
