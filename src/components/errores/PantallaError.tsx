import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { MarchantaIlustracion } from "@/components/assistant/MarchantaIlustracion";

/** Pantalla de estado (404, error): papel picado, ícono, título, texto y acciones. */
export function PantallaError({ icono: Icono, titulo, texto, children }: { icono: LucideIcon; titulo: string; texto: string; children: ReactNode }) {
  return (
    <main id="contenido" className="relative flex h-full min-h-dvh flex-col items-center justify-center gap-5 overflow-y-auto bg-crema px-6 text-center md:min-h-0">
      <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
      <span className="relative" aria-hidden>
        <MarchantaIlustracion className="w-40" />
        <span className="absolute right-0 bottom-1 grid size-12 place-items-center rounded-full bg-morado text-crema ring-4 ring-crema">
          <Icono className="size-6" />
        </span>
      </span>
      <h1 className="font-display text-4xl text-morado-700">{titulo}</h1>
      <p className="text-tinta-2">{texto}</p>
      <div className="flex w-full max-w-xs flex-col gap-2">{children}</div>
    </main>
  );
}
