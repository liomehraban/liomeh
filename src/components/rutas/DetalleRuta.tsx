"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Crown, Lock, Play, Route, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogoReserva, fmtDia } from "@/components/ui/dialogo-reserva";
import { MapView } from "@/components/map/MapView";
import { BotonVolver } from "@/components/market/ficha/BotonVolver";
import { Link } from "@/i18n/navigation";
import type { Parada } from "@/data/rutas";
import { bbox } from "@/lib/geo";
import { enIdioma } from "@/lib/idioma";
import { formatMXN } from "@/lib/money";
import { accesoRutaPremium } from "@/lib/planes";
import { paradasHechas } from "@/lib/rutas";
import type { Ruta } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/** M11 · Detalle de ruta: mapa con paradas numeradas, lista, «Iniciar ruta» (paywall si es premium) y versión guiada. */
export function DetalleRuta({ ruta, paradas }: { ruta: Ruta; paradas: Parada[] }) {
  const t = useTranslations("rutas");
  const locale = useLocale();
  const titulo = enIdioma(ruta, "titulo", locale);
  const hydrated = useHydrated();
  const plan = useAppStore((s) => s.plan);
  const inicio = useAppStore((s) => s.rutasIniciadas?.[ruta.id]);
  const checkins = useAppStore((s) => s.checkins);
  const pedidos = useAppStore((s) => s.pedidos);
  const reservasVisita = useAppStore((s) => s.reservasVisita);
  const iniciar = useAppStore((s) => s.iniciarRuta);
  const reservarTour = useAppStore((s) => s.reservarTour);
  const [paywall, setPaywall] = useState(false);

  const hechas = useMemo(
    () => (hydrated && inicio ? paradasHechas(ruta.paradas, { checkins: checkins ?? [], pedidos, reservasVisita: reservasVisita ?? [] }, inicio) : new Set<string>()),
    [hydrated, inicio, ruta.paradas, checkins, pedidos, reservasVisita],
  );
  const caja = bbox(paradas);
  const centro = { lat: paradas.reduce((s, p) => s + p.lat, 0) / paradas.length, lng: paradas.reduce((s, p) => s + p.lng, 0) / paradas.length };
  const bloqueada = ruta.tipo === "premium" && !accesoRutaPremium(plan);

  const onIniciar = () => {
    if (bloqueada) setPaywall(true);
    else iniciar(ruta.id);
  };

  return (
    <div className="flex flex-col pb-10">
      <div className="relative h-72">
        <MapView
          center={centro}
          zoom={12}
          layers={[{ tipo: "ruta", id: "ruta", puntos: paradas.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, color: "#93408F", etiqueta: p.nombre })), hechas: [...hechas] }]}
          encuadre={caja ? { bbox: caja, key: 1 } : null}
          paddingInferior={0}
          ariaLabel={t("mapa", { titulo })}
        />
        <BotonVolver fallback="/agenda?tab=rutas" className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-10" />
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          {ruta.tipo === "premium" ? (
            <span className="flex w-fit items-center gap-1 rounded-pill bg-dorado px-2.5 py-0.5 text-[13px] font-bold text-morado-900">
              <Lock className="size-3.5" aria-hidden />
              {t("premium")}
            </span>
          ) : (
            <span className="w-fit rounded-pill bg-nopal/15 px-2.5 py-0.5 text-[13px] font-bold text-nopal-700">{t("gratis")}</span>
          )}
          <h1 className="font-display text-4xl text-morado-700">{titulo}</h1>
          <p className="flex flex-wrap gap-x-4 text-sm text-tinta-2">
            <span className="flex items-center gap-1">
              <Clock className="size-4" aria-hidden />
              {t("horas", { h: ruta.duracion_h })}
            </span>
            <span className="flex items-center gap-1">
              <Route className="size-4" aria-hidden />
              {t("km", { km: ruta.km })}
            </span>
            <span>{t("paradas", { n: ruta.paradas.length })}</span>
          </p>
          {ruta.incluye && <p className="text-sm">{t("incluye", { incluye: enIdioma(ruta, "incluye", locale) ?? ruta.incluye })}</p>}
        </div>

        {hydrated && inicio ? (
          <section className="flex flex-col gap-2 rounded-card bg-morado p-4 text-crema" aria-live="polite">
            <p className="font-bold">{t("iniciada")}</p>
            <div className="h-3 overflow-hidden rounded-pill bg-morado-900/60" role="progressbar" aria-valuemin={0} aria-valuemax={ruta.paradas.length} aria-valuenow={hechas.size}>
              <div className="h-full rounded-pill bg-dorado transition-[width] duration-500" style={{ width: `${(hechas.size / ruta.paradas.length) * 100}%` }} />
            </div>
            <p className="text-sm">
              {t("progreso", { hechas: hechas.size, total: ruta.paradas.length })} · {t("progresoTexto")}
            </p>
          </section>
        ) : (
          <Button size="lg" onClick={onIniciar} variant={bloqueada ? "premium" : "default"}>
            {bloqueada ? <Lock aria-hidden /> : <Play aria-hidden />}
            {t("iniciar")}
          </Button>
        )}

        <ol className="flex flex-col gap-2">
          {paradas.map((p, i) => {
            const ok = hechas.has(p.id);
            return (
              <li key={p.id}>
                <Link href={p.href} className="flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-white p-3 hover:border-morado">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold", ok ? "bg-nopal-700 text-white" : i === 0 ? "bg-dorado text-morado-900" : "bg-morado text-crema")}>
                    {ok ? <CheckCircle2 className="size-4" aria-label={t("hecha")} /> : i + 1}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[12px] text-tinta-2">{t("parada", { n: i + 1 })}</span>
                    <span className="font-semibold">{p.nombre}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <DialogoReserva
          titulo={t("guiadaTitulo", { titulo })}
          precioPorPersona={ruta.precio_guiada}
          onConfirmar={(r) => {
            const res = reservarTour({ rutaId: ruta.id, ...r });
            toast.success(t("reservada", { fecha: fmtDia(res.fecha, locale, { weekday: "short", day: "numeric", month: "short" }), personas: res.personas, id: res.id }));
          }}
          trigger={
            <Button variant="secondary">
              <Users aria-hidden />
              {t("guiada", { precio: formatMXN(ruta.precio_guiada, locale) })}
            </Button>
          }
        />
      </div>

      <Dialog open={paywall} onOpenChange={setPaywall}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="size-5 text-dorado" aria-hidden />
              {t("paywallTitulo")}
            </DialogTitle>
            <DialogDescription>{t("paywallTexto")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild variant="premium">
              <Link href="/yo/planes">{t("verPlanes")}</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
