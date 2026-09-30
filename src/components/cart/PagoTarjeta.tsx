"use client";

import { useState, type FormEvent, useEffect, useRef } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatearTarjeta, esTarjetaPrueba, luhn, vigenciaValida } from "@/lib/checkout";

type Errores = Partial<Record<"numero" | "nombre" | "vigencia" | "cvv", string>>;

/**
 * Pago con tarjeta simulado. Los datos viven solo en el estado de este componente:
 * no hay <form action>, no hay fetch y al store solo llegan los últimos 4 dígitos.
 */
export function PagoTarjeta({ totalTexto, onPagado }: { totalTexto: string; onPagado: (ultimos4: string) => void }) {
  const t = useTranslations("checkout");
  const [numero, setNumero] = useState("");
  const [nombre, setNombre] = useState("");
  const [vigencia, setVigencia] = useState("");
  const [cvv, setCvv] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [procesando, setProcesando] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Si la persona sale o cambia a QR mientras «procesa», el pago no se registra.
  useEffect(() => () => clearTimeout(timer.current), []);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const err: Errores = {};
    if (!luhn(numero)) err.numero = t("errNumero");
    else if (!esTarjetaPrueba(numero)) err.numero = t("errSoloPrueba");
    if (!nombre.trim()) err.nombre = t("errNombre");
    if (!vigenciaValida(vigencia)) err.vigencia = t("errVigencia");
    if (!/^\d{3,4}$/.test(cvv)) err.cvv = t("errCvv");
    setErrores(err);
    if (Object.keys(err).length) return;
    setProcesando(true);
    const ultimos4 = numero.replace(/\D/g, "").slice(-4);
    timer.current = setTimeout(() => {
      // Limpia los datos sensibles antes de salir.
      setNumero("");
      setCvv("");
      onPagado(ultimos4);
    }, 1500);
  };

  const campo = (id: keyof Errores, label: string, input: React.ReactNode) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`tarjeta-${id}`} className="text-sm font-semibold">
        {label}
      </label>
      {input}
      {errores[id] && (
        <p id={`tarjeta-${id}-error`} className="text-sm font-semibold text-chile">
          {errores[id]}
        </p>
      )}
    </div>
  );
  const aria = (id: keyof Errores) => ({ "aria-invalid": !!errores[id], "aria-describedby": errores[id] ? `tarjeta-${id}-error` : undefined });

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-3 rounded-card border border-border bg-white p-4" data-sin-red>
      <p className="flex items-start gap-2 rounded-2xl bg-morado-50 p-3 text-[13px] text-tinta-2">
        <ShieldCheck className="size-4 shrink-0 text-morado" aria-hidden />
        {t("prueba")}
      </p>
      {campo(
        "numero",
        t("numero"),
        <Input id="tarjeta-numero" inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" value={numero} onChange={(e) => setNumero(formatearTarjeta(e.target.value))} {...aria("numero")} />,
      )}
      {campo("nombre", t("nombre"), <Input id="tarjeta-nombre" autoComplete="off" value={nombre} onChange={(e) => setNombre(e.target.value)} {...aria("nombre")} />)}
      <div className="grid grid-cols-2 gap-3">
        {campo(
          "vigencia",
          t("vigencia"),
          <Input
            id="tarjeta-vigencia"
            inputMode="numeric"
            autoComplete="off"
            placeholder="12/28"
            value={vigencia}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 4);
              setVigencia(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
            }}
            {...aria("vigencia")}
          />,
        )}
        {campo(
          "cvv",
          t("cvv"),
          <Input id="tarjeta-cvv" inputMode="numeric" autoComplete="off" type="password" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))} {...aria("cvv")} />,
        )}
      </div>
      <Button type="submit" size="lg" disabled={procesando}>
        {procesando ? <Loader2 className="animate-spin" aria-hidden /> : <CreditCard aria-hidden />}
        {procesando ? t("procesando") : t("pagar", { total: totalTexto })}
      </Button>
    </form>
  );
}
