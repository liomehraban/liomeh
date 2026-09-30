"use client";

import { useEffect } from "react";
import { useSerwist } from "@serwist/next/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

/**
 * Cuando hay una versión nueva instalada y esperando, avisa con «Recargar»: al tocarlo, la nueva
 * versión toma el control y la página se recarga una sola vez.
 */
export function AvisoActualizacion() {
  const { serwist } = useSerwist();
  const t = useTranslations("comun");
  useEffect(() => {
    if (!serwist) return;
    const alEsperar = () => {
      toast(t("nuevaVersion"), {
        duration: Infinity,
        action: {
          label: t("recargar"),
          onClick: () => {
            serwist.addEventListener("controlling", () => window.location.reload());
            void navigator.serviceWorker.getRegistration().then((r) => r?.waiting?.postMessage({ type: "SKIP_WAITING" }));
          },
        },
      });
    };
    serwist.addEventListener("waiting", alEsperar);
    return () => serwist.removeEventListener("waiting", alEsperar);
  }, [serwist, t]);
  return null;
}
