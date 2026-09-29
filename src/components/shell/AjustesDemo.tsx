"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/store/useAppStore";
import { LocaleToggle } from "./LocaleToggle";

/** Bloque de Ajustes: idioma y «Reiniciar demo». Se usa en Yo, Locatario › Cuenta y Productor › Cuenta. */
export function AjustesDemo() {
  const t = useTranslations();
  const router = useRouter();
  const resetDemo = useAppStore((s) => s.resetDemo);

  const reiniciar = () => {
    resetDemo();
    toast.success(t("comun.demoReiniciada"));
    router.push("/");
  };

  return (
    <section aria-labelledby="ajustes" className="flex flex-col gap-4 rounded-card border border-border bg-white p-5">
      <h2 id="ajustes" className="text-xl font-bold text-morado-700">{t("yo.ajustes")}</h2>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{t("yo.idioma")}</span>
        <LocaleToggle />
      </div>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="text-sm text-tinta-2">{t("yo.reiniciarTexto")}</p>
        <Button variant="secondary" onClick={reiniciar}>
          <RotateCcw aria-hidden />
          {t("comun.reiniciarDemo")}
        </Button>
      </div>
    </section>
  );
}
