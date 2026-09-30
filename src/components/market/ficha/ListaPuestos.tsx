"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Estrellas } from "@/components/market/Estrellas";
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
  const [todos, setTodos] = useState(false);
  const orden = [...puestos].sort((a, b) => Number(b.real_segun_guia) - Number(a.real_segun_guia) || b.rating - a.rating);
  const lista = todos ? orden : orden.slice(0, visibles);
  return (
    <>
      <ul data-revelar className="flex flex-col gap-2">
        {lista.map((p) => {
          const a = ahora ? actividadPuesto(p.id, ahora) : null;
          return (
            <li key={p.id}>
              <Link
                href={`/puesto/${p.id}`}
                className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-white p-3 hover:border-morado focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ background: COLOR_GIRO[categoriaGiro(p.giro)] }} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {p.nombre}
                    {p.real_segun_guia && <BadgeCheck className="size-4 shrink-0 text-dorado" aria-label={t("realGuia")} />}
                  </span>
                  <span className="truncate text-[13px] text-tinta-2">
                    {p.giro} · {t("productos", { n: p.productos.length })}
                  </span>
                  {a && a.pedidosHoy > 0 && <span className="text-[12px] font-semibold text-nopal-700">{t("pedidosHoy", { n: a.pedidosHoy })}</span>}
                </span>
                {p.num_resenas ? (
                  <Estrellas rating={p.rating} />
                ) : (
                  <span className="shrink-0 rounded-pill bg-dorado-200 px-2 py-0.5 text-xs font-bold text-morado-900">{tp("nuevo")}</span>
                )}
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
