import type { ReactNode } from "react";

import { NumeroAnimado } from "@/components/motion/NumeroAnimado";
import { cn } from "@/lib/utils";

/**
 * Cifra grande del panel: número en tinta, etiqueta y detalle en texto secundario. Con `numero` (y su
 * `formato`) la cifra cuenta al aparecer; `valor` queda para textos fijos. La etiqueta reserva siempre dos
 * renglones: en una fila de mosaicos las cifras quedan a la misma altura aunque una etiqueta sea más larga.
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
    <div className={cn("flex h-full min-w-0 flex-col gap-1.5 rounded-card border border-border bg-white p-4", className)}>
      <span className="flex min-h-[2lh] items-start gap-1.5 text-[13px] leading-snug font-semibold text-tinta-2">
        {icono && <span className="mt-0.5 shrink-0">{icono}</span>}
        <span className="line-clamp-2" title={etiqueta}>
          {etiqueta}
        </span>
      </span>
      <span className="font-display text-4xl leading-none text-tinta">{numero !== undefined ? <NumeroAnimado valor={numero} formato={formato} /> : valor}</span>
      {detalle && <span className="text-[12px] text-tinta-2">{detalle}</span>}
    </div>
  );
}
