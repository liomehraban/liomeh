import { CifraAnimada } from "./CifraAnimada";
import { Revelar } from "@/components/motion/Revelar";
import { ArrowRight, Bus, Clock, Lock, MapPin, Navigation, PartyPopper, Route, Store, Timer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { EstadoHorario } from "@/components/market/EstadoHorario";
import { PhotoPlaceholder } from "@/components/market/PhotoPlaceholder";
import { TIPO_KEY } from "@/components/market/tipos";
import { useVocabulario } from "@/hooks/useVocabulario";
import { comoLlegarUrl } from "@/lib/geo";
import { enIdioma } from "@/lib/idioma";
import { categoriaGiro, categoriaMercado, COLOR_GIRO } from "@/lib/giros";
import { describirHorario, formatMinutos } from "@/lib/horarioTexto";
import { ratingPromedio } from "@/lib/resenas";
import type { Evento, Mercado, Puesto, Resena, Ruta } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import type messages from "../../../../messages/es.json";
import { RatingCombinado } from "@/components/resenas/RatingCombinado";
import { SeccionResenas } from "@/components/resenas/SeccionResenas";
import { BotonCompartir } from "./BotonCompartir";
import { BotonVolver } from "./BotonVolver";
import { EventosRelacionados } from "./EventosRelacionados";
import { ListaPuestos } from "./ListaPuestos";
import { Seccion } from "./Seccion";

type ClaveCifra = keyof typeof messages.mercado.cifrasEtiquetas;

export type FichaMercadoProps = {
  mercado: Mercado;
  puestos: Puesto[];
  resenas: Resena[];
  eventos: Evento[];
  rutas: Ruta[];
};

const PUESTOS_VISIBLES = 6;
const CIFRAS = new Set<string>([
  "locatarios", "visitantes_dia", "toneladas_dia", "hectareas", "inversion_reciente_mxn", "empleos_directos",
  "desperdicio_ton_dia", "planta_solar_mw", "locales", "anios", "restaurantes", "pct_consumo_nacional",
] satisfies ClaveCifra[]);

/** M2 · Ficha de mercado. Sin estado propio: sirve igual en servidor y en tests. */
export function FichaMercado({ mercado: m, puestos, resenas, eventos, rutas }: FichaMercadoProps) {
  const t = useTranslations();
  const locale = useLocale();
  const en = locale === "en";
  const v = useVocabulario();
  const lema = en ? (m.lema_en ?? m.lema) : m.lema;
  const resumen = en ? (m.resumen_en ?? m.resumen) : m.resumen;
  const cat = categoriaMercado(m);
  const rating = ratingPromedio(resenas);
  // Tipo y giro pueden decir lo mismo al traducirse (Central de Abasto: «Wholesale» y «wholesale»): un solo chip.
  const vistos = new Set<string>();
  const unico = (s: string) => {
    const k = s.trim().toLocaleLowerCase(locale);
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  };
  const chipsTipo = m.tipos.map((tipo) => ({ tipo, texto: TIPO_KEY[tipo] ? t(`tipos.${TIPO_KEY[tipo]}`) : tipo })).filter((c) => unico(c.texto));
  const chipsGiro = m.giros.map((g) => ({ g, texto: v("giros", g) })).filter((c) => unico(c.texto));
  const cifras = m.cifras ? Object.entries(m.cifras) : [];

  return (
    <article className="flex flex-col pb-10">
      {/* Portada */}
      <header className="relative">
        <PhotoPlaceholder categoria={cat} className="aspect-auto h-56 rounded-none" iconClassName="size-16" />
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <BotonVolver className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3" />
        <BotonCompartir titulo={m.nombre_display} texto={lema} className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[6.75rem]" />
      </header>

      <div className="relative -mt-8 flex flex-col gap-6 rounded-t-card bg-background px-5 pt-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-5xl text-morado-700">{m.nombre_display}</h1>
          {lema && <p className="text-lg text-tinta-2">{lema}</p>}
          <ul className="flex flex-wrap gap-2 pt-1" aria-label={t("explorar.tipo")}>
            {chipsTipo.map(({ tipo, texto }) => (
              <li key={tipo} className="rounded-pill bg-morado-50 px-3 py-1 text-[13px] font-semibold text-morado-700">
                {texto}
              </li>
            ))}
            {chipsGiro.map(({ g, texto }) => (
              <li key={g} className="flex items-center gap-1.5 rounded-pill border border-border px-3 py-1 text-[13px] font-semibold">
                <span aria-hidden className="size-2 rounded-full" style={{ background: COLOR_GIRO[categoriaGiro(g)] }} />
                {texto}
              </li>
            ))}
          </ul>
          <RatingCombinado objetivoId={m.id} base={rating} />
        </div>

        {/* Info */}
        <section aria-label={t("mercado.info")} className="flex flex-col gap-4 rounded-card border border-border bg-white p-5">
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-morado" aria-hidden />
            <div className="flex flex-col gap-1">
              <h2 className="sr-only">{t("mercado.horario")}</h2>
              <EstadoHorario horario={m.horario} />
              {m.horario && <p className="text-sm text-tinta-2">{en ? describirHorario(m.horario, locale) : m.horario.texto}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-morado" aria-hidden />
            <div className="flex flex-col">
              <h2 className="sr-only">{t("mercado.direccion")}</h2>
              <p>{m.direccion}</p>
              <p className="text-sm text-tinta-2">
                {m.colonia} · {m.alcaldia}
              </p>
            </div>
          </div>
          {m.transporte && (
            <div className="flex gap-3">
              <Bus className="mt-0.5 size-5 shrink-0 text-morado" aria-hidden />
              <div className="flex flex-col gap-1">
                <h2 className="text-sm font-semibold">{t("mercado.transporte")}</h2>
                <ul className="text-sm text-tinta-2">
                  {m.transporte.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {m.tiempo_sugerido_min && (
            <p className="flex items-center gap-3 text-sm text-tinta-2">
              <Timer className="size-5 text-morado" aria-hidden />
              {t("mercado.tiempoSugerido", { tiempo: formatMinutos(m.tiempo_sugerido_min) })}
            </p>
          )}
          <Button asChild variant="secondary">
            <a href={comoLlegarUrl(m)} target="_blank" rel="noopener noreferrer">
              <Navigation aria-hidden />
              {t("mercado.comoLlegar")}
            </a>
          </Button>
        </section>

        {m.interior_disponible && (
          <Button asChild size="lg" className="h-auto min-h-14 py-3 text-base whitespace-normal shadow-lg">
            <Link href={`/mercado/${m.id}/interior`} data-demo="ver-interior">
              <MapPin aria-hidden />
              {t("mercado.verInterior")}
            </Link>
          </Button>
        )}

        {resumen && <p className="text-lg leading-relaxed">{resumen}</p>}

        {m.imperdibles?.length ? (
          <Seccion titulo={t("mercado.imperdibles")}>
            <ul data-revelar className="flex flex-col gap-2">
              {m.imperdibles.map((x) => (
                <li key={x} className="flex gap-3 rounded-2xl bg-dorado-200/60 p-3">
                  <span aria-hidden className="text-dorado">★</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </Seccion>
        ) : null}

        {cifras.length > 0 && (
          <Seccion titulo={t("mercado.cifras")}>
            <dl className="grid grid-cols-2 gap-3">
              {cifras.map(([k, v], i) => (
                <Revelar
                  key={k}
                  orden={i}
                  // Con un número impar de cifras, la última ocupa las dos columnas.
                  className={cn("@container flex min-w-0 flex-col gap-1 rounded-card bg-morado p-4 text-crema", cifras.length % 2 === 1 && i === cifras.length - 1 && "col-span-2")}
                >
                  <dd className="font-display text-4xl leading-none whitespace-nowrap text-dorado-200">
                    <CifraAnimada clave={k} valor={v} />
                  </dd>
                  <dt className="text-sm">{CIFRAS.has(k) ? t(`mercado.cifrasEtiquetas.${k as ClaveCifra}`) : k.replaceAll("_", " ")}</dt>
                </Revelar>
              ))}
            </dl>
          </Seccion>
        )}

        {m.historia && (
          <details className="group rounded-card border border-border bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xl font-bold text-morado-700">
              {t("mercado.historia")}
              <ArrowRight className="size-5 transition-transform group-open:rotate-90" aria-hidden />
            </summary>
            <p className="pt-2 leading-relaxed">{m.historia}</p>
          </details>
        )}

        {m.sub_mercados?.length ? (
          <Seccion titulo={t("mercado.subMercados")}>
            <ul className="flex flex-wrap gap-2">
              {m.sub_mercados.map((s) => (
                <li key={s} className="rounded-pill border border-morado/30 bg-morado-50 px-3 py-1.5 text-sm font-semibold text-morado-700">
                  {s}
                </li>
              ))}
            </ul>
          </Seccion>
        ) : null}

        {m.origen_producto?.length ? (
          <Seccion titulo={t("mercado.origen")}>
            <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-white">
              {m.origen_producto.map((o) => (
                <li key={o.estado} className="flex justify-between gap-4 px-4 py-3">
                  <span className="font-semibold">{o.estado}</span>
                  <span className="text-right text-tinta-2">{o.productos}</span>
                </li>
              ))}
            </ul>
          </Seccion>
        ) : null}

        {m.fiesta && (
          <Seccion titulo={t("mercado.fiesta")}>
            <div className="relative flex items-center gap-4 overflow-hidden rounded-card bg-rosa p-4 text-white">
              <PartyPopper className="size-8 shrink-0" aria-hidden />
              <div>
                <p className="font-bold">{m.fiesta.nombre}</p>
                <p className="text-sm">{m.fiesta.fecha}</p>
              </div>
            </div>
          </Seccion>
        )}

        {m.programas?.length ? (
          <Seccion titulo={t("mercado.programas")}>
            <ul className="list-disc pl-5 text-tinta-2">
              {m.programas.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Seccion>
        ) : null}

        {puestos.length ? (
          <Seccion titulo={t("mercado.puestos")}>
            <ListaPuestos puestos={puestos} visibles={PUESTOS_VISIBLES} />
            {m.interior_disponible && (
              <Link href={`/mercado/${m.id}/interior`} className="flex min-h-11 items-center gap-2 font-semibold text-morado underline-offset-4 hover:underline">
                {t("mercado.verTodosPuestos", { n: puestos.length })}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
          </Seccion>
        ) : (
          <section className="flex flex-col items-center gap-3 rounded-card border-2 border-dashed border-morado/30 bg-morado-50/60 p-6 text-center">
            <Store className="size-10 text-morado" strokeWidth={1.5} aria-hidden />
            <h2 className="text-lg font-bold text-morado-700">{t("mercado.vacioTitulo")}</h2>
            <p className="text-sm text-tinta-2">{t("mercado.vacioTexto")}</p>
            <Button asChild variant="premium" size="sm">
              <Link href="/locatario/plan">{t("mercado.sumate")}</Link>
            </Button>
          </section>
        )}

        <SeccionResenas objetivoId={m.id} resenas={resenas} base={rating} titulo={t("mercado.resenas")} />

        <EventosRelacionados eventos={eventos} />

        {rutas.length ? (
          <Seccion titulo={t("mercado.rutas")}>
            <ul className="flex flex-col gap-2">
              {rutas.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/rutas/${r.id}`}
                    className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-white p-3 hover:border-morado focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <Route className="size-5 shrink-0 text-morado" aria-hidden />
                    <span className="flex flex-1 flex-col">
                      <span className="font-semibold">{enIdioma(r, "titulo", locale)}</span>
                      <span className="text-[13px] text-tinta-2">
                        {t("mercado.paradas", { n: r.paradas.length })} · {t("mercado.horas", { h: r.duracion_h })} · {r.km} km
                      </span>
                    </span>
                    {r.tipo === "premium" && (
                      <span className="flex items-center gap-1 rounded-pill bg-dorado px-2 py-0.5 text-xs font-bold text-morado-900">
                        <Lock className="size-3" aria-hidden />
                        {t("mercado.premium")}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Seccion>
        ) : null}

        <footer className="border-t border-border pt-4 text-[13px] text-tinta-2">{t("comun.fuente")}</footer>
      </div>
    </article>
  );
}
