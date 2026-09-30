import type { ReactNode } from "react";

import { NumeroAnimado } from "@/components/motion/NumeroAnimado";
import { cn } from "@/lib/utils";

/**
 * Cifra grande del panel: número en tinta, etiqueta y detalle en texto secundario. Con `numero` (y su
 * `formato`) la cifra cuenta al aparecer; `valor` queda para textos fijos.
 */
export function KpiTile({
  etiqueta,
  valor,
  numero,
  formato,
  detalle,
  icono,
  className,
}: {
  etiqueta: string;
  valor?: string;
  numero?: number;
  formato?: (n: number) => string;
  detalle?: ReactNode;
  icono?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-card border border-border bg-white p-4", className)}>
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-tinta-2">
        {icono}
        {etiqueta}
      </span>
      <span className="font-display text-4xl leading-none text-tinta">{numero !== undefined ? <NumeroAnimado valor={numero} formato={formato} /> : valor}</span>
      {detalle && <span className="text-[12px] text-tinta-2">{detalle}</span>}
    </div>
  );
}
