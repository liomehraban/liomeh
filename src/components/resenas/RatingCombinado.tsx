"use client";

import { useMemo } from "react";

import { Estrellas } from "@/components/market/Estrellas";
import { combinarRating, type Rating } from "@/lib/resenas";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/** Rating del JSON combinado con las reseñas propias del store (M8 AC). */
export function RatingCombinado({ objetivoId, base, className }: { objetivoId: string; base: Rating | null; className?: string }) {
  const hydrated = useHydrated();
  const todas = useAppStore((s) => s.resenasPropias);
  const propias = useMemo(() => (hydrated ? todas.filter((r) => r.objetivo_id === objetivoId) : []), [hydrated, todas, objetivoId]);
  const r = combinarRating(base, propias);
  return r ? <Estrellas rating={r.promedio} total={r.total} className={className} /> : null;
}
