"use client";

import { useMemo } from "react";
import { Check, HandHeart, ShoppingBasket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { PhotoPlaceholder } from "@/components/market/PhotoPlaceholder";
import { formatMXN } from "@/lib/money";
import { rescatadaHoy, toneladasRescatadas, type OfertaRescate } from "@/lib/rescate";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { useRouter } from "@/i18n/navigation";
import { hoyCDMX } from "@/lib/eventos";

const boton =
  "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-pill px-2 text-[13px] font-semibold focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60";

/** M20 · Rescata hoy: carrusel de 4 ofertas −40% y contador de toneladas rescatadas. */
export function RescataHoy({ ofertas, kpiTon }: { ofertas: OfertaRescate[]; kpiTon: number }) {
  const t = useTranslations("rescate");
  const locale = useLocale();
  const hydrated = useHydrated();
  const router = useRouter();
  const rescates = useAppStore((s) => s.rescates);
  const rescatar = useAppStore((s) => s.rescatar);
  const agregar = useAppStore((s) => s.agregarAlCarrito);
  const carrito = useAppStore((s) => s.carrito);
  const kg = useMemo(() => (hydrated ? (rescates ?? []).reduce((s, r) => s + r.kg, 0) : 0), [hydrated, rescates]);
  const hoy = hoyCDMX();
  const hecha = (id: string) => hydrated && rescatadaHoy(id, rescates ?? [], hoy, (iso) => hoyCDMX(new Date(iso)));
  const enCarrito = (id: string) => hydrated && carrito.some((l) => l.items.some((i) => i.rescate?.ofertaId === id));
  const nombre = (o: OfertaRescate) => (locale === "en" && o.producto_en ? o.producto_en : o.producto);

  /** «Comprar»: el lote va al carrito de su vendedor y de ahí directo al pago (QR o tarjeta, con folio). */
  const comprar = (o: OfertaRescate) => {
    const v = o.vendedor;
    agregar(
      v.id,
      { nombre: `${nombre(o)} · ${t("titulo")}`, precio: o.precio, unidad: o.unidad, qty: 1, rescate: { ofertaId: o.id, kg: o.kg } },
      { id: v.id, tipo: "puesto", nombre: v.nombre, plan: "Gratis", giro: o.giro, ubicacion: o.mercadoNombre, mercadoId: o.mercadoId, mercadoNombre: o.mercadoNombre, lat: v.lat, lng: v.lng, stockProtegido: true, interior: v.interior },
    );
    toast.success(t("alCarrito", { hora: o.vence }));
    router.push(`/checkout?puesto=${v.id}`);
  };
  const nf = (n: number, d = 1) => new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: d }).format(n);

  return (
    <div className="flex flex-col gap-2 pb-1">
      <div className="mx-4 flex items-center justify-between rounded-2xl bg-nopal-700 px-3 py-2 text-white" aria-live="polite">
        <span className="text-[13px] font-semibold">{t("contador")}</span>
        <span className="flex items-baseline gap-2">
          <span className="text-xl font-bold">{nf(toneladasRescatadas(kpiTon, kg), 3)} t</span>
          {kg > 0 && <span className="text-[12px]">{t("tuyo", { kg: nf(kg) })}</span>}
        </span>
      </div>
      <ul className="flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {ofertas.map((o) => {
          const hecho = hecha(o.id);
          const pendiente = !hecho && enCarrito(o.id);
          return (
            <li key={o.id} className="flex w-64 shrink-0 snap-start flex-col gap-2 rounded-card border border-border bg-white p-2">
              <div className="flex gap-2">
                <div className="relative">
                  <PhotoPlaceholder giro={o.giro} className="aspect-square w-16 rounded-2xl" iconClassName="size-6" />
                  <span className="absolute -top-1 -left-1 rounded-pill bg-chile px-1.5 text-[11px] font-bold text-white">{t("descuento")}</span>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="line-clamp-2 text-[13px] leading-tight font-bold">{nombre(o)}</span>
                  <span className="truncate text-[12px] text-tinta-2">{o.mercadoNombre}</span>
                  <span className="text-[13px]">
                    <s className="text-gris">{formatMXN(o.precioOriginal, locale)}</s> <strong>{formatMXN(o.precio, locale)}</strong>
                  </span>
                  <span className="text-[12px] font-semibold text-chile">{t("vence", { hora: o.vence })}</span>
                </div>
              </div>
              {hecho ? (
                <p className="flex min-h-11 items-center justify-center gap-1.5 rounded-pill bg-nopal/10 text-[13px] font-bold text-nopal-700">
                  <Check className="size-4" aria-hidden />
                  {t("hecho")} · {t("kg", { kg: nf(o.kg) })}
                </p>
              ) : pendiente ? (
                <button type="button" className={cn(boton, "bg-primary text-primary-foreground")} onClick={() => router.push(`/checkout?puesto=${o.vendedor.id}`)}>
                  <ShoppingBasket className="size-4" aria-hidden />
                  {t("pagar")}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" className={cn(boton, "bg-primary text-primary-foreground")} onClick={() => comprar(o)}>
                    <ShoppingBasket className="size-4" aria-hidden />
                    {t("comprar")}
                  </button>
                  <button
                    type="button"
                    className={cn(boton, "border border-nopal text-nopal-700")}
                    aria-label={t("donar")}
                    onClick={() => {
                      rescatar(o.id, "donacion", o.kg);
                      toast.success(t("donado", { kg: nf(o.kg) }));
                    }}
                  >
                    <HandHeart className="size-4" aria-hidden />
                    {t("donarCorto")}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="px-4 text-[11px] text-tinta-2">{t("simulado")}</p>
    </div>
  );
}
