import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Pantalla de estado (404, error): papel picado, ícono, título, texto y acciones. */
export function PantallaError({
  icono: Icono,
  titulo,
  texto,
  children,
  sinControles = false,
}: {
  icono: LucideIcon;
  titulo: string;
  texto: string;
  children: ReactNode;
  /** Oculta la campana y el selector de perfil flotantes (pantallas sin contexto de perfil, como el 404). */
  sinControles?: boolean;
}) {
  return (
    <main id="contenido" data-sin-controles={sinControles || undefined} className="relative flex h-full min-h-dvh flex-col items-center justify-center gap-5 overflow-y-auto bg-crema px-6 text-center md:min-h-0">
      <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
      <span className="grid size-20 place-items-center rounded-full bg-morado text-crema" aria-hidden>
        <Icono className="size-9" />
      </span>
      <h1 className="font-display text-4xl text-morado-700">{titulo}</h1>
      <p className="text-tinta-2">{texto}</p>
      <div className="flex w-full max-w-xs flex-col gap-2">{children}</div>
    </main>
  );
}
