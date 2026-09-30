"use client";

import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EncabezadoSimple } from "@/components/cart/EncabezadoSimple";
import { TARIFA_SERVICIO, type PlanConsumidor } from "@/lib/checkout";
import { enIdioma } from "@/lib/idioma";
import { formatMXN } from "@/lib/money";
import { accesoRutaPremium, limiteAsistente, planDesdeModelo, venceEn } from "@/lib/planes";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { DialogoPagoPlan } from "./DialogoPagoPlan";

type PlanModelo = { plan: string; precio: number; moneda?: string; incluye: string[]; incluye_en?: string[] };

/** M12 · Planes: tabla comparativa desde modelo_negocio.precios.consumidor; «Activar» simula el pago. */
export function PlanesView({ planes }: { planes: PlanModelo[] }) {
  const t = useTranslations("planes");
  const locale = useLocale();
  const hydrated = useHydrated();
  const actual = useAppStore((s) => s.plan);
  const setPlan = useAppStore((s) => s.setPlan);
  const vence = useAppStore((s) => s.planVence);
  const [pagando, setPagando] = useState<{ id: PlanConsumidor; monto: number } | null>(null);
  const [referencia] = useState(() => `PLAN-${Math.floor(100000 + Math.random() * 900000)}`);

  const nombre = (p: PlanConsumidor) => (p === "Gratis" ? t("gratis") : p === "Pase Turista" ? t("pase") : t("mercadoMas"));
  const precio = (m: PlanModelo) =>
    m.precio === 0 ? t("precio0") : m.moneda?.includes("mes") ? t("porMes", { precio: formatMXN(m.precio, locale) }) : t("porSemana", { precio: formatMXN(m.precio, locale) });

  /** Gratis se activa al momento; los planes de pago pasan por el pago simulado (QR o tarjeta 4242). */
  const activar = (p: PlanConsumidor, monto: number) => {
    if (p === "Gratis") {
      setPlan("Gratis");
      toast(t("activado", { plan: nombre(p) }));
      return;
    }
    setPagando({ id: p, monto });
  };
  const pagado = () => {
    if (!pagando) return;
    const hasta = venceEn(pagando.id);
    setPlan(pagando.id, hasta);
    toast.success(t("activadoHasta", { plan: nombre(pagando.id), fecha: fecha(hasta!) }));
    setPagando(null);
  };
  const fecha = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "long" });

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
                {esActual && (
                  <span className="flex flex-col items-end gap-1">
                    <span className="rounded-pill bg-morado px-2.5 py-0.5 text-[12px] font-bold text-crema">{t("actual")}</span>
                    {vence && <span className="text-[12px] font-semibold text-tinta-2">{t("vigenteHasta", { fecha: fecha(vence) })}</span>}
                  </span>
                )}
              </div>
              <ul className="flex flex-col gap-1.5 text-sm">
                {enIdioma(m, "incluye", locale).map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-nopal-700" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              {!esActual && (
                <Button variant={id === "Gratis" ? "secondary" : "premium"} onClick={() => activar(id, m.precio)}>
                  {id === "Gratis" ? t("volverGratis") : t("activarPrecio", { precio: formatMXN(m.precio, locale) })}
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
        <DialogoPagoPlan
          abierto={!!pagando}
          onAbierto={(v) => !v && setPagando(null)}
          nombre={pagando ? nombre(pagando.id) : ""}
          monto={pagando?.monto ?? 0}
          referencia={referencia}
          onPagado={pagado}
        />
      </div>
    </div>
  );
}
