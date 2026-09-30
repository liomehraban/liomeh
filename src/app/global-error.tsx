"use client";

import "./globals.css";

/**
 * Último recurso si falla el layout raíz: aquí no hay next-intl ni store, así que el texto va en
 * ambos idiomas (única excepción a la regla de strings en messages/*.json).
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es">
      <body className="bg-crema text-tinta">
        <title>Bara Bara</title>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-5xl font-bold text-morado-700">Bara Bara</p>
          <h1 className="text-xl font-bold">Algo salió mal · Something went wrong</h1>
          <p className="text-tinta-2">Intenta de nuevo en un momento. · Please try again in a moment.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => retry()} className="min-h-11 rounded-full bg-morado px-5 font-semibold text-crema">
              Reintentar · Retry
            </button>
            {/* Recarga completa a propósito: el layout raíz falló. */}
            {/* eslint-disable-next-line @next/next/no-location-assign-relative-destination */}
            <button type="button" onClick={() => (window.location.href = "/")} className="min-h-11 rounded-full border border-morado px-5 font-semibold text-morado">
              Inicio · Home
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
