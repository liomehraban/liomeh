"use client";

import { useState } from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EncabezadoSimple } from "@/components/cart/EncabezadoSimple";
import { TARIFA_SERVICIO, type PlanConsumidor } from "@/lib/checkout";
import { formatMXN } from "@/lib/money";
import { accesoRutaPremium, limiteAsistente, planDesdeModelo } from "@/lib/planes";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";

type PlanModelo = { plan: string; precio: number; moneda?: string; incluye: string[] };

/** M12 · Planes: tabla comparativa desde modelo_negocio.precios.consumidor; «Activar» simula el pago. */
export function PlanesView({ planes }: { planes: PlanModelo[] }) {
  const t = useTranslations("planes");
  const locale = useLocale();
  const hydrated = useHydrated();
  const actual = useAppStore((s) => s.plan);
  const setPlan = useAppStore((s) => s.setPlan);
  const [procesando, setProcesando] = useState<PlanConsumidor | null>(null);

  const nombre = (p: PlanConsumidor) => (p === "Gratis" ? t("gratis") : p === "Pase Turista" ? t("pase") : t("mercadoMas"));
  const precio = (m: PlanModelo) =>
    m.precio === 0 ? t("precio0") : m.moneda?.includes("mes") ? t("porMes", { precio: formatMXN(m.precio, locale) }) : t("porSemana", { precio: formatMXN(m.precio, locale) });

  const activar = (p: PlanConsumidor) => {
    if (p === "Gratis") {
      setPlan("Gratis");
      toast(t("activado", { plan: nombre(p) }));
      return;
    }
    setProcesando(p);
    setTimeout(() => {
      setPlan(p);
      setProcesando(null);
      toast.success(t("activado", { plan: nombre(p) }));
    }, 1500);
  };

  const lim = limiteAsistente(actual);
  const efectos = [
    t("efTarifa", { valor: actual === "Mercado+" ? formatMXN(0, locale) : formatMXN(TARIFA_SERVICIO, locale) }),
    t("efDescuento", { valor: actual === "Pase Turista" ? "10%" : "0%" }),
    t("efAsistente", { valor: lim === Infinity ? t("ilimitado") : t("alDia", { n: lim }) }),
    t("efRutas", { valor: accesoRutaPremium(actual) ? t("si") : t("no") }),
  ];

  return (
    <div className="flex min-h-full flex-col">
      <EncabezadoSimple titulo={t("titulo")} fallback="/yo" />
      <div className="flex flex-col gap-4 p-5">
        <p className="text-tinta-2">{t("subtitulo")}</p>
        {planes.map((m) => {
          const id = planDesdeModelo(m.plan);
          const esActual = hydrated && actual === id;
          return (
            <section
              key={m.plan}
              aria-labelledby={`plan-${id}`}
              className={cn("flex flex-col gap-3 rounded-card border-2 bg-white p-4", esActual ? "border-morado" : id === "Pase Turista" ? "border-dorado" : "border-border")}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 id={`plan-${id}`} className="flex items-center gap-2 font-display text-3xl text-morado-700">
                    {id !== "Gratis" && <Crown className="size-5 text-dorado" aria-hidden />}
                    {nombre(id)}
                  </h2>
                  <p className="font-bold">{precio(m)}</p>
                </div>
                {esActual && <span className="rounded-pill bg-morado px-2.5 py-0.5 text-[12px] font-bold text-crema">{t("actual")}</span>}
              </div>
              <ul className="flex flex-col gap-1.5 text-sm">
                {m.incluye.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-nopal-700" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              {!esActual && (
                <Button variant={id === "Gratis" ? "secondary" : "premium"} disabled={!!procesando} onClick={() => activar(id)}>
                  {procesando === id && <Loader2 className="animate-spin" aria-hidden />}
                  {procesando === id ? t("activando") : id === "Gratis" ? t("volverGratis") : t("activar")}
                </Button>
              )}
            </section>
          );
        })}
        {hydrated && (
          <section className="rounded-card bg-morado-50 p-4" aria-labelledby="efectos">
            <h2 id="efectos" className="mb-2 font-bold text-morado-700">
              {t("efectos")}
            </h2>
            <ul className="flex flex-col gap-1 text-sm">
              {efectos.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </section>
        )}
        <p className="text-center text-[13px] text-tinta-2">{t("pagoSimulado")}</p>
      </div>
    </div>
  );
}
