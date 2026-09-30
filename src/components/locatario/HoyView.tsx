"use client";

import { useMemo } from "react";
import { BadgeCheck, ChevronRight, Coins, QrCode, Receipt, ShoppingBag, Star, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useAhora } from "@/hooks/useAhora";
import { indiceSemana, saludoPorHora, semanaConHoy, type KpisBase } from "@/lib/locatario";
import { formatMXN } from "@/lib/money";
import type { Resena, UsuariosDemo } from "@/lib/schemas";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoPerfil } from "./EncabezadoPerfil";
import { nombreCorto, useKpisLocatario } from "./useLocatario";
import { VentasSemana } from "./VentasSemana";

/** M13 · Locatario › Hoy. */
export function HoyView({ demo, puestoNombre, mercadoNombre, resenas }: { demo: UsuariosDemo["locatario"]; puestoNombre: string; mercadoNombre: string; resenas: Resena[] }) {
  const t = useTranslations("locatario");
  const tm = useTranslations("mercado");
  const locale = useLocale();
  const ahora = useAhora();
  const hydrated = useHydrated();
  const { kpis, extraHoy } = useKpisLocatario(demo.hoy as KpisBase, demo.puesto_id);
  const pedidos = useAppStore((s) => s.locatario.pedidos);
  const propias = useAppStore((s) => s.resenasPropias);
  const pendientes = hydrated ? pedidos.filter((p) => p.estado !== "entregado").length : demo.pedidos_pendientes.length;
  const ultimas = useMemo(
    () => [...(hydrated ? propias.filter((r) => r.objetivo_id === demo.puesto_id) : []), ...[...resenas].sort((a, b) => b.fecha.localeCompare(a.fecha))].slice(0, 3),
    [hydrated, propias, resenas, demo.puesto_id],
  );
  const $ = (n: number) => formatMXN(n, locale);
  const saludo = ahora ? saludoPorHora(ahora) : "dias";

  const tarjetas = [
    { k: "ventas_mxn", v: $(kpis.ventas_mxn), icon: TrendingUp, grande: true },
    { k: "pedidos_app", v: kpis.pedidos_app, icon: ShoppingBag },
    { k: "cobros_qr", v: kpis.cobros_qr, icon: QrCode },
    { k: "checkins_efectivo", v: kpis.checkins_efectivo, icon: Coins },
    { k: "ticket_promedio", v: $(kpis.ticket_promedio), icon: Receipt },
  ] as const;

  return (
    <div className="flex flex-col">
      <EncabezadoPerfil titulo={t(`saludo.${saludo}`, { nombre: nombreCorto(demo.nombre) })} subtitulo={t("puesto", { puesto: puestoNombre, mercado: mercadoNombre })} />
      <div className="flex flex-col gap-5 p-5">
        <dl className="grid grid-cols-2 gap-3" aria-live="polite">
          {tarjetas.map(({ k, v, icon: Icono, ...r }) => (
            <div key={k} className={"grande" in r ? "col-span-2 rounded-card bg-morado p-4 text-crema" : "rounded-card border border-border bg-white p-4"}>
              <dt className="flex items-center gap-1.5 text-[13px] font-semibold">
                <Icono className="size-4" aria-hidden />
                {t(`kpis.${k}`)}
              </dt>
              <dd className={"grande" in r ? "font-display text-5xl text-dorado-200" : "font-display text-3xl text-morado-700"}>{v}</dd>
            </div>
          ))}
        </dl>

        <p className="flex items-start gap-2 rounded-card bg-nopal p-4 text-sm font-semibold text-white" role="status">
          <Coins className="mt-0.5 size-5 shrink-0" aria-hidden />
          {t("banner", { n: kpis.checkins_efectivo })}
        </p>

        <Link href="/locatario/pedidos" className="flex min-h-11 items-center justify-between rounded-card border border-border bg-white p-4 font-semibold">
          <span className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-morado" aria-hidden />
            {t("pendientes", { n: pendientes })}
          </span>
          <span className="flex items-center gap-1 text-sm text-morado">
            {t("verPedidos")}
            <ChevronRight className="size-4" aria-hidden />
          </span>
        </Link>

        <VentasSemana datos={semanaConHoy(demo.semana, extraHoy, ahora ?? undefined)} hoy={indiceSemana(ahora ?? undefined)} />

        <section aria-labelledby="top" className="flex flex-col gap-2">
          <h2 id="top" className="text-xl font-bold text-morado-700">
            {t("top")}
          </h2>
          <ol className="flex flex-col gap-2">
            {demo.top_productos.map((p, i) => (
              <li key={p} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3">
                <span className="grid size-8 place-items-center rounded-full bg-dorado font-bold text-morado-900">{i + 1}</span>
                <span className="font-semibold">{p}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="ult-resenas" className="flex flex-col gap-2">
          <h2 id="ult-resenas" className="text-xl font-bold text-morado-700">
            {t("resenas")}
          </h2>
          <ul className="flex flex-col gap-2">
            {ultimas.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 rounded-2xl border border-border bg-white p-3 text-sm">
                <span className="flex items-center justify-between font-semibold">
                  {r.autor}
                  <span className="flex items-center gap-0.5 text-dorado" aria-label={`${r.estrellas}/5`}>
                    <Star className="size-4 fill-dorado" aria-hidden />
                    {r.estrellas}
                  </span>
                </span>
                <span lang={r.idioma}>{r.texto}</span>
                <span className="flex items-center gap-1 text-[12px] text-nopal">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  {r.verificada === "compra" ? tm("verificadaCompra") : tm("verificadaCheckin")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
