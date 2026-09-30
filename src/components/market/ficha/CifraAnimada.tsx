"use client";

import { useLocale } from "next-intl";

import { NumeroAnimado } from "@/components/motion/NumeroAnimado";
import { formatCompacto, formatMXN } from "@/lib/money";

/** Cifra de la ficha de mercado (tal como viene de la guía): los números cuentan al aparecer, los rangos no. */
export function CifraAnimada({ clave, valor }: { clave: string; valor: number | string }) {
  const locale = useLocale();
  if (typeof valor === "string") return <>{valor}</>;
  const formato = (n: number) => {
    if (clave.endsWith("_mxn")) return formatMXN(n, locale).replace(/[\d,.]+/, formatCompacto(n, locale));
    return valor >= 10000 ? formatCompacto(n, locale) : new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX").format(Math.round(n));
  };
  return <NumeroAnimado valor={valor} formato={formato} />;
}
