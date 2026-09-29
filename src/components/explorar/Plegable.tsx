"use client";

import { useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/** Sección plegable de los carruseles inferiores de Explorar. */
export function Plegable({
  titulo,
  icono,
  abierto,
  onToggle,
  children,
  extra,
}: {
  titulo: string;
  icono: ReactNode;
  abierto: boolean;
  onToggle: () => void;
  children: ReactNode;
  extra?: ReactNode;
}) {
  const t = useTranslations("explorar");
  const id = useId();
  return (
    <section className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={t(abierto ? "ocultar" : "mostrar", { seccion: titulo })}
        className="flex min-h-11 items-center gap-2 px-4 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {icono}
        <span className="font-bold text-morado-700">{titulo}</span>
        {extra}
        <ChevronDown className={cn("ml-auto size-5 text-tinta-2 transition-transform", abierto && "rotate-180")} aria-hidden />
      </button>
      <div id={id} hidden={!abierto}>
        {children}
      </div>
    </section>
  );
}
