"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Monta `children` cuando el contenedor entra en pantalla: las gráficas bajo el pliegue no cuestan al cargar
 * y su animación de entrada se ve completa.
 */
export function AlVerse({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setVisto(true), 0);
      return () => clearTimeout(id);
    }
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisto(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={style} aria-hidden>
      {visto ? children : null}
    </div>
  );
}
