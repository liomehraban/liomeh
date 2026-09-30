/** Montos en enteros MXN. */

export const USD_RATE = Number(process.env.NEXT_PUBLIC_USD_RATE) || 18.5;

export function formatMXN(monto: number, locale = "es"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", {
    style: "currency",
    currency: "MXN",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(monto);
}

export function toUSD(mxn: number, rate = USD_RATE): number {
  return Math.round((mxn / rate) * 100) / 100;
}

/** «≈ US$6.22» para mostrar junto al monto en inglés. */
export function formatUSDaprox(mxn: number, rate = USD_RATE): string {
  return `≈ US$${toUSD(mxn, rate).toFixed(2)}`;
}

/**
 * Cifras grandes compactas, el único formateador compacto de la app: 235400 → «235.4 mil» / «235.4K»,
 * 40000000 → «40 M» / «40M». En español se usa es-MX (punto decimal, como el resto de las cifras) pero con
 * «mil» en lugar de la «k» de ICU, que junto a la «K» mayúscula de la tipografía display se veía inconsistente.
 */
export function formatCompacto(n: number, locale = "es"): string {
  const en = locale === "en";
  const partes = new Intl.NumberFormat(en ? "en-US" : "es-MX", { notation: "compact", maximumFractionDigits: 1 }).formatToParts(n);
  return partes.map((p) => (!en && p.type === "compact" && p.value.toLowerCase() === "k" ? "mil" : p.value)).join("");
}
