"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Confirmar } from "@/components/ui/confirmar";
import { enIdioma } from "@/lib/idioma";
import type { Lealtad } from "@/lib/schemas";
import { useAppStore, useHydrated } from "@/store/useAppStore";

export function Recompensas({ recompensas }: { recompensas: Lealtad["recompensas"] }) {
  const t = useTranslations("pasaporte");
  const locale = useLocale();
  /** El cupón guarda el título al canjearse; se muestra el de la recompensa en el idioma actual. */
  const tituloCupon = (c: { recompensaId: string; titulo: string }) => {
    const r = recompensas.find((x) => x.id === c.recompensaId);
    return r ? enIdioma(r, "titulo", locale) : c.titulo;
  };
  const hydrated = useHydrated();
  const puntos = useAppStore((s) => s.puntos);
  const cupones = useAppStore((s) => s.cupones) ?? [];
  const canjear = useAppStore((s) => s.canjear);
  // Canjear descuenta puntos y no se deshace: primero se confirma.
  const [porCanjear, setPorCanjear] = useState<(typeof recompensas)[number] | null>(null);
  return (
    <section aria-labelledby="recompensas" className="flex flex-col gap-3">
      <h2 id="recompensas" className="text-xl font-bold text-morado-700">
        {t("recompensas")}
      </h2>
      <ul data-revelar className="flex flex-col gap-2">
        {recompensas.map((r) => {
          const alcanza = hydrated && puntos >= r.puntos;
          const faltan = hydrated ? Math.max(0, r.puntos - puntos) : null;
          const titulo = enIdioma(r, "titulo", locale);
          return (
            <li key={r.id} className="flex flex-col gap-2.5 rounded-2xl border border-border bg-white p-3">
              <span className="flex items-start gap-3">
                <Gift className="mt-0.5 size-5 shrink-0 text-dorado" aria-hidden />
                <span className="min-w-0 flex-1 text-sm font-semibold">{titulo}</span>
              </span>
              {/* El botón va en su propia fila a todo lo ancho: el título no se aprieta a 3 líneas. */}
              <Button
                size="sm"
                variant={alcanza ? "premium" : "secondary"}
                disabled={!alcanza}
                className="w-full"
                aria-label={`${titulo}: ${alcanza ? t("canjear", { n: r.puntos }) : faltan ? t("faltanPts", { n: faltan }) : t("sinPuntos")}`}
                onClick={() => setPorCanjear(r)}
              >
                {t("canjear", { n: r.puntos })}
              </Button>
              {!alcanza && faltan !== null && faltan > 0 && (
                <p aria-hidden className="-mt-1 text-center text-[13px] font-semibold text-tinta-2">
                  {t("faltanPts", { n: faltan })}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {hydrated && cupones.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-morado-700">{t("cupones")}</h3>
          <ul className="carrusel gap-3 pb-1">
            {cupones.map((c) => (
              <li key={c.id} className="flex w-44 shrink-0 snap-start flex-col items-center gap-1 rounded-card border-2 border-dashed border-dorado bg-dorado-200/40 p-3 text-center">
                <QRCodeSVG value={c.codigo} size={96} fgColor="#3E1C3C" bgColor="transparent" title={t("cuponEtiqueta", { codigo: c.codigo })} />
                <span className="text-[13px] font-bold">{tituloCupon(c)}</span>
                <span className="font-mono text-xs text-tinta-2">{c.codigo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {porCanjear && (
        <Confirmar
          abierto
          onCambio={(v) => !v && setPorCanjear(null)}
          icono={<Gift className="size-5 text-dorado" aria-hidden />}
          titulo={t("confirmarCanjeTitulo", { titulo: enIdioma(porCanjear, "titulo", locale) })}
          texto={t("confirmarCanjeTexto", { n: porCanjear.puntos, resto: puntos - porCanjear.puntos })}
          confirmar={t("confirmarCanje", { n: porCanjear.puntos })}
          onConfirmar={() => {
            const c = canjear(porCanjear);
            if (c) toast.success(t("canjeada", { codigo: c.codigo }));
          }}
        />
      )}
    </section>
  );
}
