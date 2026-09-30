"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PantallaError } from "@/components/errores/PantallaError";
import { cancelarPresentacion } from "@/components/presentacion/Conductor";
import { useAppStore } from "@/store/useAppStore";

const CLAVE_RECARGA = "barabara-recarga-chunk";
/** Tras un deploy, una pestaña abierta puede pedir un chunk que ya no existe. */
const esChunkViejo = (e: Error) => e.name === "ChunkLoadError" || /Loading chunk|dynamically imported module|Importing a module script failed/i.test(e.message);

/** Error inesperado en una pantalla: reintentar, o reiniciar la demo si el estado quedó dañado. */
export default function ErrorPantalla({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations("errores");
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
    // Un chunk viejo se arregla recargando (una sola vez, para no entrar en bucle).
    try {
      if (esChunkViejo(error) && !sessionStorage.getItem(CLAVE_RECARGA)) {
        sessionStorage.setItem(CLAVE_RECARGA, "1");
        window.location.reload();
      }
    } catch {
      /* sin sessionStorage: se muestra la pantalla */
    }
  }, [error]);

  const reiniciar = () => {
    cancelarPresentacion();
    useAppStore.getState().resetDemo();
    // Recarga completa a propósito: el estado anterior pudo quedar dañado.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/${locale}`;
  };

  return (
    <PantallaError icono={TriangleAlert} titulo={t("errorTitulo")} texto={t("errorTexto")}>
      <Button onClick={() => retry()}>
        <RotateCcw aria-hidden />
        {t("reintentar")}
      </Button>
      <Button variant="secondary" onClick={reiniciar}>
        {t("reiniciarDemo")}
      </Button>
    </PantallaError>
  );
}
