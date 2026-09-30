"use client";

import { useLocale } from "next-intl";

import { NumeroAnimado } from "@/components/motion/NumeroAnimado";
import { formatCompacto, formatMXN } from "@/lib/money";

/** Cifra de la ficha de mercado (tal como viene de la guía): los números cuentan al aparecer, los rangos no. Va dentro de un `@container`. */
export function CifraAnimada({ clave, valor }: { clave: string; valor: number | string }) {
  const locale = useLocale();
  if (typeof valor === "string") {
    // Rangos de la guía («200,000-250,000»): raya corta tipográfica y sin corte de línea; el tamaño se
    // ajusta al ancho de la tarjeta (contenedor `@container`) para que quepa aun a media columna en 360 px.
    const rango = valor.replace(/(\d)\s*[-–—]\s*(\d)/g, "$1–$2");
    const cqi = Math.floor(100 / (rango.length * 0.45));
    return (
      <span className="whitespace-nowrap" style={{ fontSize: `min(1em, ${cqi}cqi)` }}>
        {rango}
      </span>
    );
  }
  const formato = (n: number) => {
    if (clave.endsWith("_mxn")) return formatMXN(n, locale).replace(/[\d,.]+/, formatCompacto(n, locale));
    return valor >= 10000 ? formatCompacto(n, locale) : new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX").format(Math.round(n));
  };
  return <NumeroAnimado valor={valor} formato={formato} />;
}
