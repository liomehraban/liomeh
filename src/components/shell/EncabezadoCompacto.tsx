"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Barra superior compacta (como el «large title» de iOS): cuando el <h1> de la pantalla sale de vista al
 * hacer scroll, aparece fija arriba con el mismo título. El título es un duplicado visual del h1 (oculto a
 * lectores); el botón de volver delega en el de la pantalla.
 */
export function EncabezadoCompacto({ contenedorId }: { contenedorId: string }) {
  const pathname = usePathname();
  const [titulo, setTitulo] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  // Si la pantalla tiene botón de volver (data-volver), la barra compacta ofrece el suyo, como en nativo.
  const [volver, setVolver] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const cont = document.getElementById(contenedorId);
    if (!cont) return;
    let io: IntersectionObserver | undefined;
    // Espera un cuadro a que la pantalla nueva pinte su h1.
    const raf = requestAnimationFrame(() => {
      const h1 = cont.querySelector("h1");
      setTitulo(h1?.textContent?.trim() || null);
      setVolver(cont.querySelector<HTMLButtonElement>("button[data-volver]"));
      setVisible(false);
      if (!h1) return;
      io = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0)), {
        root: cont,
        rootMargin: "-56px 0px 0px 0px",
      });
      io.observe(h1);
    });
    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [contenedorId, pathname]);

  if (!titulo) return null;
  return (
    <div
      inert={!visible}
      className={cn(
        "absolute inset-x-0 top-0 z-[35] flex h-[calc(4.25rem+env(safe-area-inset-top))] items-center gap-3 bg-morado px-4 pt-[env(safe-area-inset-top)] pr-28 text-crema shadow-md transition-[translate,opacity] duration-200 ease-out",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0",
      )}
    >
      {volver && (
        <button
          type="button"
          onClick={() => volver.click()}
          aria-label={volver.getAttribute("aria-label") ?? undefined}
          className="pressable grid size-11 shrink-0 place-items-center rounded-pill bg-white text-morado shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
      )}
      <span aria-hidden className="truncate pt-1 font-display text-[28px] leading-none">
        {titulo}
      </span>
    </div>
  );
}
