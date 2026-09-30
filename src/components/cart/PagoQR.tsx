"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const SEGUNDOS = 3;

/** Pago CoDi/SPEI simulado: QR real con payload de demo, cuenta regresiva de 3 s y «Pago recibido». */
export function PagoQR({ payload, totalTexto, onPagado }: { payload: string; totalTexto: string; onPagado: () => void }) {
  const t = useTranslations("checkout");
  const [fase, setFase] = useState<"inicio" | "esperando" | "recibido">("inicio");
  const [restante, setRestante] = useState(SEGUNDOS);

  useEffect(() => {
    if (fase !== "esperando") return;
    if (restante <= 0) {
      const id = setTimeout(() => setFase("recibido"), 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [fase, restante]);

  useEffect(() => {
    if (fase !== "recibido") return;
    navigator.vibrate?.(80);
    const id = setTimeout(onPagado, 1100);
    return () => clearTimeout(id);
  }, [fase, onPagado]);

  if (fase === "inicio") {
    return (
      <Button size="lg" onClick={() => setFase("esperando")} data-demo="generar-qr">
        <QrCode aria-hidden />
        {t("generarQR")}
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-white p-5 text-center" aria-live="polite">
      <div className="relative">
        <QRCodeSVG value={payload} size={200} fgColor="#3E1C3C" title={t("qrEtiqueta", { total: totalTexto })} marginSize={2} />
        {fase === "recibido" && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 grid place-items-center rounded-xl bg-white/90"
          >
            <CheckCircle2 className="size-20 text-nopal-700" aria-hidden />
          </motion.div>
        )}
      </div>
      <p className="font-display text-3xl text-morado-700">{totalTexto}</p>
      {fase === "esperando" ? (
        <>
          <p className="text-sm text-tinta-2">{t("escaneaQR")}</p>
          <p className="font-semibold text-morado">{t("esperando", { s: restante })}</p>
        </>
      ) : (
        <p role="status" className="text-lg font-bold text-nopal-700">
          {t("pagoRecibido")}
        </p>
      )}
    </div>
  );
}
