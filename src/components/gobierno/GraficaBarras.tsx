"use client";

import { BarraAnimada } from "@/components/motion/BarraAnimada";

/**
 * Barras horizontales de una serie: nombre y valor arriba, barra a todo lo ancho debajo. En móvil los nombres
 * largos de alcaldía («La Magdalena Contreras») caben completos. Las barras crecen al aparecer; la lista es
 * legible para lector de pantalla tal cual (nombre y valor en texto).
 */
export function GraficaBarras({
  titulo,
  subtitulo,
  datos,
  formato,
  color = "#9B2694",
  encabezado,
}: {
  titulo: string;
  subtitulo?: string;
  datos: { nombre: string; valor: number }[];
  formato: (n: number) => string;
  color?: string;
  encabezado: string;
}) {
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <figure className="flex min-w-0 flex-col gap-3 rounded-card border border-border bg-white p-4">
      <figcaption className="flex flex-col">
        <span className="font-bold text-morado-700">{titulo}</span>
        {subtitulo && <span className="text-[12px] text-tinta-2">{subtitulo}</span>}
      </figcaption>
      <ol className="flex flex-col gap-2.5" aria-label={`${titulo} · ${encabezado}`}>
        {datos.map((d, i) => (
          <li key={d.nombre} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="min-w-0 font-semibold text-tinta">{d.nombre}</span>
              <span className="shrink-0 font-bold text-tinta-2 tabular-nums">{formato(d.valor)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-pill bg-morado-50" aria-hidden>
              <BarraAnimada pct={(d.valor / max) * 100} color={color} retraso={Math.min(i, 8) * 0.05} />
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
