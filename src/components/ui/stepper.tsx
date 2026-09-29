"use client";

import { Minus, Plus } from "lucide-react";

/** Selector de cantidad 1–99 con botones de 44 px. */
export function Stepper({ valor, onCambio, etiqueta, menos, mas }: { valor: number; onCambio: (v: number) => void; etiqueta: string; menos: string; mas: string }) {
  return (
    <div className="flex items-center rounded-pill border border-border" role="group" aria-label={etiqueta}>
      <button
        type="button"
        aria-label={menos}
        disabled={valor <= 1}
        onClick={() => onCambio(Math.max(1, valor - 1))}
        className="grid size-11 place-items-center rounded-pill text-morado disabled:text-gris/50"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output className="w-8 text-center font-bold" aria-live="polite">
        {valor}
      </output>
      <button type="button" aria-label={mas} onClick={() => onCambio(Math.min(99, valor + 1))} className="grid size-11 place-items-center rounded-pill text-morado">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
