"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useVocabulario } from "@/hooks/useVocabulario";
import { enIdioma } from "@/lib/idioma";
import type { PlanLocatario } from "@/lib/locatario";
import { formatMXN, formatUSDaprox } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoSimple } from "@/components/cart/EncabezadoSimple";

type PlanModelo = { plan: string; precio: number; moneda?: string; incluye: string[]; incluye_en?: string[] };
const idPlan = (nombre: string): PlanLocatario => (/^plus/i.test(nombre) ? "Plus" : /^pro/i.test(nombre) ? "Pro" : "Gratis");

/** M16 · Locatario › Plan: Gratis / Pro / Plus desde modelo_negocio.precios.locatario, comisión vs apps de delivery. */
export function PlanLocatarioView({ planes }: { planes: PlanModelo[] }) {
  const t = useTranslations("locatario.plan");
  const locale = useLocale();
  const v = useVocabulario();
  const hydrated = useHydrated();
  const actual = useAppStore((s) => s.locatario.plan);
  const setPlan = useAppStore((s) => s.setPlanLocatario);
  const [procesando, setProcesando] = useState<PlanLocatario | null>(null);
  // Si el locatario sale durante el «procesando», el plan no cambia a sus espaldas.
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const cambiar = (p: PlanLocatario) => {
    setProcesando(p);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPlan(p);
      setProcesando(null);
      toast.success(t("cambiado", { plan: v("planes", p) }));
    }, p === "Gratis" ? 0 : 1500);
  };

  return (
    <div className="flex flex-col">
      {/* Se llega desde Cuenta (y desde el aviso de límite del catálogo): volver siempre lleva a Cuenta. */}
      <EncabezadoSimple titulo={t("titulo")} destino="/locatario/cuenta" />
      <div className="flex flex-col gap-4 p-5">
        <section className="flex flex-col gap-1 rounded-card bg-nopal-700 p-4 text-white">
          <p className="font-bold">{t("comision")}</p>
          <p className="text-sm">{t("qr")}</p>
        </section>
        {planes.map((m) => {
          const id = idPlan(m.plan);
          const esActual = hydrated && actual === id;
          return (
            <section key={m.plan} className={cn("flex flex-col gap-3 rounded-card border-2 bg-white p-4", esActual ? "border-morado" : "border-border")} aria-labelledby={`plan-loc-${id}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 id={`plan-loc-${id}`} className="flex items-center gap-2 font-display text-3xl text-morado-700">
                    {id !== "Gratis" && <Crown className="size-5 text-dorado" aria-hidden />}
                    {v("planes", id)}
                  </h2>
                  <p className="font-bold">
                    {m.precio ? t("porMes", { precio: formatMXN(m.precio, locale) }) : t("gratis")}
                    {m.precio > 0 && locale === "en" && <span className="ml-1.5 text-xs font-normal whitespace-nowrap text-tinta-2">{formatUSDaprox(m.precio)}</span>}
                  </p>
                </div>
                {esActual && <span className="rounded-pill bg-morado px-2.5 py-0.5 text-[12px] font-bold text-crema">{t("actual")}</span>}
              </div>
              <ul className="flex flex-col gap-1.5 text-sm">
                {enIdioma(m, "incluye", locale).map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-nopal-700" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
              {hydrated && !esActual && (
                <Button variant={id === "Gratis" ? "secondary" : "premium"} disabled={!!procesando} onClick={() => cambiar(id)}>
                  {procesando === id && <Loader2 className="animate-spin" aria-hidden />}
                  {t("cambiar", { plan: v("planes", id) })}
                </Button>
              )}
            </section>
          );
        })}
        <p className="text-center text-[13px] text-tinta-2">{t("pagoSimulado")}</p>
      </div>
    </div>
  );
}
