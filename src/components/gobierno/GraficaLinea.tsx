"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AlVerse } from "./AlVerse";

export type SerieLinea = { clave: string; nombre: string; color: string };

/**
 * Línea de una o dos series sobre un solo eje. Con una serie no hay leyenda (el título la nombra);
 * con dos, leyenda arriba. El último punto lleva etiqueta directa. Incluye tabla para lector de pantalla.
 */
export function GraficaLinea({
  titulo,
  subtitulo,
  datos,
  series,
  x,
  formato,
  encabezadoX,
}: {
  titulo: string;
  subtitulo?: string;
  datos: Record<string, string | number>[];
  series: SerieLinea[];
  x: string;
  formato: (n: number) => string;
  encabezadoX: string;
}) {
  const ultimo = datos.length - 1;
  return (
    <figure className="flex min-w-0 flex-col gap-2 rounded-card border border-border bg-white p-4">
      <figcaption className="flex flex-col">
        <span className="font-bold text-morado-700">{titulo}</span>
        {subtitulo && <span className="text-[12px] text-tinta-2">{subtitulo}</span>}
      </figcaption>
      {series.length > 1 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-tinta-2">
          {series.map((s) => (
            <li key={s.clave} className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} aria-hidden />
              {s.nombre}
            </li>
          ))}
        </ul>
      )}
      <AlVerse className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart accessibilityLayer={false} data={datos} margin={{ top: 22, right: 40, bottom: 0, left: 4 }}>
            <CartesianGrid vertical={false} stroke="#EFE6EE" />
            <XAxis dataKey={x} tickLine={false} axisLine={{ stroke: "#EADFE8" }} tick={{ fill: "#4A3848", fontSize: 11 }} interval="preserveStartEnd" minTickGap={12} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#4A3848", fontSize: 11 }} tickFormatter={(v) => formato(Number(v))} width={52} />
            <Tooltip
              formatter={(v, n) => [formato(Number(v)), series.find((s) => s.clave === n)?.nombre ?? String(n)]}
              contentStyle={{ borderRadius: 12, borderColor: "#EADFE8", fontSize: 13 }}
            />
            {series.map((s) => (
              <Line
                key={s.clave}
                type="monotone"
                dataKey={s.clave}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: "#FFFFFF", strokeWidth: 2 }}
                isAnimationActive={false}
                label={(p: { index?: number; x?: unknown; y?: unknown; value?: unknown }) =>
                  p.index === ultimo ? (
                    <text key={s.clave} x={Number(p.x)} y={Number(p.y) - 10} textAnchor="middle" fill="#2B1A2A" fontSize={11} fontWeight={700}>
                      {formato(Number(p.value))}
                    </text>
                  ) : (
                    <g key={`${s.clave}-${p.index}`} />
                  )
                }
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </AlVerse>
      <table className="sr-only">
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">{encabezadoX}</th>
            {series.map((s) => (
              <th key={s.clave} scope="col">
                {s.nombre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((d) => (
            <tr key={String(d[x])}>
              <th scope="row">{d[x]}</th>
              {series.map((s) => (
                <td key={s.clave}>{formato(Number(d[s.clave]))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
