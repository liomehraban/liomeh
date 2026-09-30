import { BadgeCheck, Clock, CreditCard, MapPin, Navigation, QrCode, Sparkles, Sprout } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { RatingCombinado } from "@/components/resenas/RatingCombinado";
import { SeccionResenas } from "@/components/resenas/SeccionResenas";
import { PhotoPlaceholder } from "@/components/market/PhotoPlaceholder";
import { BotonCompartir } from "@/components/market/ficha/BotonCompartir";
import { BotonVolver } from "@/components/market/ficha/BotonVolver";
import { Seccion } from "@/components/market/ficha/Seccion";
import { useVocabulario } from "@/hooks/useVocabulario";
import { categoriaGiro } from "@/lib/giros";
import type { Productor, Puesto, Resena } from "@/lib/schemas";
import { FairTradeCard } from "@/components/fairtrade/FairTradeCard";
import { comoLlegarUrl } from "@/lib/geo";
import type { PuestoResumen } from "@/data/comercio";
import { ActividadEnVivo } from "./ActividadEnVivo";
import { CatalogoPuesto } from "./CatalogoPuesto";
import { SelloComercioJusto } from "./SelloComercioJusto";
import { SoloQA } from "./SoloQA";

export type FichaPuestoProps = {
  puesto: Puesto;
  mercado: { id: string; nombre: string; interior?: boolean; lat?: number; lng?: number };
  resenas: Resena[];
  productores: Productor[];
  nombresPuestos: Record<string, string>;
  vendedor?: PuestoResumen;
};

/** M4 · Puesto. */
export function FichaPuesto({ puesto: p, mercado, resenas, productores, nombresPuestos, vendedor }: FichaPuestoProps) {
  const t = useTranslations();
  const v = useVocabulario();
  const productorDe = (id: string | null) => (id ? productores.find((x) => x.id === id) : undefined);
  // Puestos del catálogo simulado: «Pasillo A · Local A-087» se muestra en el idioma de la app.
  const partes = /^Pasillo (\S+) · Local (\S+)$/.exec(p.ubicacion_texto);
  const ubicacion = p.simulado && partes ? t("puesto.ubicacion", { pasillo: partes[1], local: partes[2] }) : p.ubicacion_texto;

  return (
    <article className="flex flex-col pb-10">
      <header className="relative">
        <PhotoPlaceholder categoria={categoriaGiro(p.giro)} className="aspect-auto h-48 rounded-none" iconClassName="size-14" />
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <BotonVolver fallback={`/mercado/${mercado.id}`} className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3" />
        <BotonCompartir titulo={p.nombre} texto={mercado.nombre} className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[6.75rem]" />
      </header>

      <div className="relative -mt-8 flex flex-col gap-6 rounded-t-card bg-background px-5 pt-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-morado">{v("girosPuesto", p.giro)}</p>
          <h1 className="flex items-start gap-2 font-display text-5xl text-morado-700">
            {p.nombre}
            {p.real_segun_guia && <BadgeCheck className="mt-1 size-6 shrink-0 text-dorado" aria-label={t("mercado.realGuia")} />}
          </h1>
          <Link href={`/mercado/${mercado.id}`} className="w-fit text-sm font-semibold text-morado underline-offset-4 hover:underline">
            {t("puesto.enMercado", { mercado: mercado.nombre })}
          </Link>
          <p className="flex items-center gap-1.5 text-sm text-tinta-2">
            <MapPin className="size-4" aria-hidden />
            {ubicacion}
          </p>
          <ActividadEnVivo puestoId={p.id} />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <RatingCombinado objetivoId={p.id} base={p.num_resenas ? { promedio: p.rating, total: p.num_resenas } : null} />
            {!p.num_resenas && (
              <span className="flex items-center gap-1 rounded-pill bg-dorado-200 px-2.5 py-0.5 text-[12px] font-bold text-morado-900">
                <Sparkles className="size-3.5" aria-hidden />
                {t("puesto.nuevo")}
              </span>
            )}
            {p.sello_comercio_justo && <SelloComercioJusto />}
            <SoloQA>
              <span className="rounded-pill border border-dashed border-gris px-2.5 py-0.5 text-xs font-semibold text-tinta-2">
                {t("puesto.plan", { plan: v("planes", p.plan) })}
              </span>
              {p.simulado && (
                <span className="rounded-pill border border-dashed border-gris px-2.5 py-0.5 text-xs font-semibold text-tinta-2">{t("puesto.simulado")}</span>
              )}
            </SoloQA>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 rounded-card border border-border bg-white p-4 text-sm">
          <div className="flex items-center gap-3">
            <dt className="flex items-center gap-2 font-semibold">
              <Clock className="size-4 text-morado" aria-hidden />
              {t("puesto.horario")}
            </dt>
            <dd className="text-tinta-2">{p.horario || t("puesto.horarioMercado")}</dd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <dt className="flex items-center gap-2 font-semibold">
              <CreditCard className="size-4 text-morado" aria-hidden />
              {t("puesto.acepta")}
            </dt>
            {p.acepta.map((a) => (
              <dd key={a} className="rounded-pill bg-morado-50 px-2.5 py-0.5 text-[13px] font-semibold text-morado-700">
                {v("pagos", a)}
              </dd>
            ))}
          </div>
        </dl>

        <div className="flex flex-col gap-3">
          {mercado.interior !== false ? (
            <Button asChild variant="secondary">
              <Link href={`/mercado/${mercado.id}/interior?puesto=${p.id}`}>
                <Navigation aria-hidden />
                {t("puesto.llegarDentro")}
              </Link>
            </Button>
          ) : mercado.lat !== undefined && mercado.lng !== undefined ? (
            <Button asChild variant="secondary">
              <a href={comoLlegarUrl({ lat: mercado.lat, lng: mercado.lng })} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden />
                {t("puesto.comoLlegar", { mercado: mercado.nombre })}
              </a>
            </Button>
          ) : null}
        </div>

        <Seccion titulo={t("puesto.catalogo")}>
          <CatalogoPuesto puesto={p} nombresPuestos={nombresPuestos} vendedor={vendedor} />
        </Seccion>

        {p.origen?.length ? (
          <Seccion titulo={t("puesto.deDonde")}>
            <ul className="flex flex-col gap-3">
              {p.origen.map((o) => {
                const prod = productorDe(o.huerto_id);
                return (
                  <li key={o.producto + o.lugar} className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
                    <p className="flex items-center gap-2">
                      <Sprout className="size-5 shrink-0 text-nopal-700" aria-hidden />
                      <span>
                        <span className="font-semibold capitalize">{o.producto}</span> · {o.lugar}
                      </span>
                    </p>
                    {prod && <FairTradeCard productor={prod} producto={o.producto} mercado={mercado.nombre.replace(/^Mercado de /, "")} />}
                    {prod && (
                      <Link
                        href={`/huertos/${prod.id}`}
                        className="flex min-h-11 items-center justify-between gap-2 rounded-2xl bg-nopal/10 px-3 py-2 text-sm font-semibold text-nopal-700 hover:bg-nopal/15"
                      >
                        <span>
                          {t("puesto.verProductor")}: {prod.nombre}
                        </span>
                        <span aria-hidden>→</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </Seccion>
        ) : null}

        <section className="flex flex-col gap-3 rounded-card bg-morado-50 p-4">
          <p className="text-sm text-tinta-2">{t("puesto.checkinTexto")}</p>
          <Button asChild variant="premium">
            <Link href={`/yo/escanear?puesto=${p.id}&n=${encodeURIComponent(p.nombre)}&mn=${encodeURIComponent(mercado.nombre)}`}>
              <QrCode aria-hidden />
              {t("puesto.checkin")}
            </Link>
          </Button>
        </section>

        <SeccionResenas objetivoId={p.id} resenas={resenas} base={{ promedio: p.rating, total: p.num_resenas }} titulo={t("puesto.resenas")} />
      </div>
    </article>
  );
}
