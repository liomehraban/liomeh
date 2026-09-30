import type { ReactNode } from "react";

/** Encabezado morado con papel picado para las vistas de locatario y productor. */
export function EncabezadoPerfil({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children?: ReactNode }) {
  return (
    <header className="relative bg-morado px-5 pt-16 pb-5 text-crema">
      <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
      <h1 className="font-display text-4xl leading-none">{titulo}</h1>
      {subtitulo && <p className="mt-1 text-sm text-crema/90">{subtitulo}</p>}
      {children}
    </header>
  );
}
