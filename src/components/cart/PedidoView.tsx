"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Navigation } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Celebracion } from "@/components/motion/Celebracion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { FairTradeCard } from "@/components/fairtrade/FairTradeCard";
import type { PuestoResumen } from "@/data/comercio";
import { formatMXN, formatUSDaprox } from "@/lib/money";
import type { Productor } from "@/lib/schemas";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoSimple } from "./EncabezadoSimple";
import { SelloPuntos } from "./SelloPuntos";
import { TimelinePedido } from "./TimelinePedido";
import { esPuestoSimulado } from "@/lib/catalogo-simulado";
import { comoLlegarUrl } from "@/lib/geo";

/** M5 · Confirmación del pedido. */
export function PedidoView({ folio, puestos, productores }: { folio: string; puestos: Record<string, PuestoResumen>; productores: Productor[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const hydrated = useHydrated();
  const pedido = useAppStore((s) => s.pedidos.find((p) => p.folio === folio));
  const vendedores = useAppStore((s) => s.vendedores);
  const $ = (n: number) => formatMXN(n, locale);
  // Momento de apertura: la celebración solo sale si el pedido se acaba de pagar.
  const [ahora] = useState(() => Date.now());

  if (!hydrated) return <EncabezadoSimple titulo={t("pedido.titulo")} destino="/yo" />;
  if (!pedido) {
    return (
      <div className="flex min-h-full flex-col">
        <EncabezadoSimple titulo={t("pedido.titulo")} destino="/yo" />
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-tinta-2">{t("pedido.noEncontrado")}</p>
          <Button asChild variant="secondary">
            <Link href="/explorar">{t("pedido.seguir")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const puesto = puestos[pedido.puestoId] ?? vendedores[pedido.puestoId];
  const huertos = [...new Set(pedido.items.map((i) => i.huertoId).filter(Boolean))];
  const prods = productores.filter((p) => huertos.includes(p.id));

  const recienPagado = ahora - new Date(pedido.fecha).getTime() < 60_000;

  return (
    <div className="relative flex min-h-full flex-col">
      {recienPagado && <Celebracion />}
      <EncabezadoSimple titulo={t("pedido.titulo")} destino="/yo" />
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-tinta-2">{t("pedido.folio")}</p>
          <p className="font-display text-5xl text-morado-700" data-folio>
            {pedido.folio}
          </p>
          <p className="text-tinta-2">{t("pedido.gracias")}</p>
        </div>

        <SelloPuntos
          puntos={pedido.puntos}
          formato={(n) => t("pedido.puntos", { n })}
          subtitulo={pedido.dobles ? t("pedido.puntosDobles") : t("pedido.sello", { mercado: puesto?.mercadoNombre ?? pedido.mercadoId })}
        />

        <TimelinePedido pedido={pedido} />

        {pedido.entrega === "recoger" && (
          <section className="flex flex-col items-center gap-2 rounded-card border border-border bg-white p-4 text-center">
            <h2 className="font-bold text-morado-700">{t("pedido.qrRecoger")}</h2>
            <QRCodeSVG value={`BARABARA-RECOGER|${pedido.folio}|${pedido.puestoId}`} size={160} fgColor="#3E1C3C" marginSize={2} title={t("pedido.qrEtiqueta", { folio: pedido.folio })} />
          </section>
        )}

        <section className="flex flex-col gap-2 rounded-card border border-border bg-white p-4 text-sm">
          <h2 className="text-lg font-bold text-morado-700">{puesto?.nombre ?? pedido.puestoId}</h2>
          <ul className="flex flex-col gap-1">
            {pedido.items.map((i) => (
              <li key={i.nombre} className="flex justify-between gap-3">
                <span>
                  {i.qty} × {i.nombre}
                </span>
                <span>{$(i.precio * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-border pt-2 text-base font-bold">
            <span>{t("checkout.total")}</span>
            <span className="text-right">
              {$(pedido.total)}
              {locale === "en" && <span className="block text-xs font-normal text-tinta-2">{formatUSDaprox(pedido.total)}</span>}
            </span>
          </div>
          <p className="text-tinta-2">
            {t("pedido.pagadoCon", {
              metodo: pedido.metodo === "qr" ? t("pedido.qr") : t("pedido.tarjeta", { ultimos: pedido.tarjetaUltimos4 ?? "" }),
            })}{" "}
            · {pedido.entrega === "recoger" ? t("pedido.entregaRecoger") : t("pedido.entregaEnvio", { proveedor: pedido.proveedor ?? "" })}
          </p>
        </section>

        {prods.map((p) => (
          <FairTradeCard key={p.id} productor={p} mercado={puesto?.tipo === "puesto" ? puesto.mercadoNombre.replace(/^Mercado de /, "") : undefined} />
        ))}

        <div className="flex flex-col gap-3">
          {puesto?.tipo === "puesto" && (puesto.interior ?? !esPuestoSimulado(puesto.id)) && (
            <Button asChild>
              <Link href={`/mercado/${puesto.mercadoId}/interior?puesto=${puesto.id}`}>
                <Navigation aria-hidden />
                {t("pedido.llevame")}
              </Link>
            </Button>
          )}
          {puesto?.tipo === "puesto" && !(puesto.interior ?? !esPuestoSimulado(puesto.id)) && (
            <Button asChild>
              <a href={comoLlegarUrl(puesto)} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden />
                {t("puesto.comoLlegar", { mercado: puesto.mercadoNombre })}
              </a>
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link href="/explorar">{t("pedido.seguir")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
