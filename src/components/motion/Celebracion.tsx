"use client";

import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

const COLORES = ["#E4007C", "#F29F05", "#3C8D2F", "#9B2694", "#F2B01E", "#1F4E9A"];

/**
 * Lluvia de papel picado para los momentos de éxito (pago recibido, sello, cobro, cosecha publicada).
 * Cubre su contenedor (que debe ser `relative`), no captura toques y vibra un instante en Android.
 * Con «reducir movimiento» no se muestra.
 */
export function Celebracion({ piezas = 28 }: { piezas?: number }) {
  const reducir = useReducedMotion();
  useEffect(() => {
    if (!reducir) navigator.vibrate?.([12, 40, 18]);
  }, [reducir]);
  // Posiciones deterministas (sin Math.random en render): se reparten por el ancho con un paso primo.
  const papeles = useMemo(
    () =>
      Array.from({ length: piezas }, (_, i) => ({
        x: (i * 37) % 100,
        deriva: ((i * 53) % 40) - 20,
        giro: 180 + ((i * 71) % 360),
        dur: 1.8 + (i % 6) * 0.22,
        retraso: (i % 7) * 0.07,
        color: COLORES[i % COLORES.length],
        ancho: i % 3 === 0 ? 10 : 7,
      })),
    [piezas],
  );
  if (reducir) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {papeles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-4 block rounded-[2px]"
          style={{ left: `${p.x}%`, width: p.ancho, height: p.ancho * 1.4, background: p.color }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "110cqh", x: p.deriva, rotate: p.giro, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.retraso, ease: [0.2, 0.6, 0.4, 1] }}
        />
      ))}
    </div>
  );
}
