"use client";

import { Sprout } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Estrellas } from "@/components/market/Estrellas";
import { useVocabulario } from "@/hooks/useVocabulario";
import { formatMXN } from "@/lib/money";
import type { Productor } from "@/lib/schemas";
import { cn } from "@/lib/utils";

/** Tarjeta compacta de productor (carrusel y listas). */
export function TarjetaProductor({ p, className }: { p: Productor; className?: string }) {
  const t = useTranslations("huertos");
  const locale = useLocale();
  const v = useVocabulario();
  return (
    <Link
      href={`/huertos/${p.id}`}
      className={cn(
        "flex items-center gap-3 rounded-card border border-border bg-white p-2 pr-3 shadow-sm hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-nopal text-crema" aria-hidden>
        <Sprout className="size-7" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-bold text-morado-700">{p.nombre}</span>
        <span className="truncate text-[13px] text-tinta-2">
          {p.producto_principal} · {formatMXN(p.precio_mayoreo_app.precio, locale)}/{v("unidades", p.precio_mayoreo_app.unidad)}
        </span>
        <span className="flex items-center gap-2 text-[13px] text-tinta-2">
          <Estrellas rating={p.rating} className="text-[13px]" />
          {p.alcaldia}
        </span>
      </span>
      <span className="sr-only">{t("verProductor")}</span>
    </Link>
  );
}
