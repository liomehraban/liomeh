"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocale, useTranslations } from "next-intl";

import { formatMXN } from "@/lib/money";

/**
 * Barras de ventas de la semana: una serie en morado (sin leyenda; el título la nombra),
 * el día de hoy lleva etiqueta directa. Incluye tabla equivalente para lector de pantalla.
 */
export function VentasSemana({ datos, hoy }: { datos: { d: string; v: number }[]; hoy: number }) {
  const t = useTranslations("locatario");
  const locale = useLocale();
  const $ = (n: number) => formatMXN(n, locale);
  const conEtiqueta = datos.map((x, i) => ({ ...x, etiqueta: i === hoy ? `${t("hoy")} ${$(x.v)}` : "" }));
  return (
    <figure className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
      <figcaption className="flex flex-col">
        <span className="font-bold text-morado-700">{t("semana")}</span>
        <span className="text-[12px] text-tinta-2">{t("semanaTexto")}</span>
      </figcaption>
      <div className="h-48" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart accessibilityLayer={false} data={conEtiqueta} margin={{ top: 22, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
            <XAxis dataKey="d" tickLine={false} axisLine={{ stroke: "#EADFE8" }} tick={{ fill: "#4A3848", fontSize: 12 }} />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "#F6ECF5" }}
              formatter={(v) => [$(Number(v)), t("kpis.ventas_mxn")]}
              contentStyle={{ borderRadius: 12, borderColor: "#EADFE8", fontSize: 13 }}
            />
            <Bar dataKey="v" fill="#93408F" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="etiqueta" position="top" fill="#2B1A2A" fontSize={11} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{t("semana")}</caption>
        <tbody>
          {datos.map((x, i) => (
            <tr key={x.d}>
              <th scope="row">{i === hoy ? `${x.d} (${t("hoy")})` : x.d}</th>
              <td>{$(x.v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
