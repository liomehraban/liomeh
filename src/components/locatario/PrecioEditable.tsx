"use client";

import { useState } from "react";

/**
 * Precio en línea del catálogo: se edita como borrador (se puede borrar y reescribir) y se guarda al salir
 * del campo o con Enter. Si queda vacío o en cero, vuelve al precio anterior. 16 px para que iOS no haga zoom.
 */
export function PrecioEditable({ valor, etiqueta, onGuardar }: { valor: number; etiqueta: string; onGuardar: (p: number) => void }) {
  const [borrador, setBorrador] = useState<string | null>(null);
  const guardar = () => {
    const v = Math.round(Number(borrador));
    if (borrador !== null && v > 0 && v !== valor) onGuardar(v);
    setBorrador(null);
  };
  return (
    // «$» como prefijo dentro del campo: el campo mide 84 px y deja más espacio al nombre del producto.
    <label className="relative flex shrink-0 items-center">
      <span className="pointer-events-none absolute left-2.5 text-base font-semibold text-tinta-2" aria-hidden>
        $
      </span>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={borrador ?? valor}
        aria-label={etiqueta}
        onChange={(e) => setBorrador(e.target.value)}
        onBlur={guardar}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="h-11 w-[76px] [appearance:textfield] rounded-xl border border-input bg-white pr-2.5 pl-6 text-right text-base font-semibold tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </label>
  );
}
