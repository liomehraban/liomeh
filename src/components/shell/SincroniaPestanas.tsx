"use client";

import { useEffect } from "react";

import { useAppStore } from "@/store/useAppStore";

/** Con la app abierta en varias pestañas, lo que cambia en una se refleja en las demás. */
export function SincroniaPestanas() {
  useEffect(() => {
    const nombre = useAppStore.persist.getOptions().name;
    const alCambiar = (e: StorageEvent) => {
      if (e.key === nombre) void useAppStore.persist.rehydrate();
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);
  return null;
}
