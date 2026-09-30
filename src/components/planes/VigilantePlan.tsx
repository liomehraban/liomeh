"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAhora } from "@/hooks/useAhora";
import { planVencido } from "@/lib/planes";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/** Al vencer el Pase Turista (7 días) o Mercado+ (30 días), el plan vuelve a Gratis y se avisa. */
export function VigilantePlan() {
  const t = useTranslations("planes");
  const hydrated = useHydrated();
  const ahora = useAhora();
  const plan = useAppStore((s) => s.plan);
  const vence = useAppStore((s) => s.planVence);
  const vencido = hydrated && !!ahora && planVencido(plan, vence, ahora);
  useEffect(() => {
    if (!vencido) return;
    useAppStore.getState().setPlan("Gratis");
    toast(t("vencio", { plan: plan === "Pase Turista" ? t("pase") : t("mercadoMas") }));
  }, [vencido, plan, t]);
  return null;
}
