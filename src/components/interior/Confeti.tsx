"use client";

import { motion, useReducedMotion } from "motion/react";

const COLORES = ["#E4007C", "#F29F05", "#3C8D2F", "#93408F", "#C8A96A", "#1F4E9A"];

/** Confeti discreto (16 papelitos). No se muestra con prefers-reduced-motion. */
export function Confeti() {
  const reducir = useReducedMotion();
  if (reducir) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
      {Array.from({ length: 16 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: COLORES[i % COLORES.length] }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: 150, rotate: 360 + i * 30, opacity: 0 }}
          transition={{ duration: 1.6 + (i % 5) * 0.2, delay: (i % 4) * 0.08, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
