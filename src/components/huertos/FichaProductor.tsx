import { CalendarDays, Leaf, MapPin, Package, Truck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Estrellas } from "@/components/market/Estrellas";
import { ListaResenas } from "@/components/market/ListaResenas";
import { PhotoPlaceholder } from "@/components/market/PhotoPlaceholder";
import { BotonCompartir } from "@/components/market/ficha/BotonCompartir";
import { BotonVolver } from "@/components/market/ficha/BotonVolver";
import { Seccion } from "@/components/market/ficha/Seccion";
import { FairTradeCard } from "@/components/fairtrade/FairTradeCard";
import { cultivosDe } from "@/lib/huertos";
import type { Productor, Resena, ZonaHuerto } from "@/lib/schemas";
import { ComprarMayoreo } from "./ComprarMayoreo";
import { ReservarVisita } from "./ReservarVisita";

export type FichaProductorProps = { productor: Productor; zona: ZonaHuerto | null; resenas: Resena[]; nombres: Record<string, string> };

/** M6 · Ficha de productor. */
export function FichaProductor({ productor: p, zona, resenas, nombres }: FichaProductorProps) {
  const t = useTranslations();
  const locale = useLocale();
  const esFlor = cultivosDe(p).includes("flores");
  const km = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: 1 }).format(p.km_a_la_merced);

  return (
    <article className="flex flex-col pb-10">
      <header className="relative">
        <PhotoPlaceholder categoria={esFlor ? "flores" : "frutas"} className="aspect-auto h-48 rounded-none" iconClassName="size-14" />
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <BotonVolver fallback="/huertos" className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3" />
        <BotonCompartir titulo={p.nombre} texto={p.producto_principal} className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-16" />
      </header>

      <div className="relative -mt-8 flex flex-col gap-6 rounded-t-card bg-background px-5 pt-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-nopal">{p.producto_principal}</p>
          <h1 className="font-display text-5xl text-morado-700">{p.nombre}</h1>
          <p className="text-tinta-2">{t("productor.titular", { titular: p.titular })}</p>
          <p className="flex items-center gap-1.5 text-sm text-tinta-2">
            <MapPin className="size-4" aria-hidden />
            {p.pueblo}, {p.alcaldia} · {t("huertos.desdeMerced", { km })}
          </p>
          {zona && <p className="text-sm text-tinta-2">{t("productor.zona", { zona: zona.nombre })}</p>}
          <Estrellas rating={p.rating} total={p.num_resenas} />
        </div>

        <div className="flex flex-col gap-3 rounded-card border border-border bg-white p-4 text-sm">
          <div className="flex gap-3">
            <CalendarDays className="size-5 shrink-0 text-morado" aria-hidden />
            <div>
              <p className="font-semibold">{t("productor.temporada")}</p>
              <p className="text-tinta-2">{p.temporada}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Leaf className="size-5 shrink-0 text-nopal" aria-hidden />
            <div>
              <p className="font-semibold">{t("productor.practicas")}</p>
              <div>
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {p.practicas.map((x) => (
                    <li key={x} className="rounded-pill bg-nopal/10 px-2.5 py-0.5 text-[13px] font-semibold text-nopal">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Package className="size-5 shrink-0 text-morado" aria-hidden />
            <p className="text-tinta-2">{t("productor.ventaMinima", { min: p.venta_minima })}</p>
          </div>
          <div className="flex gap-3">
            <Truck className="size-5 shrink-0 text-morado" aria-hidden />
            <p className="text-tinta-2">{t("productor.entrega", { entrega: p.entrega })}</p>
          </div>
        </div>

        <Seccion titulo={t("productor.catalogo")}>
          <ul className="flex flex-wrap gap-2">
            {p.catalogo.map((c) => (
              <li key={c} className="rounded-pill border border-border bg-white px-3 py-1.5 text-sm">
                {c}
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo={t("productor.comprar")}>
          <ComprarMayoreo p={p} nombres={nombres} />
        </Seccion>

        <FairTradeCard productor={p} />

        <Seccion titulo={t("productor.visita")}>
          {p.visitas_huerto ? <ReservarVisita p={p} /> : <p className="rounded-2xl bg-papel p-4 text-tinta-2">{t("productor.sinVisitas")}</p>}
        </Seccion>

        <Seccion titulo={t("productor.resenas")}>
          <ListaResenas resenas={resenas} vacio={t("productor.sinResenas")} />
        </Seccion>

        <p className="border-t border-border pt-4 text-[13px] text-tinta-2">{t("huertos.simulado")}</p>
      </div>
    </article>
  );
}
