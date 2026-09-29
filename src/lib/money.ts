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

/** Cifras grandes compactas: 40000000 → «40 M» / «40M». */
export function formatCompacto(n: number, locale = "es"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
