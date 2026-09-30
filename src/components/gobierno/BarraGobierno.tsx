"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Alto de la barra: el tope de los controles flotantes + 44 px de botón + 12 px de aire. */
const ALTO = "calc(max(0.75rem,env(safe-area-inset-top)) + 2.75rem + 0.75rem)";

/**
 * Barra superior del panel de gobierno. El panel se desplaza con la ventana y la campana y el cambio de perfil
 * van fijos (TopControls, z-40): en cuanto el encabezado morado sale de la vista aparece esta barra crema
 * detrás de ellos (z-30), con el título en pequeño, para que no floten sobre las tarjetas.
 */
export function BarraGobierno({ heroId, titulo }: { heroId: string; titulo: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      // Visible cuando el borde inferior del encabezado ya pasó por debajo de la barra.
      setVisible(hero.getBoundingClientRect().bottom < 68);
    };
    const programar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    programar();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("resize", programar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", programar);
      window.removeEventListener("resize", programar);
    };
  }, [heroId]);

  return (
    <div
      aria-hidden
      inert={!visible}
      style={{ height: ALTO }}
      className={cn(
        "fixed inset-x-0 top-0 z-30 border-b border-border bg-crema pt-[max(0.75rem,env(safe-area-inset-top))] transition-[translate,opacity] duration-200 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      <div className="mx-auto flex h-11 w-full max-w-6xl items-center px-5 pr-28 lg:px-10">
        <span className="truncate pt-1 font-display text-2xl leading-none text-morado-700">{titulo}</span>
      </div>
    </div>
  );
}
