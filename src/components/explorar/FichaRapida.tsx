"use client";

import { Navigation } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { EstadoHorario } from "@/components/market/EstadoHorario";
import { RatingCombinado } from "@/components/resenas/RatingCombinado";
import { comoLlegarUrl, formatDistance } from "@/lib/geo";
import { COLOR_GIRO } from "@/lib/giros";
import type { MercadoMapa } from "./tipos";

/** Contenido del bottom sheet al tocar un pin. */
export function FichaRapida({ m, distancia, desdeZocalo }: { m: MercadoMapa; distancia: number; desdeZocalo: boolean }) {
  const t = useTranslations("explorar");
  const locale = useLocale();
  const lema = locale === "en" ? (m.lema_en ?? m.lema) : m.lema;
  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex items-start gap-3 pr-10">
        <span aria-hidden className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: COLOR_GIRO[m.categoria] }} />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-display text-[32px] text-morado-700">{m.nombre}</h2>
          {lema && <p className="text-tinta-2">{lema}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <EstadoHorario horario={m.horario} />
        <span className="text-sm text-tinta-2">
          {formatDistance(distancia, locale)}
          {desdeZocalo && ` ${t("desdeZocalo")}`}
        </span>
        <RatingCombinado objetivoId={m.id} base={m.rating} />
        {!m.rating && <span className="text-sm text-tinta-2">{t("sinResenas")}</span>}
      </div>
      <p className="text-sm text-tinta-2">{m.alcaldia}</p>
      <div className="flex gap-3">
        <Button asChild className="flex-1">
          <Link href={`/mercado/${m.id}`}>{t("verMercado")}</Link>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <a href={comoLlegarUrl(m)} target="_blank" rel="noopener noreferrer">
            <Navigation aria-hidden />
            {t("comoLlegar")}
          </a>
        </Button>
      </div>
    </div>
  );
}
