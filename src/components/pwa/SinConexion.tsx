"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/** Página de respaldo del service worker: el pasaporte y los pedidos viven en localStorage. */
export function SinConexion() {
  const t = useTranslations("offline");
  const hydrated = useHydrated();
  const sellos = useAppStore((s) => s.sellos.length);
  const pedidos = useAppStore((s) => s.pedidos.length);
  const puntos = useAppStore((s) => s.puntos);
  return (
    <main id="contenido" className="flex h-full flex-col items-center justify-center gap-5 overflow-y-auto bg-crema px-6 text-center">
      <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
      <span className="grid size-20 place-items-center rounded-full bg-morado text-crema">
        <WifiOff className="size-9" aria-hidden />
      </span>
      <h1 className="font-display text-4xl text-morado-700">{t("titulo")}</h1>
      <p className="text-lg font-semibold">{t("texto")}</p>
      <p className="text-tinta-2">{t("detalle")}</p>
      {hydrated && (
        <p className="rounded-pill bg-white px-4 py-2 text-sm font-semibold text-morado-700">
          {t("resumen", { sellos, puntos, pedidos })}
        </p>
      )}
      <div className="flex w-full flex-col gap-2">
        <Button asChild>
          <Link href="/yo">{t("pasaporte")}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/yo#mis-pedidos">{t("pedidos")}</Link>
        </Button>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          <RefreshCw aria-hidden />
          {t("reintentar")}
        </Button>
      </div>
    </main>
  );
}
