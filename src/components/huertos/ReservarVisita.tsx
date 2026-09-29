"use client";

import { useMemo, useState } from "react";
import { CalendarHeart, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Stepper } from "@/components/ui/stepper";
import { proximosDias } from "@/lib/huertos";
import { formatMXN } from "@/lib/money";
import type { Productor } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";

const fmtDia = (iso: string, locale: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { timeZone: "UTC", ...opts }).format(new Date(`${iso}T12:00:00Z`));

/** Reserva de visita al huerto: fecha de los próximos 14 días, personas y pago simulado. */
export function ReservarVisita({ p }: { p: Productor }) {
  const t = useTranslations("productor");
  const tp = useTranslations("puesto");
  const locale = useLocale();
  const hydrated = useHydrated();
  const reservar = useAppStore((s) => s.reservarVisita);
  const todas = useAppStore((s) => s.reservasVisita);
  const reservas = useMemo(() => (todas ?? []).filter((r) => r.productorId === p.id), [todas, p.id]);
  const dias = useMemo(() => proximosDias(14), []);
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState<string | null>(null);
  const [personas, setPersonas] = useState(2);
  const [procesando, setProcesando] = useState(false);
  const total = p.precio_visita * personas;

  const pagar = () => {
    if (!fecha) return;
    setProcesando(true);
    setTimeout(() => {
      const r = reservar({ productorId: p.id, fecha, personas, total });
      setProcesando(false);
      setAbierto(false);
      setFecha(null);
      toast.success(t("reservada", { fecha: fmtDia(r.fecha, locale, { weekday: "short", day: "numeric", month: "short" }), personas: r.personas, id: r.id }));
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-3 rounded-card bg-nopal/10 p-4">
      <p className="text-sm">{t("visitaTexto")}</p>
      <p className="font-bold">{t("porPersona", { precio: formatMXN(p.precio_visita, locale) })}</p>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="border-nopal text-nopal hover:bg-nopal/10">
            <CalendarHeart aria-hidden />
            {t("reservar")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("reservaTitulo", { nombre: p.nombre })}</DialogTitle>
            <DialogDescription>{t("porPersona", { precio: formatMXN(p.precio_visita, locale) })}</DialogDescription>
          </DialogHeader>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">{t("fecha")}</legend>
            <div role="radiogroup" aria-label={t("fecha")} className="grid grid-cols-4 gap-2">
              {dias.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={fecha === d}
                  aria-label={fmtDia(d, locale, { weekday: "long", day: "numeric", month: "long" })}
                  onClick={() => setFecha(d)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center rounded-2xl border text-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                    fecha === d ? "border-nopal bg-nopal text-white" : "border-border bg-white",
                  )}
                >
                  <span className="uppercase">{fmtDia(d, locale, { weekday: "short" }).replace(".", "")}</span>
                  <span className="text-base font-bold">{fmtDia(d, locale, { day: "numeric" })}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{t("personas")}</span>
            <Stepper valor={personas} onCambio={(v) => setPersonas(Math.min(10, v))} etiqueta={t("personas")} menos={tp("menos")} mas={tp("mas")} />
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-bold">{t("total")}</span>
            <span className="font-display text-3xl text-morado-700">{formatMXN(total, locale)}</span>
          </div>
          <Button onClick={pagar} disabled={!fecha || procesando}>
            {procesando && <Loader2 className="animate-spin" aria-hidden />}
            {procesando ? t("procesando") : t("pagar", { total: formatMXN(total, locale) })}
          </Button>
          <p className="text-center text-[13px] text-tinta-2">{t("pagoSimulado")}</p>
        </DialogContent>
      </Dialog>
      {hydrated && reservas.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-morado-700">{t("tusReservas")}</p>
          <ul className="text-sm">
            {reservas.map((r) => (
              <li key={r.id}>
                {t("reservada", { fecha: fmtDia(r.fecha, locale, { weekday: "short", day: "numeric", month: "short" }), personas: r.personas, id: r.id })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
