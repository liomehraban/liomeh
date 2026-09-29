"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { etapaActual, etapas, type Pedido } from "@/lib/pedidos";
import { cn } from "@/lib/utils";

/** Timeline Pagado → Preparando → Listo / En ruta; avanza solo cada 8 s en modo demo. */
export function TimelinePedido({ pedido }: { pedido: Pick<Pedido, "fecha" | "entrega"> }) {
  const t = useTranslations("pedido");
  const [now, setNow] = useState(() => new Date());
  const lista = etapas(pedido.entrega);
  const actual = etapaActual(pedido, now);

  useEffect(() => {
    if (actual >= lista.length - 1) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [actual, lista.length]);

  return (
    <section aria-labelledby="estado" className="flex flex-col gap-3 rounded-card border border-border bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="estado" className="text-lg font-bold text-morado-700">
          {t("estado")}
        </h2>
        <span className="text-xs text-tinta-2">{t("demo")}</span>
      </div>
      <ol className="flex flex-col" aria-live="polite">
        {lista.map((e, i) => {
          const hecho = i <= actual;
          return (
            <li key={e} className="flex items-center gap-3" aria-current={i === actual ? "step" : undefined}>
              <span className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border-2 transition-colors duration-300",
                    hecho ? "border-nopal bg-nopal text-white" : "border-gris/40 bg-white text-transparent",
                  )}
                >
                  <Check className="size-4" aria-hidden />
                </span>
                {i < lista.length - 1 && <span className={cn("h-5 w-0.5", i < actual ? "bg-nopal" : "bg-gris/30")} aria-hidden />}
              </span>
              <span className={cn("pb-5 font-semibold", !hecho && "text-gris", i === lista.length - 1 && "pb-0")}>{t(`etapas.${e}`)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
