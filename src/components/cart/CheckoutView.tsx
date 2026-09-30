"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bike, CreditCard, Loader2, QrCode, Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useRouter } from "@/i18n/navigation";
import type { ColoniaEntrega, PuestoResumen } from "@/data/comercio";
import { payloadCoDi, PROVEEDORES, resumenPedido, costoEnvio, type Entrega, type ProveedorId } from "@/lib/checkout";
import { useVocabulario } from "@/hooks/useVocabulario";
import { haversine } from "@/lib/geo";
import { formatMXN, formatUSDaprox } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoSimple } from "./EncabezadoSimple";
import { PagoQR } from "./PagoQR";
import { PagoTarjeta } from "./PagoTarjeta";
import { NumeroAnimado } from "@/components/motion/NumeroAnimado";

const opcion =
  "flex min-h-11 w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

/** M5 · Checkout de un pedido (un grupo del carrito). */
export function CheckoutView({ puestos, colonias }: { puestos: Record<string, PuestoResumen>; colonias: ColoniaEntrega[] }) {
  const t = useTranslations("checkout");
  const voc = useVocabulario();
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();
  const params = useSearchParams();
  // Sin ?puesto (enlace directo) se paga el primer pedido del carrito en vez de mostrar un callejón sin salida.
  const primero = useAppStore((s) => s.carrito[0]?.puestoId ?? "");
  const puestoId = params.get("puesto") ?? primero;
  const linea = useAppStore((s) => s.carrito.find((l) => l.puestoId === puestoId));
  const vendedores = useAppStore((s) => s.vendedores);
  const plan = useAppStore((s) => s.plan);
  const registrar = useAppStore((s) => s.registrarPedido);
  const puesto = puestos[puestoId] ?? vendedores[puestoId];

  const [tipo, setTipo] = useState<"recoger" | "envio">("recoger");
  const [alcaldia, setAlcaldia] = useState("");
  const [colonia, setColonia] = useState("");
  const [proveedor, setProveedor] = useState<ProveedorId>("rappi");
  const pagado = useRef(false);
  // Al pagar, el grupo sale del carrito antes de que llegue la pantalla del pedido: se muestra «Confirmando…».
  const [confirmando, setConfirmando] = useState(false);
  const [refPago] = useState(() => `REF-${Math.floor(100000 + Math.random() * 900000)}`);

  const alcaldias = useMemo(() => [...new Set(colonias.map((c) => c.alcaldia))], [colonias]);
  const destino = colonias.find((c) => c.alcaldia === alcaldia && c.colonia === colonia);
  const km = destino && puesto ? haversine(puesto, destino) / 1000 : null;

  const entrega = useMemo<Entrega | null>(
    () => (tipo === "recoger" ? { tipo: "recoger" } : km !== null ? { tipo: "envio", proveedor, distanciaKm: km } : null),
    [tipo, km, proveedor],
  );
  const resumen = useMemo(() => (linea && puesto && entrega ? resumenPedido(linea, plan, puesto.plan, entrega) : null), [linea, puesto, entrega, plan]);
  // Mientras falta la colonia, el resumen se sigue viendo (sin envío) y el pago espera a que la elija.
  const vista = useMemo(() => resumen ?? (linea && puesto ? resumenPedido(linea, plan, puesto.plan, { tipo: "recoger" }) : null), [resumen, linea, puesto, plan]);
  const $ = (n: number) => formatMXN(n, locale);

  const finalizar = useCallback(
    (metodo: "qr" | "tarjeta", ultimos4?: string) => {
      if (pagado.current || !linea || !puesto || !resumen || !entrega) return;
      pagado.current = true;
      setConfirmando(true);
      const pedido = registrar({
        puestoId: linea.puestoId,
        mercadoId: puesto.mercadoId,
        items: linea.items,
        resumen,
        metodo,
        tarjetaUltimos4: ultimos4,
        entrega: entrega.tipo,
        proveedor: entrega.tipo === "envio" ? PROVEEDORES.find((p) => p.id === entrega.proveedor)?.nombre : undefined,
      });
      router.replace(`/pedido/${pedido.folio}`);
    },
    [linea, puesto, resumen, entrega, registrar, router],
  );

  if (!hydrated) return <EncabezadoSimple titulo={t("titulo")} fallback="/carrito" />;
  if (confirmando) {
    return (
      <div className="flex min-h-full flex-col">
        <EncabezadoSimple titulo={t("titulo")} fallback="/carrito" />
        <p className="flex items-center justify-center gap-2 p-10 font-semibold text-morado-700" role="status">
          <Loader2 className="size-5 animate-spin" aria-hidden />
          {t("confirmando")}
        </p>
      </div>
    );
  }
  if (!linea || !puesto) {
    return (
      <div className="flex min-h-full flex-col">
        <EncabezadoSimple titulo={t("titulo")} fallback="/carrito" />
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-tinta-2">{t("sinPedido")}</p>
          <Button asChild variant="secondary">
            <Link href="/carrito">{t("volverCarrito")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <EncabezadoSimple titulo={t("titulo")} fallback="/carrito" />
      <div className="flex flex-col gap-6 p-5">
        <p className="font-bold text-morado-700">
          {puesto.nombre} <span className="font-normal text-tinta-2">· {puesto.mercadoNombre}</span>
        </p>

        {/* Entrega */}
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-xl font-bold text-morado-700">{t("entrega")}</legend>
          <div role="radiogroup" aria-label={t("entrega")} className="flex flex-col gap-2">
          {(["recoger", "envio"] as const).map((op) => (
            <button
              key={op}
              type="button"
              role="radio"
              aria-checked={tipo === op}
              onClick={() => setTipo(op)}
              className={cn(opcion, tipo === op ? "border-morado bg-morado-50" : "border-border bg-white")}
            >
              {op === "recoger" ? <Store className="size-5 text-morado" aria-hidden /> : <Bike className="size-5 text-morado" aria-hidden />}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">{op === "recoger" ? (puesto.tipo === "productor" ? t("recogerProductor") : t("recoger")) : t("envio")}</span>
                <span className="text-[13px] text-tinta-2">{op === "recoger" ? (puesto.recogida ?? t("recogerTiempo")) : t("envioTexto")}</span>
              </span>
              {/* Indicador de selección tipo radio (no solo el tinte del fondo). */}
              <span aria-hidden className={cn("grid size-6 shrink-0 place-items-center rounded-full border-2", tipo === op ? "border-morado bg-morado" : "border-gris/60 bg-white")}>
                {tipo === op && <span className="size-2.5 rounded-full bg-white" />}
              </span>
            </button>
          ))}
          </div>
          {tipo === "envio" && (
            <div className="flex flex-col gap-3 rounded-2xl bg-papel p-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-sm font-semibold">
                  {t("alcaldia")}
                  <select
                    value={alcaldia}
                    onChange={(e) => {
                      setAlcaldia(e.target.value);
                      setColonia("");
                    }}
                    className="h-11 rounded-xl border border-input bg-white px-2 font-normal"
                  >
                    <option value="">{t("elige")}</option>
                    {alcaldias.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold">
                  {t("colonia")}
                  <select value={colonia} disabled={!alcaldia} onChange={(e) => setColonia(e.target.value)} className="h-11 rounded-xl border border-input bg-white px-2 font-normal disabled:opacity-50">
                    <option value="">{t("elige")}</option>
                    {colonias
                      .filter((c) => c.alcaldia === alcaldia)
                      .map((c) => (
                        <option key={c.colonia}>{c.colonia}</option>
                      ))}
                  </select>
                </label>
              </div>
              {km !== null && (
                <div role="radiogroup" aria-label={t("proveedor")} className="flex flex-col gap-2">
                  <p className="text-[13px] text-tinta-2">{t("distancia", { km: km.toFixed(1) })}</p>
                  {PROVEEDORES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={proveedor === p.id}
                      onClick={() => setProveedor(p.id)}
                      className={cn(opcion, proveedor === p.id ? "border-morado bg-white" : "border-border bg-white/60")}
                    >
                      <span className="flex-1 font-semibold">{p.nombre}</span>
                      <span className="text-sm text-tinta-2">{t("minutos", { min: p.minutos })}</span>
                      <span className="w-14 text-right font-bold">{$(costoEnvio(p.id, km))}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </fieldset>

        {/* Resumen */}
        {vista && (
          <section aria-labelledby="resumen" className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
            <h2 id="resumen" className="text-xl font-bold text-morado-700">
              {t("resumen")}
            </h2>
            <ul className="flex flex-col gap-1 text-sm">
              {linea.items.map((i) => (
                <li key={i.nombre} className="flex justify-between gap-3">
                  <span>
                    {i.qty} × {i.nombre}
                  </span>
                  <span>{$(i.precio * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-1 border-t border-border pt-2 text-sm">
              <div className="flex justify-between">
                <dt>{t("subtotal")}</dt>
                <dd>{$(vista.subtotal)}</dd>
              </div>
              {vista.descuento > 0 && (
                <div className="flex justify-between text-nopal-700">
                  <dt>{t("descuento")}</dt>
                  <dd>−{$(vista.descuento)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>{t("servicio")}</dt>
                <dd>
                  {vista.servicio === 0 ? (
                    <span className="flex items-center gap-2">
                      <s className="text-gris">{$(vista.servicioOriginal)}</s>
                      <span className="text-nopal-700">{t("servicioMercadoMas")}</span>
                    </span>
                  ) : (
                    $(vista.servicio)
                  )}
                </dd>
              </div>
              {tipo === "envio" && !entrega && (
                <div className="flex justify-between text-tinta-2">
                  <dt>{t("envio")}</dt>
                  <dd>{t("eligeColoniaCorto")}</dd>
                </div>
              )}
              {entrega?.tipo === "envio" && (
                <div className="flex justify-between">
                  <dt>{t("envioLinea", { proveedor: PROVEEDORES.find((p) => p.id === entrega.proveedor)!.nombre })}</dt>
                  <dd>{$(vista.envio)}</dd>
                </div>
              )}
              <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2 text-lg font-bold">
                <dt>{t("total")}</dt>
                <dd className="text-right">
                  <NumeroAnimado valor={vista.total} formato={$} duracion={0.6} desde={vista.total} />
                  {locale === "en" && <span className="block text-xs font-normal text-tinta-2">{formatUSDaprox(vista.total)}</span>}
                </dd>
              </div>
            </dl>
            <p className="text-[13px] text-tinta-2">{t("planActual", { plan: voc("planes", plan) })}</p>
          </section>
        )}

        {tipo === "envio" && !entrega && vista && (
          <p className="rounded-2xl bg-dorado-200/60 p-3 text-sm font-semibold text-morado-900" role="status">
            {t("eligeColonia")}
          </p>
        )}

        {/* Pago */}
        {resumen && (
          // Barra de pago fija abajo (arriba de la tab bar y del personaje), como el pie de pago de una app nativa:
          // «Generar QR de pago» siempre está a la vista aunque el resumen sea largo.
          <section
            aria-labelledby="pago"
            className="sticky bottom-0 z-10 -mx-5 -mb-5 flex flex-col gap-3 rounded-t-card border-t border-border bg-crema px-5 pt-4 pb-[calc(var(--asoma,0px)+1.25rem)] shadow-[0_-10px_24px_rgba(62,28,60,0.08)]"
          >
            <h2 id="pago" className="text-xl font-bold text-morado-700">
              {t("pago")}
            </h2>
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
                <PagoQR payload={payloadCoDi(refPago, resumen.total, puesto.id)} totalTexto={$(resumen.total)} onPagado={() => finalizar("qr")} />
              </TabsContent>
              <TabsContent value="tarjeta">
                <PagoTarjeta totalTexto={$(resumen.total)} onPagado={(u) => finalizar("tarjeta", u)} />
              </TabsContent>
            </Tabs>
            <p className="text-center text-[13px] text-tinta-2">{t("seguro")}</p>
          </section>
        )}
      </div>
    </div>
  );
}
