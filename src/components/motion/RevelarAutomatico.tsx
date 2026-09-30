"use client";

import { useEffect } from "react";

const SELECTOR = "[data-revelar] > *";

/**
 * Revelado escalonado para listas: los hijos directos de cualquier elemento con `data-revelar` aparecen
 * (fundido + 14 px) la primera vez que entran en pantalla, 50 ms uno tras otro (tope en el 8.º). También
 * cubre los que se agregan después (mensajes del chat, pedidos nuevos). El CSS vive en globals.css y solo
 * oculta mientras este componente está activo (`data-revelar-listo`), así sin JS todo se ve. Lo que ya está
 * en pantalla al abrir la app se muestra sin animar, para no parpadear.
 */
export function RevelarAutomatico() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    const raiz = document.documentElement;
    const vistos = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entradas) => {
        let i = 0;
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.style.setProperty("--i", String(Math.min(i++, 8)));
          el.dataset.visto = "anim";
          io.unobserve(el);
        }
      },
      { threshold: 0.05 },
    );
    const observar = (el: Element) => {
      if (vistos.has(el)) return;
      vistos.add(el);
      io.observe(el);
    };

    // Lo visible al arrancar se marca directo (sin animación) antes de activar el ocultamiento.
    for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
      const r = el.getBoundingClientRect();
      vistos.add(el);
      if (r.top < innerHeight && r.bottom > 0) el.dataset.visto = "";
      else io.observe(el);
    }
    raiz.dataset.revelarListo = "";

    const mo = new MutationObserver((cambios) => {
      for (const c of cambios)
        for (const n of c.addedNodes) {
          if (!(n instanceof Element)) continue;
          if (n.parentElement?.hasAttribute("data-revelar")) observar(n);
          n.querySelectorAll(SELECTOR).forEach(observar);
        }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      delete raiz.dataset.revelarListo;
    };
  }, []);
  return null;
}
