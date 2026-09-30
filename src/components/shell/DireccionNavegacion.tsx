"use client";

import { useEffect } from "react";

/** Profundidad de una ruta sin el prefijo de idioma: /es/mercado/12 → 2. */
const profundidad = (path: string) => path.split("/").filter(Boolean).length - 1;

/**
 * Marca en <html data-nav> la dirección de la próxima navegación para que globals.css elija la transición:
 * «adelante» al entrar a un detalle (el contenido llega desde la derecha), «atras» al volver (llega desde la
 * izquierda). Las pestañas de la tab bar (data-nav-tab) y las navegaciones programáticas usan el fade-through.
 */
export function DireccionNavegacion() {
  useEffect(() => {
    const raiz = document.documentElement;
    let limpiar: ReturnType<typeof setTimeout> | undefined;
    const marcar = (dir: "adelante" | "atras" | null) => {
      clearTimeout(limpiar);
      if (dir) raiz.dataset.nav = dir;
      else delete raiz.dataset.nav;
      limpiar = setTimeout(() => delete raiz.dataset.nav, 1000);
    };

    const alTocar = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const destino = new URL(a.href, location.href);
      if (destino.origin !== location.origin || destino.pathname === location.pathname) return;
      if (a.closest("[data-nav-tab]")) return marcar(null);
      const [de, a2] = [profundidad(location.pathname), profundidad(destino.pathname)];
      marcar(a2 > de || (a2 === de && a2 > 1) ? "adelante" : a2 < de ? "atras" : null);
    };
    // Atrás del navegador/sistema. Si el navegador ya anima el gesto (Safari), no se suma otra animación.
    const alVolver = (e: PopStateEvent) => marcar((e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition ? null : "atras");

    document.addEventListener("click", alTocar, true);
    window.addEventListener("popstate", alVolver);
    return () => {
      clearTimeout(limpiar);
      document.removeEventListener("click", alTocar, true);
      window.removeEventListener("popstate", alVolver);
    };
  }, []);
  return null;
}
