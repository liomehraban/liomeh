/**
 * Clasificación de giros en categorías visuales (docs/04_diseno.md › Color por giro).
 * Los giros vienen como texto libre en /data; aquí se normalizan a una categoría con color fijo.
 */
export type CategoriaGiro =
  | "comida"
  | "frutas"
  | "flores"
  | "artesanias"
  | "pescados"
  | "dulces"
  | "mayoreo"
  | "otros";

export const COLOR_GIRO: Record<CategoriaGiro, string> = {
  comida: "var(--color-chile)",
  frutas: "var(--color-nopal)",
  flores: "var(--color-rosa)",
  artesanias: "var(--color-anil)",
  pescados: "var(--color-anil-claro)",
  dulces: "var(--color-cempasuchil)",
  mayoreo: "var(--color-morado-900)",
  otros: "var(--color-morado)",
};

/** Mismo color en hex, para contextos sin CSS variables (MapLibre, SVG exportado). */
export const HEX_GIRO: Record<CategoriaGiro, string> = {
  comida: "#C8102E",
  frutas: "#3C8D2F",
  flores: "#E4007C",
  artesanias: "#1F4E9A",
  pescados: "#4F86C6",
  dulces: "#F29F05",
  mayoreo: "#3E1C3C",
  otros: "#93408F",
};

const quitarAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const REGLAS: [CategoriaGiro, RegExp][] = [
  ["pescados", /pesca|marisc/],
  ["dulces", /dulce|confit|postre/],
  ["flores", /flor|planta/],
  ["artesanias", /artesan|arte\b|talavera|curiosidad/],
  ["mayoreo", /mayoreo|mayorista|abasto$/],
  ["comida", /comida|fonda|taco|taquer|carnitas|quesadilla|caldo|migas|pancita|desayuno|antojo|gourmet|internacional|jugo/],
  ["frutas", /fruta|verdura|legumbre|abasto|nopal|chile|semilla|productor|abarrote|polleria|carn|molino|masa/],
];

export function categoriaGiro(giro: string | undefined | null): CategoriaGiro {
  if (!giro) return "otros";
  const g = quitarAcentos(giro);
  for (const [cat, re] of REGLAS) if (re.test(g)) return cat;
  return "otros";
}

/** Categoría principal de un mercado: la de su primer giro reconocible, o por tipo (mayorista). */
export function categoriaMercado(m: { giros: string[]; tipos: string[] }): CategoriaGiro {
  for (const g of m.giros) {
    const c = categoriaGiro(g);
    if (c !== "otros") return c;
  }
  if (m.tipos.includes("mayorista")) return "mayoreo";
  return "otros";
}
