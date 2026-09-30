"use client";

import { useRef, useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { usePathname, useRouter } from "@/i18n/navigation";
import { refrescarAhora } from "@/hooks/useAhora";
import { cn } from "@/lib/utils";

/** Evento que escuchan los motores simulados (avisos, pedidos) para revisar novedades al instante. */
export const EVENTO_ACTUALIZAR = "barabara:actualizar";

/** Pantallas con mapa: el arrastre es del mapa, no se jala para actualizar. */
const SIN_JALAR = [/^\/explorar/, /^\/huertos$/, /^\/mercado\/[^/]+\/interior/, /^\/asistente/];
/** Zonas donde el arrastre es de otra cosa (mapas, carruseles, listas con scroll propio, campos). */
const ZONA_PROPIA = ".maplibregl-canvas, .maplibregl-canvas-container, .carrusel, .fila-chips, input, textarea, select, [data-sin-jalar]";
const UMBRAL = 64;
const MAXIMO = 104;

/**
 * Contenedor con scroll de la app con «jalar para actualizar» (dedo o mouse, desde arriba del todo).
 * Actualiza los datos del servidor, recalcula inventario y actividad con la hora actual y revisa
 * avisos y pedidos nuevos.
 */
export function MainActualizable({ children, className }: { children: ReactNode; className?: string }) {
  const t = useTranslations("comun");
  const router = useRouter();
  const pathname = usePathname();
  const reducido = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inicio = useRef<{ x: number; y: number } | null>(null);
  /** Eje decidido en los primeros píxeles: solo un gesto claramente vertical jala la pantalla. */
  const eje = useRef<"x" | "y" | null>(null);
  const [tiron, setTiron] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const desactivado = SIN_JALAR.some((r) => r.test(pathname));

  const empezar = (x: number, y: number, objetivo: EventTarget | null) => {
    if (desactivado || cargando || (ref.current?.scrollTop ?? 1) > 0) return;
    // Si el dedo empieza dentro de algo con scroll propio que no está hasta arriba, o de un mapa/carrusel, no es nuestro.
    for (let n = objetivo instanceof Element ? objetivo : null; n && n !== ref.current; n = n.parentElement) {
      if (n.matches(ZONA_PROPIA)) return;
      if (n.scrollTop > 0) return;
    }
    inicio.current = { x, y };
    eje.current = null;
  };
  const mover = (x: number, y: number) => {
    if (inicio.current === null) return;
    const dx = x - inicio.current.x;
    const d = y - inicio.current.y;
    if (eje.current === null) {
      if (Math.abs(dx) < 8 && Math.abs(d) < 8) return;
      eje.current = Math.abs(dx) > Math.abs(d) ? "x" : "y";
    }
    if (eje.current === "x") return;
    if (d <= 0) {
      setTiron(0);
      return;
    }
    setArrastrando(true);
    setTiron(Math.min(MAXIMO, d * 0.5));
  };
  const soltar = () => {
    if (inicio.current === null) return;
    inicio.current = null;
    eje.current = null;
    setArrastrando(false);
    if (tiron >= UMBRAL) void actualizar();
    else setTiron(0);
  };

  const actualizar = async () => {
    setCargando(true);
    setTiron(48);
    router.refresh();
    refrescarAhora();
    window.dispatchEvent(new Event(EVENTO_ACTUALIZAR));
    await new Promise((r) => setTimeout(r, 900));
    setCargando(false);
    setTiron(0);
    toast(t("actualizado"));
  };

  const listo = tiron >= UMBRAL;
  return (
    <main
      ref={ref}
      id="contenido"
      className={cn(className, arrastrando && "select-none")}
      onTouchStart={(e) => empezar(e.touches[0].clientX, e.touches[0].clientY, e.target)}
      onTouchMove={(e) => mover(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={soltar}
      onTouchCancel={soltar}
      onMouseDown={(e) => e.button === 0 && empezar(e.clientX, e.clientY, e.target)}
      onMouseMove={(e) => mover(e.clientX, e.clientY)}
      onMouseUp={soltar}
      onMouseLeave={soltar}
    >
      {!desactivado && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center" style={{ height: tiron }}>
          {tiron > 8 && (
            <span className="mt-2 grid size-10 place-items-center self-start rounded-full bg-white text-morado shadow-md">
              <RefreshCw
                className={cn("size-5", cargando && !reducido && "animate-spin")}
                style={cargando || reducido ? undefined : { transform: `rotate(${tiron * 3}deg)` }}
              />
            </span>
          )}
        </div>
      )}
      {desactivado ? (
        children
      ) : (
        // h-full: las pantallas de alto completo (chat, cobro) siguen midiendo contra el contenedor.
        <div
          className="h-full"
          style={{ transform: tiron ? `translateY(${tiron}px)` : undefined, transition: arrastrando || reducido ? "none" : "transform 200ms ease-out" }}
        >
          {children}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {cargando ? t("actualizando") : listo && arrastrando ? t("soltar") : ""}
      </p>
    </main>
  );
}
