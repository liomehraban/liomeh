"use client";

import { Minus, Plus } from "lucide-react";

/** Selector de cantidad 1–99 con botones de 44 px. */
export function Stepper({
  valor,
  onCambio,
  etiqueta,
  menos,
  mas,
  max = 99,
  min = 1,
}: {
  valor: number;
  onCambio: (v: number) => void;
  etiqueta: string;
  menos: string;
  mas: string;
  max?: number;
  min?: number;
}) {
  return (
    <div className="flex items-center rounded-pill border border-border" role="group" aria-label={etiqueta}>
      <button
        type="button"
        aria-label={menos}
        disabled={valor <= min}
        onClick={() => onCambio(Math.max(min, valor - 1))}
        className="grid size-11 place-items-center rounded-pill text-morado disabled:text-gris/50"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <output className="w-8 text-center font-bold" aria-live="polite">
        {valor}
      </output>
      <button
        type="button"
        data-demo="mas"
        aria-label={mas}
        disabled={valor >= max}
        onClick={() => onCambio(Math.min(max, valor + 1))}
        className="grid size-11 place-items-center rounded-pill text-morado disabled:text-gris/50"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
