"use client";

import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";

export type EstadoDedo = { x: number; y: number; toque: number; visible: boolean };

/** Dedo de la presentación: sigue a los elementos que el guion toca, con una onda en cada toque. */
export function DedoDemo({ estado }: { estado: EstadoDedo }) {
  const reducido = useReducedMotion();
  if (!estado.visible) return null;
  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100]"
      initial={false}
      animate={{ x: estado.x - 18, y: estado.y - 18 }}
      transition={reducido ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 22 }}
    >
      <span className="block size-9 rounded-full border-[3px] border-white bg-rosa/70 shadow-lg" />
      {estado.toque > 0 && (
        <motion.span
          key={estado.toque}
          className="absolute inset-0 rounded-full border-4 border-rosa"
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: reducido ? 0 : 0.5 }}
        />
      )}
    </motion.div>,
    document.body,
  );
}
