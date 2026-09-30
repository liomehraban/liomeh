"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Estrellas } from "@/components/market/Estrellas";
import { precioJusto } from "@/lib/fairtrade";
import { formatMXN } from "@/lib/money";
import type { Productor } from "@/lib/schemas";

export function FichaProductorRapida({ p }: { p: Productor }) {
  const t = useTranslations();
  const locale = useLocale();
  const f = precioJusto(p);
  const km = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: 1 }).format(p.km_a_la_merced);
  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="pr-10">
        <p className="text-[13px] font-semibold text-nopal-700">
          {p.pueblo}, {p.alcaldia}
        </p>
        <h2 className="font-display text-[30px] text-morado-700">{p.nombre}</h2>
        <p className="text-sm text-tinta-2">{t("productor.titular", { titular: p.titular })}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <Estrellas rating={p.rating} total={p.num_resenas} />
        <span className="text-tinta-2">{t("huertos.desdeMerced", { km })}</span>
      </div>
      <p className="text-sm">
        <strong>{p.producto_principal}</strong> · {formatMXN(p.precio_mayoreo_app.precio, locale)}/{p.precio_mayoreo_app.unidad}
      </p>
      <p className="rounded-2xl bg-dorado-200/60 p-3 text-sm">
        {t("fairtrade.conApp")}: <strong>{formatMXN(f.recibe, locale)}</strong> ({f.pctApp}%) · {t("fairtrade.conIntermediarios")}: {formatMXN(f.antes, locale)} ({f.pctIntermediarios}%)
      </p>
      <Button asChild>
        <Link href={`/huertos/${p.id}`}>{t("huertos.verProductor")}</Link>
      </Button>
    </div>
  );
}
