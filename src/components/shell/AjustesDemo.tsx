"use client";

import { useState } from "react";
import { House, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Confirmar } from "@/components/ui/confirmar";
import { useRouter } from "@/i18n/navigation";
import { useAppStore } from "@/store/useAppStore";
import { LocaleToggle } from "./LocaleToggle";
import { cancelarPresentacion } from "@/components/presentacion/Conductor";

/** Bloque de Ajustes: idioma, volver al selector de perfil y «Reiniciar demo». Se usa en Yo, Locatario › Cuenta y Productor › Cuenta. */
export function AjustesDemo() {
  const t = useTranslations();
  const router = useRouter();
  const resetDemo = useAppStore((s) => s.resetDemo);
  const salirDePerfil = useAppStore((s) => s.salirDePerfil);
  const [confirmando, setConfirmando] = useState(false);

  const reiniciar = () => {
    cancelarPresentacion();
    resetDemo();
    toast.success(t("comun.demoReiniciada"));
    router.push("/");
  };

  return (
    <section aria-labelledby="ajustes" className="flex flex-col gap-4 rounded-card border border-border bg-white p-5">
      <h2 id="ajustes" className="text-xl font-bold text-morado-700">{t("yo.ajustes")}</h2>
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{t("yo.idioma")}</span>
        <LocaleToggle className="bg-morado-50 shadow-none" />
      </div>
      <Button
        variant="secondary"
        onClick={() => {
          salirDePerfil();
          router.push("/");
        }}
      >
        <House aria-hidden />
        {t("shell.volverInicio")}
      </Button>
      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="text-sm text-tinta-2">{t("yo.reiniciarTexto")}</p>
        <Button variant="secondary" onClick={() => setConfirmando(true)}>
          <RotateCcw aria-hidden />
          {t("comun.reiniciarDemo")}
        </Button>
      </div>
      <Confirmar
        abierto={confirmando}
        onCambio={setConfirmando}
        peligro
        icono={<RotateCcw className="size-5" aria-hidden />}
        titulo={t("yo.confirmarReinicioTitulo")}
        texto={t("yo.reiniciarTexto")}
        confirmar={t("yo.confirmarReinicio")}
        onConfirmar={reiniciar}
      />
    </section>
  );
}
