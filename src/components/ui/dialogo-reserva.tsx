"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Stepper } from "@/components/ui/stepper";
import { proximosDias } from "@/lib/huertos";
import { formatMXN } from "@/lib/money";
import { cn } from "@/lib/utils";

export const fmtDia = (iso: string, locale: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", { timeZone: "UTC", ...opts }).format(new Date(`${iso}T12:00:00Z`));

/** Diálogo genérico de reserva: día (próximos 14), personas y pago simulado de 1.5 s. */
export function DialogoReserva({
  trigger,
  titulo,
  descripcion,
  precioPorPersona,
  onConfirmar,
}: {
  trigger: ReactNode;
  titulo: string;
  descripcion?: string;
  precioPorPersona: number;
  onConfirmar: (r: { fecha: string; personas: number; total: number }) => void;
}) {
  const t = useTranslations("productor");
  const tp = useTranslations("puesto");
  const locale = useLocale();
  const dias = useMemo(() => proximosDias(14), []);
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState<string | null>(null);
  const [personas, setPersonas] = useState(2);
  const [procesando, setProcesando] = useState(false);
  const total = precioPorPersona * personas;

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const pagar = () => {
    if (!fecha || procesando) return;
    setProcesando(true);
    timer.current = setTimeout(() => {
      onConfirmar({ fecha, personas, total });
      setProcesando(false);
      setAbierto(false);
      setFecha(null);
    }, 1500);
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !procesando && setAbierto(v)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion ?? t("porPersona", { precio: formatMXN(precioPorPersona, locale) })}</DialogDescription>
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
                  fecha === d ? "border-nopal-700 bg-nopal-700 text-white" : "border-border bg-white",
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
  );
}
