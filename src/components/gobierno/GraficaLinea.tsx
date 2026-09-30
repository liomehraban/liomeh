"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { AlVerse } from "./AlVerse";

export type SerieLinea = { clave: string; nombre: string; color: string };

/**
 * Línea de una o dos series sobre un solo eje. Con una serie no hay leyenda (el título la nombra);
 * con dos, leyenda arriba. Con `hoy` (índice del mes de los KPI) marca ese mes con una línea vertical, dibuja
 * sólido lo transcurrido y punteada la proyección, y rotula el valor de hoy y el del final del escenario.
 * Incluye tabla para lector de pantalla.
 */
export function GraficaLinea({
  titulo,
  subtitulo,
  datos,
  series,
  x,
  formato,
  encabezadoX,
  hoy,
  className,
}: {
  titulo: string;
  subtitulo?: string;
  datos: Record<string, string | number>[];
  series: SerieLinea[];
  x: string;
  formato: (n: number) => string;
  encabezadoX: string;
  hoy?: number;
  /** Con `h-full` o `flex-1` la tarjeta llena su fila y la gráfica crece con ella (mínimo 13 rem). */
  className?: string;
}) {
  const t = useTranslations("gobierno.serie");
  const animar = !useReducedMotion();
  const ultimo = datos.length - 1;
  const corte = hoy ?? ultimo;
  // Cada serie se parte en dos claves: real (hasta hoy) y proyección (desde hoy), para trazar cada tramo distinto.
  const vis = datos.map((d, i) => {
    const r: Record<string, string | number | null> = { ...d };
    for (const s of series) {
      r[`${s.clave}__real`] = i <= corte ? d[s.clave] : null;
      r[`${s.clave}__proy`] = i >= corte ? d[s.clave] : null;
    }
    return r;
  });
  const etiqueta = (clave: string, indice: number, fuerte: boolean) =>
    function Etiqueta(p: { index?: number; x?: unknown; y?: unknown; value?: unknown }) {
      return p.index === indice && p.value != null ? (
        // El valor de hoy va a la izquierda de su línea vertical para no cruzarla.
        <text
          key={`${clave}-${indice}`}
          x={Number(p.x) + (fuerte && indice < ultimo ? -6 : 0)}
          y={Number(p.y) - 10}
          textAnchor={fuerte && indice < ultimo ? "end" : "middle"}
          fill={fuerte ? "#2B1A2A" : "#4A3848"} fontSize={11} fontWeight={fuerte ? 700 : 600}>
          {formato(Number(p.value))}
        </text>
      ) : (
        <g key={`${clave}-${p.index}`} />
      );
    };
  return (
    <figure className={cn("flex min-w-0 flex-col gap-2 rounded-card border border-border bg-white p-4", className)}>
      <figcaption className="flex flex-col">
        <span className="font-bold text-morado-700">{titulo}</span>
        {subtitulo && <span className="text-[12px] text-tinta-2">{subtitulo}</span>}
        {hoy !== undefined && hoy < ultimo && <span className="text-[12px] text-tinta-2">{t("proyeccion")}</span>}
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
      {/* La gráfica ocupa todo el alto libre de la tarjeta; el absoluto le da siempre un alto definido. */}
      <AlVerse className="relative min-h-52 flex-1">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart accessibilityLayer={false} data={vis} margin={{ top: 22, right: 40, bottom: 0, left: 4 }}>
              <CartesianGrid vertical={false} stroke="#EFE6EE" />
              <XAxis dataKey={x} tickLine={false} axisLine={{ stroke: "#EADFE8" }} tick={{ fill: "#4A3848", fontSize: 11 }} interval="preserveStartEnd" minTickGap={12} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#4A3848", fontSize: 11 }} tickFormatter={(v) => formato(Number(v))} width={52} />
              <Tooltip
                formatter={(v, n) => [formato(Number(v)), series.find((s) => String(n).startsWith(s.clave))?.nombre ?? String(n)]}
                contentStyle={{ borderRadius: 12, borderColor: "#EADFE8", fontSize: 13 }}
              />
              {hoy !== undefined && hoy < ultimo && (
                <ReferenceLine
                  x={String(datos[hoy][x])}
                  stroke="#6E1A6A"
                  strokeDasharray="2 3"
                  label={{ value: t("hoy"), position: "insideTopLeft", fill: "#6E1A6A", fontSize: 11, fontWeight: 700 }}
                />
              )}
              {series.flatMap((s) => [
                <Line
                  key={`${s.clave}__real`}
                  type="monotone"
                  dataKey={`${s.clave}__real`}
                  stroke={s.color}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 5, stroke: "#FFFFFF", strokeWidth: 2 }}
                  isAnimationActive={animar}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  label={etiqueta(s.clave, corte, true)}
                />,
                ...(corte < ultimo
                  ? [
                      <Line
                        key={`${s.clave}__proy`}
                        type="monotone"
                        dataKey={`${s.clave}__proy`}
                        stroke={s.color}
                        strokeOpacity={0.55}
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        dot={false}
                        connectNulls={false}
                        activeDot={{ r: 4, stroke: "#FFFFFF", strokeWidth: 2 }}
                        isAnimationActive={animar}
                        animationBegin={900}
                        animationDuration={700}
                        animationEasing="ease-out"
                        label={etiqueta(`${s.clave}-p`, ultimo, false)}
                      />,
                    ]
                  : []),
              ])}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AlVerse>
      {/* La tabla va dentro de un div sr-only: una <table> no se encoge a 1 px y desbordaba la página a lo ancho. */}
      <div className="sr-only">
        <table>
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
      </div>
    </figure>
  );
}
