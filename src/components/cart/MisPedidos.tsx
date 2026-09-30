"use client";

import { ChevronRight, Receipt } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { PuestoResumen } from "@/data/comercio";
import { formatMXN } from "@/lib/money";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/** Yo › Mis pedidos. */
export function MisPedidos({ puestos }: { puestos: Record<string, PuestoResumen> }) {
  const t = useTranslations("yoPedidos");
  const locale = useLocale();
  const hydrated = useHydrated();
  const pedidos = useAppStore((s) => s.pedidos);
  const vendedores = useAppStore((s) => s.vendedores);
  if (!hydrated) return null;
  return (
    <section aria-labelledby="mis-pedidos" className="flex flex-col gap-3 rounded-card border border-border bg-white p-5">
      <h2 id="mis-pedidos" className="text-xl font-bold text-morado-700">
        {t("titulo")}
      </h2>
      {pedidos.length === 0 ? (
        <p className="text-tinta-2">{t("vacio")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {pedidos.map((p) => (
            <li key={p.folio}>
              <Link href={`/pedido/${p.folio}`} aria-label={t("ver", { folio: p.folio })} className="flex min-h-11 items-center gap-3 py-2">
                <Receipt className="size-5 shrink-0 text-morado" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold">{p.folio}</span>
                  <span className="truncate text-[13px] text-tinta-2">
                    {(puestos[p.puestoId] ?? vendedores[p.puestoId])?.nombre ?? p.puestoId} ·{" "}
                    {new Date(p.fecha).toLocaleDateString(locale === "en" ? "en-US" : "es-MX", { day: "numeric", month: "short", timeZone: "America/Mexico_City" })}
                  </span>
                </span>
                <span className="font-bold">{formatMXN(p.total, locale)}</span>
                <ChevronRight className="size-4 text-gris" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
