"use client";

import { useMemo } from "react";
import { CalendarHeart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DialogoReserva, fmtDia } from "@/components/ui/dialogo-reserva";
import { formatMXN } from "@/lib/money";
import type { Productor } from "@/lib/schemas";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/** Reserva de visita al huerto: fecha de los próximos 14 días, personas y pago simulado. */
export function ReservarVisita({ p }: { p: Productor }) {
  const t = useTranslations("productor");
  const locale = useLocale();
  const hydrated = useHydrated();
  const reservar = useAppStore((s) => s.reservarVisita);
  const todas = useAppStore((s) => s.reservasVisita);
  const reservas = useMemo(() => (todas ?? []).filter((r) => r.productorId === p.id), [todas, p.id]);
  const texto = (r: { fecha: string; personas: number; id: string }) =>
    t("reservada", { fecha: fmtDia(r.fecha, locale, { weekday: "short", day: "numeric", month: "short" }), personas: r.personas, id: r.id });

  return (
    <div className="flex flex-col gap-3 rounded-card bg-nopal/10 p-4">
      <p className="text-sm">{t("visitaTexto")}</p>
      <p className="font-bold">{t("porPersona", { precio: formatMXN(p.precio_visita, locale) })}</p>
      <DialogoReserva
        titulo={t("reservaTitulo", { nombre: p.nombre })}
        precioPorPersona={p.precio_visita}
        onConfirmar={(r) => toast.success(texto(reservar({ productorId: p.id, ...r })))}
        trigger={
          <Button variant="secondary" className="border-nopal text-nopal hover:bg-nopal/10">
            <CalendarHeart aria-hidden />
            {t("reservar")}
          </Button>
        }
      />
      {hydrated && reservas.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-morado-700">{t("tusReservas")}</p>
          <ul className="text-sm">
            {reservas.map((r) => (
              <li key={r.id}>{texto(r)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
