"use client";

import { useTranslations } from "next-intl";

import { useAhora } from "@/hooks/useAhora";
import { actividadPuesto } from "@/lib/inventario";

/** «● 23 pedidos hoy · el último hace 4 min»: actividad simulada que avanza con la hora. */
export function ActividadEnVivo({ puestoId }: { puestoId: string }) {
  const t = useTranslations("puesto");
  const ahora = useAhora();
  if (!ahora) return null;
  const a = actividadPuesto(puestoId, ahora);
  return (
    <p className="flex items-center gap-2 text-[13px] font-semibold text-nopal-700" aria-live="polite">
      <span className="relative flex size-2.5" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-nopal opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2.5 rounded-full bg-nopal" />
      </span>
      {a.pedidosHoy === 0 || a.hace === null ? t("actividadVacia") : t("actividad", { n: a.pedidosHoy, min: a.hace })}
    </p>
  );
}
