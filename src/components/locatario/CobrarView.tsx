"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, CreditCard, Delete, QrCode, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { teclear } from "@/lib/locatario";
import { formatMXN } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useAppStore, type Cobro } from "@/store/useAppStore";
import { EncabezadoPerfil } from "./EncabezadoPerfil";

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];
const ESPERA_MS = 3000;

/** M14 · Locatario › Cobrar: teclado → QR a pantalla completa → «Pago recibido» (+ vibración) → comprobante. */
export function CobrarView({ puestoNombre, puestoId }: { puestoNombre: string; puestoId: string }) {
  const t = useTranslations("locatario.cobrar");
  const locale = useLocale();
  const cobrar = useAppStore((s) => s.cobrar);
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<Cobro["metodo"]>("qr");
  const [fase, setFase] = useState<"teclado" | "esperando" | "recibido">("teclado");
  const [cobro, setCobro] = useState<Cobro | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const valor = Number(monto || 0);
  const $ = (n: number) => formatMXN(n, locale);

  useEffect(() => () => clearTimeout(timer.current), []);

  const generar = () => {
    if (!valor) return;
    setFase("esperando");
    timer.current = setTimeout(() => {
      const c = cobrar(valor, metodo);
      setCobro(c);
      setFase("recibido");
      navigator.vibrate?.([80, 40, 80]);
    }, ESPERA_MS);
  };

  const comprobante = () =>
    cobro
      ? t("comprobante", {
          puesto: puestoNombre,
          monto: $(cobro.monto),
          fecha: new Date(cobro.fecha).toLocaleString(locale === "en" ? "en-US" : "es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" }),
          id: cobro.id,
        })
      : "";

  const compartir = async () => {
    const texto = comprobante();
    if (navigator.share) {
      try {
        await navigator.share({ title: puestoNombre, text: texto });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await navigator.clipboard?.writeText(texto).catch(() => {});
    toast.success(t("copiado"));
  };

  const nuevo = () => {
    setMonto("");
    setCobro(null);
    setFase("teclado");
  };

  if (fase !== "teclado") {
    const payload = `BARABARA-${metodo === "qr" ? "CODI" : "LINK"}-DEMO|puesto=${puestoId}|monto=${valor.toFixed(2)}|mxn`;
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-morado p-6 text-center text-crema" aria-live="polite">
        <p className="font-semibold">{puestoNombre}</p>
        <p className="font-display text-6xl text-dorado-200">{$(valor)}</p>
        <div className="relative rounded-card bg-white p-4">
          <QRCodeSVG value={payload} size={230} fgColor="#3E1C3C" title={t("qrEtiqueta", { monto: $(valor), puesto: puestoNombre })} />
          {fase === "recibido" && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="absolute inset-0 grid place-items-center rounded-card bg-white/95">
              <CheckCircle2 className="size-28 text-nopal-700" aria-hidden />
            </motion.div>
          )}
        </div>
        <p className="text-sm">{metodo === "qr" ? t("sinComision") : t("linkPago")}</p>
        {fase === "esperando" ? (
          <p className="animate-pulse font-semibold">{t("esperando")}</p>
        ) : (
          <>
            <p className="font-display text-4xl text-dorado-200" role="status">
              {t("recibido", { monto: $(valor) })}
            </p>
            <div className="flex w-full max-w-xs flex-col gap-2">
              <Button variant="premium" onClick={compartir}>
                <Share2 aria-hidden />
                {t("compartir")}
              </Button>
              <Button variant="ghost" className="text-crema hover:bg-morado-700" onClick={nuevo}>
                {t("nuevo")}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <EncabezadoPerfil titulo={t("titulo")} subtitulo={puestoNombre} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <output className="flex flex-col items-center rounded-card bg-white p-4" aria-live="polite" aria-label={t("monto")}>
          <span className="text-[13px] text-tinta-2">{t("monto")}</span>
          <span className="font-display text-6xl text-morado-700">{$(valor)}</span>
        </output>
        <div role="radiogroup" aria-label={t("metodo")} className="grid grid-cols-2 gap-2">
          {(["qr", "tarjeta"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={metodo === m}
              onClick={() => setMetodo(m)}
              className={cn("flex min-h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold", metodo === m ? "border-morado bg-morado-50 text-morado-700" : "border-border bg-white")}
            >
              {m === "qr" ? <QrCode className="size-4" aria-hidden /> : <CreditCard className="size-4" aria-hidden />}
              {m === "qr" ? t("codi") : t("tarjeta")}
            </button>
          ))}
        </div>
        <p className="text-center text-[13px] font-semibold text-nopal-700">{metodo === "qr" ? t("sinComision") : t("tarjetaNota")}</p>
        <div className="grid grid-cols-3 gap-2">
          {TECLAS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setMonto((m) => teclear(m, k))}
              data-demo={`tecla-${k}`}
              aria-label={k === "⌫" ? t("borrar") : k === "C" ? t("limpiar") : k}
              className="grid h-16 place-items-center rounded-2xl bg-white text-2xl font-bold text-tinta shadow-sm active:bg-morado-50"
            >
              {k === "⌫" ? <Delete className="size-6" aria-hidden /> : k}
            </button>
          ))}
        </div>
        <Button size="lg" onClick={generar} disabled={!valor} data-demo="generar-cobro">
          <QrCode aria-hidden />
          {t("generar")}
        </Button>
      </div>
    </div>
  );
}
