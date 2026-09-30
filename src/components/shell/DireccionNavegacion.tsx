"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";

/** Profundidad de una ruta sin el prefijo de idioma: /es/mercado/12 → 2. */
const profundidad = (path: string) => path.split("/").filter(Boolean).length - 1;

/**
 * Marca en <html data-nav> la dirección de la próxima navegación para que globals.css elija la transición:
 * «adelante» al entrar a un detalle (el contenido llega desde la derecha), «atras» al volver (llega desde la
 * izquierda). Las pestañas de la tab bar (data-nav-tab) y las navegaciones programáticas usan el fade-through.
 *
 * «Atrás» (botón de volver o del sistema) llega como `popstate`, y React completa esas navegaciones de forma
 * síncrona, sin View Transition. Por eso se intercepta antes que Next y se repite como `replace` a la misma URL
 * (ya en caché), que sí anima. No se hace con «reducir movimiento» ni si el navegador ya animó el gesto (Safari).
 */
export function DireccionNavegacion() {
  const router = useRouter();
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
    const alVolver = (e: PopStateEvent) => {
      if ((e as PopStateEvent & { hasUAVisualTransition?: boolean }).hasUAVisualTransition) return marcar(null);
      marcar("atras");
      const deNext = (e.state as { __NA?: boolean } | null)?.__NA;
      if (!deNext || !("startViewTransition" in document) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.stopImmediatePropagation();
      const destino = location.pathname + location.search + location.hash;
      startTransition(() => router.replace(destino));
    };

    document.addEventListener("click", alTocar, true);
    // En captura: corre antes que el listener de Next.
    window.addEventListener("popstate", alVolver, { capture: true });
    return () => {
      clearTimeout(limpiar);
      document.removeEventListener("click", alTocar, true);
      window.removeEventListener("popstate", alVolver, { capture: true });
    };
  }, [router]);
  return null;
}
