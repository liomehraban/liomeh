"use client";

import { useLocale } from "next-intl";

import { formatMXN, formatUSDaprox } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Monto en MXN; en inglés agrega el aproximado en USD. */
export function Precio({ monto, className }: { monto: number; className?: string }) {
  const locale = useLocale();
  return (
    <span className={cn("inline-flex shrink-0 flex-col leading-tight", className)}>
      <span className="font-bold whitespace-nowrap">{formatMXN(monto, locale)}</span>
      {locale === "en" && <span className="text-xs font-normal whitespace-nowrap text-tinta-2">{formatUSDaprox(monto)}</span>}
    </span>
  );
}
