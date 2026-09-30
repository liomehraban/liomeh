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
    <label className="flex items-center gap-1 text-base font-semibold">
      $
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={borrador ?? valor}
        aria-label={etiqueta}
        onChange={(e) => setBorrador(e.target.value)}
        onBlur={guardar}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="h-11 w-20 rounded-xl border border-input bg-white px-2 text-right text-base"
      />
    </label>
  );
}
