"use client";

import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAppStore, useHydrated } from "@/store/useAppStore";

export function PlanActual() {
  const t = useTranslations("pasaporte");
  const tp = useTranslations("planes");
  const hydrated = useHydrated();
  const plan = useAppStore((s) => s.plan);
  const nombre = plan === "Gratis" ? tp("gratis") : plan === "Pase Turista" ? tp("pase") : tp("mercadoMas");
  return (
    <section className="flex items-center gap-3 rounded-card border border-border bg-white p-4">
      <Crown className="size-6 shrink-0 text-dorado" aria-hidden />
      <div className="flex flex-1 flex-col">
        <span className="text-[13px] text-tinta-2">{t("plan")}</span>
        <span className="font-bold">{hydrated ? nombre : "…"}</span>
      </div>
      <Button asChild size="sm" variant="premium">
        <Link href="/yo/planes">{t("cambiarPlan")}</Link>
      </Button>
    </section>
  );
}
