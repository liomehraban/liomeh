"use client";

import { motion } from "motion/react";
import { Stamp } from "lucide-react";

/** Sello del pasaporte que cae con un pequeño rebote. */
export function SelloPuntos({ texto, subtitulo }: { texto: string; subtitulo: string }) {
  return (
    <div className="flex items-center gap-4 rounded-card bg-morado p-4 text-crema">
      <motion.div
        initial={{ y: -70, rotate: -25, scale: 1.4, opacity: 0 }}
        animate={{ y: 0, rotate: -10, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.2 }}
        className="grid size-20 shrink-0 place-items-center rounded-full border-4 border-dashed border-dorado bg-morado-900 text-dorado"
        aria-hidden
      >
        <Stamp className="size-9" />
      </motion.div>
      <div className="flex flex-col">
        <p className="font-display text-4xl text-dorado-200" role="status">
          {texto}
        </p>
        <p className="text-sm">{subtitulo}</p>
      </div>
    </div>
  );
}
