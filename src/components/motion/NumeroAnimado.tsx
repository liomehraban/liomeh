"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useLocale } from "next-intl";

import { formatMXN } from "@/lib/money";

import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Decimales con los que se muestran los pasos intermedios (los mismos que trae el valor, máx. 2). */
const decimales = (n: number) => Math.min(2, (String(n).split(".")[1] ?? "").length);

/**
 * Número que cuenta hasta su valor la primera vez que entra en pantalla y que anima cada cambio posterior
 * (p. ej. ventas de hoy tras un cobro). El texto final queda siempre en un span para lectores de pantalla
 * (y para las pruebas); la cifra animada es decorativa. Con «reducir movimiento» se muestra directo.
 */
export function NumeroAnimado({
  valor,
  formato,
  moneda = false,
  desde = 0,
  duracion = 1.1,
  className,
}: {
  valor: number;
  formato?: (n: number) => string;
  /** Formatea como pesos (formatMXN). Útil desde componentes de servidor, que no pueden pasar funciones. */
  moneda?: boolean;
  desde?: number;
  duracion?: number;
  className?: string;
}) {
  const locale = useLocale();
  const formatear = formato ?? (moneda ? (n: number) => formatMXN(Math.round(n), locale) : (n: number) => String(n));
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reducir = useReducedMotion();
  const mostrado = useRef<number | null>(null);
  const fmt = useRef(formatear);
  useEffect(() => {
    fmt.current = formatear;
  });

  // Antes de pintar: si todavía va a contar, arranca desde `desde` (sin destello del valor final).
  useIsoLayoutEffect(() => {
    if (!reducir && mostrado.current === null && ref.current) ref.current.textContent = fmt.current(desde);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducir) {
      el.textContent = fmt.current(valor);
      mostrado.current = valor;
      return;
    }
    if (!visto) return;
    const inicio = mostrado.current ?? desde;
    const d = decimales(valor);
    const ctrl = animate(inicio, valor, {
      duration: mostrado.current === null ? duracion : 0.7,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = fmt.current(Number(v.toFixed(d)));
      },
    });
    mostrado.current = valor;
    return () => ctrl.stop();
  }, [valor, visto, reducir, desde, duracion]);

  return (
    <span className={cn("tabular-nums", className)}>
      <span className="sr-only">{formatear(valor)}</span>
      <span ref={ref} aria-hidden>
        {formatear(valor)}
      </span>
    </span>
  );
}
