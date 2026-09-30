"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type Altura = "peek" | "mitad" | "completa";
const ORDEN: Altura[] = ["peek", "mitad", "completa"];

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  /** Alto visible en cada punto (px o fracción del contenedor). */
  alturas?: Partial<Record<Altura, number>>;
  inicial?: Altura;
  etiqueta: string;
  etiquetaCerrar: string;
  etiquetaExpandir: string;
  onAltura?: (alto: number) => void;
  className?: string;
};

/**
 * Bottom sheet no modal con handle y 3 alturas (peek, mitad, completa). Se arrastra o se cambia con el handle.
 * Se posiciona `absolute` dentro de su contenedor (el marco del teléfono).
 */
export function BottomSheet({
  abierto,
  onCerrar,
  children,
  alturas,
  inicial = "peek",
  etiqueta,
  etiquetaCerrar,
  etiquetaExpandir,
  onAltura,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [contenedor, setContenedor] = useState(0);
  const [altura, setAltura] = useState<Altura>(inicial);
  // Al reabrir, vuelve a la altura inicial (ajuste durante el render, sin efecto).
  const [abiertoPrevio, setAbiertoPrevio] = useState(abierto);
  if (abierto !== abiertoPrevio) {
    setAbiertoPrevio(abierto);
    if (abierto) setAltura(inicial);
  }
  const reducir = useReducedMotion();
  const y = useMotionValue(10000);

  useEffect(() => {
    const padre = ref.current?.parentElement;
    if (!padre) return;
    const ro = new ResizeObserver(() => setContenedor(padre.clientHeight));
    ro.observe(padre);
    return () => ro.disconnect();
  }, []);

  const px = (a: Altura) => {
    const v = { peek: 190, mitad: 0.5, completa: 0.92, ...alturas }[a];
    return v <= 1 ? v * contenedor : v;
  };
  const alto = px("completa");
  const destino = abierto ? alto - px(altura) : alto + 40;

  useEffect(() => {
    if (!contenedor) return;
    const ctrl = animate(y, destino, reducir ? { duration: 0 } : { type: "spring", damping: 32, stiffness: 320 });
    if (abierto) onAltura?.(px(altura));
    return () => ctrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destino, contenedor, abierto]);


  // Accesibilidad: al abrir, el foco pasa a la hoja; Escape la cierra; al cerrar, el foco vuelve a donde estaba.
  const cerrarRef = useRef(onCerrar);
  useEffect(() => {
    cerrarRef.current = onCerrar;
  });
  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrarRef.current();
    document.addEventListener("keydown", alTeclear);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", alTeclear);
      if (previo?.isConnected && previo !== document.body) previo.focus({ preventScroll: true });
    };
  }, [abierto]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const visible = alto - y.get() - info.velocity.y * 0.15;
    if (visible < px("peek") * 0.6) return onCerrar();
    const mas = ORDEN.reduce((a, b) => (Math.abs(px(b) - visible) < Math.abs(px(a) - visible) ? b : a));
    setAltura(mas);
    animate(y, alto - px(mas), { type: "spring", damping: 32, stiffness: 320 });
  };

  const siguiente = () => setAltura(ORDEN[(ORDEN.indexOf(altura) + 1) % ORDEN.length]);

  // Deslizar sobre el contenido (no solo sobre el handle): hacia arriba sube la hoja un punto; hacia abajo,
  // estando el contenido hasta arriba, la baja (y desde el punto más bajo, la cierra). Como Maps/Uber.
  const toque = useRef<{ y: number; arriba: boolean; t: number } | null>(null);
  const alTocar = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest(".carrusel, .fila-chips, input, textarea")) return (toque.current = null);
    toque.current = { y: e.touches[0].clientY, arriba: e.currentTarget.scrollTop <= 0, t: Date.now() };
  };
  const alSoltar = (e: React.TouchEvent<HTMLDivElement>) => {
    const t0 = toque.current;
    toque.current = null;
    if (!t0 || Date.now() - t0.t > 700) return;
    const dy = e.changedTouches[0].clientY - t0.y;
    const i = ORDEN.indexOf(altura);
    if (dy < -36 && i < ORDEN.length - 1) setAltura(ORDEN[i + 1]);
    else if (dy > 56 && t0.arriba) {
      if (i === 0) onCerrar();
      else setAltura(ORDEN[i - 1]);
    }
  };

  return (
    <motion.section
      ref={ref}
      role="dialog"
      aria-modal={false}
      aria-label={etiqueta}
      aria-hidden={!abierto}
      data-hoja-abierta={abierto || undefined}
      inert={!abierto}
      tabIndex={-1}
      style={{ y, height: alto || undefined }}
      drag="y"
      dragListener={false}
      className={cn(
        "absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-card outline-none border-t border-border bg-crema shadow-[0_-8px_30px_rgba(62,28,60,0.18)]",
        !contenedor && "invisible",
        className,
      )}
    >
      <motion.div
        className="flex shrink-0 cursor-grab touch-none justify-center pt-1 active:cursor-grabbing"
        onPan={(_, info) => y.set(Math.max(0, y.get() + info.delta.y))}
        onPanEnd={onDragEnd}
      >
        <button
          type="button"
          onClick={siguiente}
          aria-label={etiquetaExpandir}
          className="grid h-11 w-24 place-items-center rounded-pill focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span aria-hidden className="h-1.5 w-12 rounded-pill bg-gris/50" />
        </button>
      </motion.div>
      <button
        type="button"
        onClick={onCerrar}
        aria-label={etiquetaCerrar}
        className="absolute top-2 right-3 grid size-11 place-items-center rounded-pill text-tinta-2 hover:bg-morado-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <XIcon className="size-5" aria-hidden />
      </button>
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(var(--asoma,0px)+1.5rem)]"
        onTouchStart={alTocar}
        onTouchEnd={alSoltar}
      >
        {children}
      </div>
    </motion.section>
  );
}
