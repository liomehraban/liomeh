"use client";

import { useMemo } from "react";

import { evaluarInsignias, type ContextoInsignias } from "@/lib/loyalty";
import { useAppStore } from "@/store/useAppStore";

/** Insignias desbloqueadas: las de la demo + las que cumplen su regla con el estado actual. */
export function useInsignias(ctx: ContextoInsignias): Set<string> {
  const sellos = useAppStore((s) => s.sellos);
  const checkins = useAppStore((s) => s.checkins);
  const pedidos = useAppStore((s) => s.pedidos);
  const semilla = useAppStore((s) => s.insignias);
  return useMemo(() => {
    const huertosComprados = pedidos.flatMap((p) => p.items.map((i) => i.huertoId).filter((h): h is string => !!h));
    return new Set([...semilla, ...evaluarInsignias({ sellos, checkins: checkins ?? [], huertosComprados }, ctx)]);
  }, [sellos, checkins, pedidos, semilla, ctx]);
}
