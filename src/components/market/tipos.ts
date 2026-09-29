/** Llave de mensajes para cada `tipo` de mercado (sin acentos). */
export const TIPO_KEY: Record<string, "tradicional" | "especializado" | "turistico" | "mayorista" | "productores" | "regional"> = {
  tradicional: "tradicional",
  especializado: "especializado",
  "turístico": "turistico",
  mayorista: "mayorista",
  productores: "productores",
  regional: "regional",
};
export const TIPOS = Object.keys(TIPO_KEY);
