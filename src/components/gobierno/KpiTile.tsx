import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Cifra grande del panel: número en tinta, etiqueta y detalle en texto secundario. */
export function KpiTile({ etiqueta, valor, detalle, icono, className }: { etiqueta: string; valor: string; detalle?: ReactNode; icono?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-card border border-border bg-white p-4", className)}>
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-tinta-2">
        {icono}
        {etiqueta}
      </span>
      <span className="font-display text-4xl leading-none text-tinta">{valor}</span>
      {detalle && <span className="text-[12px] text-tinta-2">{detalle}</span>}
    </div>
  );
}
