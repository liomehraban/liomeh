import { HandHeart, Sprout, Store, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { precioJusto, productoCorto } from "@/lib/fairtrade";
import { formatMXN } from "@/lib/money";
import type { Productor } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type Props = {
  productor: Pick<Productor, "nombre" | "titular" | "pueblo" | "alcaldia" | "producto_principal" | "km_a_la_merced" | "comercio_justo">;
  /** Producto para el copy; por default, el producto principal del productor. */
  producto?: string;
  /** Nombre del mercado destino (default La Merced, al que se mide `km_a_la_merced`). */
  mercado?: string;
  className?: string;
};

/**
 * M7 · Del huerto a tu mesa: recorrido huerto → mercado → tú y barra de precio justo.
 * Todo sale de `comercio_justo`. Las barras tienen texto equivalente para lector de pantalla.
 */
export function FairTradeCard({ productor: p, producto, mercado = "La Merced", className }: Props) {
  const t = useTranslations("fairtrade");
  const locale = useLocale();
  const f = precioJusto(p);
  const $ = (n: number) => formatMXN(n, locale);
  const km = new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: 1 }).format(p.km_a_la_merced);

  const barras = [
    { etiqueta: t("conIntermediarios"), pct: f.pctIntermediarios, monto: f.antes, color: "bg-gris" },
    { etiqueta: t("conApp"), pct: f.pctApp, monto: f.recibe, color: "bg-nopal" },
  ];

  return (
    <section className={cn("flex flex-col gap-4 rounded-card border border-dorado/60 bg-dorado-200/40 p-4", className)}>
      <h3 className="flex items-center gap-2 font-bold text-morado-700">
        <HandHeart className="size-5 text-dorado" aria-hidden />
        {t("titulo")}
      </h3>

      {/* Recorrido huerto → mercado → tú */}
      <ol className="flex items-start justify-between gap-1 text-center text-[13px]">
        {[
          { icono: Sprout, titulo: t("huerto"), texto: `${p.pueblo}, ${p.alcaldia}`, sub: p.nombre, color: "bg-nopal" },
          { icono: Store, titulo: t("mercado"), texto: mercado, sub: t("km", { km }), color: "bg-morado" },
          { icono: UserRound, titulo: t("tu"), texto: "", sub: "", color: "bg-dorado" },
        ].map((paso, i) => (
          <li key={paso.titulo} className="relative flex flex-1 flex-col items-center gap-1">
            {i > 0 && <span aria-hidden className="absolute top-5 right-1/2 -z-0 h-0.5 w-full border-t-2 border-dashed border-morado/30" />}
            <span className={cn("relative z-10 grid size-10 place-items-center rounded-full text-white", paso.color)}>
              <paso.icono className="size-5" aria-hidden />
            </span>
            <span className="font-bold">{paso.titulo}</span>
            {paso.texto && <span className="text-tinta-2">{paso.texto}</span>}
            {paso.sub && <span className="font-semibold text-tinta-2">{paso.sub}</span>}
          </li>
        ))}
      </ol>

      {/* Barras de precio justo */}
      <div className="flex flex-col gap-2">
        {barras.map((b) => (
          <div key={b.etiqueta} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{b.etiqueta}</span>
              <span aria-hidden>
                <strong>{$(b.monto)}</strong> · {b.pct}%
              </span>
            </div>
            <div
              role="img"
              aria-label={t("barra", { etiqueta: b.etiqueta, monto: $(b.monto), pct: b.pct, precio: $(f.precio) })}
              className="h-3 overflow-hidden rounded-pill bg-white"
            >
              <div className={cn("h-full rounded-pill", b.color)} style={{ width: `${b.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm">
        {t("copy", {
          precio: $(f.precio),
          unidad: f.unidad,
          producto: producto ?? productoCorto(p.producto_principal),
          recibe: $(f.recibe),
          nombre: p.nombre,
          antes: $(f.antes),
        })}{" "}
        <strong className="text-nopal">{f.esDoble ? t("doble") : t("mejora", { pct: f.mejoraPct })}</strong>
      </p>
    </section>
  );
}
