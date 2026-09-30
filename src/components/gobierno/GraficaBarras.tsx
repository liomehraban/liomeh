"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useReducedMotion } from "motion/react";

import { AlVerse } from "./AlVerse";

/** Barras horizontales de una serie (sin leyenda), con el valor como etiqueta directa y tabla accesible. */
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
  const animar = !useReducedMotion();
  return (
    <figure className="flex min-w-0 flex-col gap-2 rounded-card border border-border bg-white p-4">
      <figcaption className="flex flex-col">
        <span className="font-bold text-morado-700">{titulo}</span>
        {subtitulo && <span className="text-[12px] text-tinta-2">{subtitulo}</span>}
      </figcaption>
      <AlVerse style={{ height: datos.length * 34 + 8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer={false} data={datos} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap={6}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="nombre" width={128} tickLine={false} axisLine={false} tick={{ fill: "#2B1A2A", fontSize: 12 }} />
            <Tooltip cursor={{ fill: "#F8E9F6" }} formatter={(v) => [formato(Number(v)), titulo]} contentStyle={{ borderRadius: 12, borderColor: "#EADFE8", fontSize: 13 }} />
            <Bar dataKey="valor" fill={color} radius={[0, 4, 4, 0]} isAnimationActive={animar} animationDuration={900} animationEasing="ease-out">
              <LabelList dataKey="valor" position="right" fill="#4A3848" fontSize={11} fontWeight={700} formatter={(v) => formato(Number(v))} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AlVerse>
      <table className="sr-only">
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">{encabezado}</th>
            <th scope="col">{titulo}</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((d) => (
            <tr key={d.nombre}>
              <th scope="row">{d.nombre}</th>
              <td>{formato(d.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
