"use client";

import { CreditCard, QrCode } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagoQR } from "@/components/cart/PagoQR";
import { PagoTarjeta } from "@/components/cart/PagoTarjeta";
import { payloadCoDi } from "@/lib/checkout";
import { formatMXN } from "@/lib/money";

/** Pago simulado de un plan (QR CoDi o tarjeta de prueba 4242), igual que en el checkout. */
export function DialogoPagoPlan({
  abierto,
  onAbierto,
  nombre,
  monto,
  referencia,
  onPagado,
}: {
  abierto: boolean;
  onAbierto: (v: boolean) => void;
  nombre: string;
  monto: number;
  referencia: string;
  onPagado: () => void;
}) {
  const t = useTranslations("checkout");
  const tp = useTranslations("planes");
  const locale = useLocale();
  const total = formatMXN(monto, locale);
  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent className="max-h-[90%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tp("pagarTitulo", { plan: nombre })}</DialogTitle>
          <DialogDescription>{tp("pagarTexto", { total })}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="qr">
          <TabsList className="w-full">
            <TabsTrigger value="qr">
              <QrCode className="size-4" aria-hidden />
              {t("qr")}
            </TabsTrigger>
            <TabsTrigger value="tarjeta">
              <CreditCard className="size-4" aria-hidden />
              {t("tarjeta")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="qr" className="flex flex-col">
            <PagoQR payload={payloadCoDi(referencia, monto, "planes")} totalTexto={total} onPagado={onPagado} />
          </TabsContent>
          <TabsContent value="tarjeta">
            <PagoTarjeta totalTexto={total} onPagado={() => onPagado()} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
