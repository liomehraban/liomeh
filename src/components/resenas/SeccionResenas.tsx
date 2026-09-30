"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, ImageIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Estrellas } from "@/components/market/Estrellas";
import { useAhora } from "@/hooks/useAhora";
import { fechaRelativa } from "@/lib/eventos";
import { combinarRating, type Rating } from "@/lib/resenas";
import type { Resena } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated, type ResenaPropia } from "@/store/useAppStore";
import { EscribirResena } from "./EscribirResena";

type Filtro = "todas" | "es" | "en";

/** M8 · Reseñas: JSON + propias, filtro por idioma, fechas relativas, fotos y «Escribir reseña». */
export function SeccionResenas({ objetivoId, resenas, base, titulo }: { objetivoId: string; resenas: Resena[]; base?: Rating | null; titulo?: string }) {
  const t = useTranslations("resenas");
  const tm = useTranslations("mercado");
  const locale = useLocale();
  const ahora = useAhora();
  const hydrated = useHydrated();
  const todasPropias = useAppStore((s) => s.resenasPropias);
  const propias = useMemo(() => (hydrated ? todasPropias.filter((r) => r.objetivo_id === objetivoId) : []), [hydrated, todasPropias, objetivoId]);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const lista: ResenaPropia[] = useMemo(
    () => [...propias, ...[...resenas].sort((a, b) => b.fecha.localeCompare(a.fecha))].filter((r) => filtro === "todas" || r.idioma === filtro),
    [propias, resenas, filtro],
  );
  const baseRating = base === undefined ? (resenas.length ? { promedio: resenas.reduce((s, r) => s + r.estrellas, 0) / resenas.length, total: resenas.length } : null) : base;
  const rating = combinarRating(baseRating ? { promedio: Math.round(baseRating.promedio * 10) / 10, total: baseRating.total } : null, propias);

  const fecha = (iso: string) =>
    ahora
      ? fechaRelativa(iso, ahora, locale)
      : new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale === "en" ? "en-US" : "es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <section aria-labelledby={`resenas-${objetivoId}`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`resenas-${objetivoId}`} className="text-xl font-bold text-morado-700">
          {titulo ?? t("titulo")}
        </h2>
        {rating && <Estrellas rating={rating.promedio} total={rating.total} />}
      </div>
      <div className="flex flex-col gap-2">
        <div role="radiogroup" aria-label={t("filtro")} className="grid grid-cols-3 rounded-pill bg-morado-50 p-1">
          {(["todas", "es", "en"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={filtro === f}
              onClick={() => setFiltro(f)}
              className={cn("pressable h-11 min-w-0 truncate rounded-pill px-3 text-[13px] font-semibold", filtro === f ? "bg-primary text-primary-foreground" : "text-morado-700")}
            >
              {f === "todas" ? t("todas") : f === "es" ? t("espanol") : t("english")}
            </button>
          ))}
        </div>
        <EscribirResena objetivoId={objetivoId} />
      </div>
      {lista.length === 0 ? (
        <p className="rounded-2xl bg-papel p-4 text-tinta-2">{resenas.length + propias.length ? t("sinFiltro") : t("vacio")}</p>
      ) : (
        <ul data-revelar className="flex flex-col gap-3">
          {lista.slice(0, 8).map((r) => (
            <li key={r.id} className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {r.autor === "Tú" ? t("tu") : r.autor}
                    {r.origen && <span className="font-normal text-tinta-2"> · {r.origen}</span>}
                  </span>
                  <span className="flex items-center gap-2 text-[13px] text-tinta-2">
                    <span className="rounded bg-morado-50 px-1.5 text-[11px] font-bold text-morado-700">{r.idioma === "es" ? t("idiomaEs") : t("idiomaEn")}</span>
                    {fecha(r.fecha)}
                  </span>
                </div>
                <span className="shrink-0 text-dorado" role="img" aria-label={t("estrella", { n: r.estrellas })}>
                  {"★".repeat(r.estrellas)}
                  <span className="text-gris/40">{"★".repeat(5 - r.estrellas)}</span>
                </span>
              </div>
              <p lang={r.idioma}>{r.texto}</p>
              {r.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.fotoUrl} alt="" className="h-28 w-fit rounded-2xl object-cover" />
              ) : r.fotos > 0 ? (
                <div className="flex gap-2" role="group" aria-label={t("fotos", { n: r.fotos })}>
                  {Array.from({ length: Math.min(r.fotos, 3) }, (_, i) => (
                    <span key={i} className="grid size-16 place-items-center rounded-xl bg-morado-50 text-morado" aria-hidden>
                      <ImageIcon className="size-5" />
                    </span>
                  ))}
                </div>
              ) : null}
              {r.verificada && (
                <p className="flex items-center gap-1.5 text-[13px] text-nopal-700">
                  <BadgeCheck className="size-4" aria-hidden />
                  {r.verificada === "compra" ? tm("verificadaCompra") : tm("verificadaCheckin")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
