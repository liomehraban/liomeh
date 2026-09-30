"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Tamaño del título según su largo (Bebas Neue es condensada): los nombres largos bajan de tamaño en vez de
 * cortarse, y los muy largos usan hasta dos líneas. El recorte con «…» queda solo como último recurso.
 */
function claseTituloCompacto(titulo: string) {
  const n = titulo.length;
  if (n <= 14) return "text-[28px] truncate";
  if (n <= 20) return "text-[24px] truncate";
  return "text-[20px] leading-[1.05] line-clamp-2 break-words";
}

/** Franja superior que ocupan los controles flotantes (campana y perfil): 12 px + 44 px + aire. */
const FRANJA_CONTROLES = 64;

/**
 * Barra superior compacta (como el «large title» de iOS): en cuanto el <h1> de la pantalla empieza a pasar
 * por debajo de los controles flotantes al hacer scroll, aparece fija arriba con el mismo título. El título es
 * un duplicado visual del h1 (oculto a lectores); el botón de volver delega en el de la pantalla (data-volver).
 * Vuelve a buscar el h1 cuando la pantalla cambia sin navegar (p. ej. Cobrar → QR).
 */
export function EncabezadoCompacto({ contenedorId }: { contenedorId: string }) {
  const pathname = usePathname();
  const [titulo, setTitulo] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [volver, setVolver] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const cont = document.getElementById(contenedorId);
    if (!cont) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const h1 = cont.querySelector("h1");
      // Espacios colapsados: sin dobles espacios ni un espacio suelto antes de la elipsis.
      setTitulo(h1?.textContent?.replace(/\s+/g, " ").trim() || null);
      setVolver(cont.querySelector<HTMLButtonElement>("button[data-volver]"));
      if (!h1 || cont.scrollTop <= 0) return setVisible(false);
      const tope = cont.getBoundingClientRect().top + FRANJA_CONTROLES;
      setVisible(h1.getBoundingClientRect().top < tope);
    };
    const programar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    programar();
    cont.addEventListener("scroll", programar, { passive: true });
    const mo = new MutationObserver(programar);
    mo.observe(cont, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(raf);
      cont.removeEventListener("scroll", programar);
      mo.disconnect();
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
      <span aria-hidden className={cn("min-w-0 pt-1 font-display leading-none", claseTituloCompacto(titulo))}>
        {titulo}
      </span>
    </div>
  );
}
