"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/** Relleno de una barra de progreso que crece de 0 a `pct` al entrar en pantalla (y a cada cambio). */
export function BarraAnimada({ pct, className, color, retraso = 0 }: { pct: number; className?: string; color?: string; retraso?: number }) {
  return (
    <motion.div
      className={cn("h-full rounded-pill", className)}
      style={color ? { background: color } : undefined}
      initial={{ width: 0 }}
      whileInView={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: retraso }}
    />
  );
}
