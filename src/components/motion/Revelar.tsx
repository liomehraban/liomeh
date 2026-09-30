"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const ETIQUETAS = { div: motion.div, li: motion.li, section: motion.section, article: motion.article } as const;

/**
 * Aparece (fundido + 14 px hacia arriba) la primera vez que entra en pantalla. `orden` escalona elementos
 * hermanos de una lista (50 ms cada uno, tope en el 8.º). Con «reducir movimiento» solo se funde.
 */
export function Revelar({
  children,
  className,
  orden = 0,
  como = "div",
  ...resto
}: {
  children: ReactNode;
  className?: string;
  orden?: number;
  como?: keyof typeof ETIQUETAS;
} & Record<`data-${string}`, string | undefined>) {
  const Etiqueta = ETIQUETAS[como];
  return (
    <Etiqueta
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, ease: EASE, delay: Math.min(orden, 8) * 0.05 }}
      {...resto}
    >
      {children}
    </Etiqueta>
  );
}
