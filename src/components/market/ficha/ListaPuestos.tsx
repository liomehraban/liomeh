"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Estrellas } from "@/components/market/Estrellas";
import { ICONO_GIRO } from "@/components/market/iconosGiro";
import { useVocabulario } from "@/hooks/useVocabulario";
import { Link } from "@/i18n/navigation";
import { useAhora } from "@/hooks/useAhora";
import { COLOR_GIRO, categoriaGiro } from "@/lib/giros";
import { actividadPuesto } from "@/lib/inventario";
import type { Puesto } from "@/lib/schemas";

/** Puestos en línea del mercado: los mejor calificados primero y el resto al desplegar. */
export function ListaPuestos({ puestos, visibles }: { puestos: Puesto[]; visibles: number }) {
  const t = useTranslations("mercado");
  const tp = useTranslations("puesto");
  const ahora = useAhora();
  const v = useVocabulario();
  const [todos, setTodos] = useState(false);
  const orden = [...puestos].sort((a, b) => Number(b.real_segun_guia) - Number(a.real_segun_guia) || b.rating - a.rating);
  const lista = todos ? orden : orden.slice(0, visibles);
  return (
    <>
      <ul data-revelar className="flex flex-col gap-2">
        {lista.map((p) => {
          const a = ahora ? actividadPuesto(p.id, ahora) : null;
          const cat = categoriaGiro(p.giro);
          const Icono = ICONO_GIRO[cat];
          return (
            <li key={p.id}>
              <Link
                href={`/puesto/${p.id}`}
                className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-white p-3 hover:border-morado focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {/* Ícono del giro (el mismo de los placeholders) en lugar de un punto de color sin leyenda. */}
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full text-white" style={{ background: COLOR_GIRO[cat] }}>
                  <Icono className="size-[18px]" strokeWidth={2} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  {/* La palomita va pegada a la última palabra del nombre: nunca queda sola en un renglón. */}
                  <span className="font-semibold">
                    {p.real_segun_guia ? (
                      <>
                        {p.nombre.slice(0, p.nombre.lastIndexOf(" ") + 1)}
                        <span className="whitespace-nowrap">
                          {p.nombre.slice(p.nombre.lastIndexOf(" ") + 1)}
                          <BadgeCheck className="ml-1 inline size-4 align-[-3px] text-dorado" aria-label={t("realGuia")} />
                        </span>
                      </>
                    ) : (
                      p.nombre
                    )}
                  </span>
                  <span className="text-[13px] leading-snug text-tinta-2">
                    {v("girosPuesto", p.giro)} · {t("productos", { n: p.productos.length })}
                  </span>
                  {!p.num_resenas && (
                    <span className="mt-1 w-fit rounded-pill bg-dorado-200 px-2 py-px text-[12px] leading-tight font-bold text-morado-900">{tp("nuevo")}</span>
                  )}
                  {a && a.pedidosHoy > 0 && <span className="text-[12px] font-semibold text-nopal-700">{t("pedidosHoy", { n: a.pedidosHoy })}</span>}
                </span>
                {p.num_resenas ? <Estrellas rating={p.rating} className="shrink-0" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
      {!todos && orden.length > visibles && (
        <button
          type="button"
          onClick={() => setTodos(true)}
          className="flex min-h-11 items-center gap-2 font-semibold text-morado underline-offset-4 hover:underline"
        >
          {t("verMasPuestos", { n: orden.length })}
          <ChevronDown className="size-4" aria-hidden />
        </button>
      )}
    </>
  );
}
