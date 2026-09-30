"use client";

import { useSyncExternalStore } from "react";

let ahora: Date | null = null;
const oyentes = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  oyentes.add(cb);
  if (!timer) {
    ahora = new Date();
    timer = setInterval(() => {
      ahora = new Date();
      oyentes.forEach((f) => f());
    }, 30_000);
  }
  return () => {
    oyentes.delete(cb);
    if (!oyentes.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Hora actual que se refresca cada 30 s. `null` en el servidor (evita desajustes de hidratación). */
export function useAhora(): Date | null {
  return useSyncExternalStore(subscribe, () => ahora ?? (ahora = new Date()), () => null);
}

/** Fuerza a todos los `useAhora` a recalcular ya (lo usa «jalar para actualizar»). */
export function refrescarAhora() {
  ahora = new Date();
  oyentes.forEach((f) => f());
}
