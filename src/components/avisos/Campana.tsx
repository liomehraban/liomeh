"use client";

import { useState } from "react";
import { Bell, BellRing, CalendarHeart, Coins, Leaf, Package, Recycle, ShoppingBag, Sparkles, Sprout, Store, TrendingUp, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "@/i18n/navigation";
import { usePhoneContainer } from "@/hooks/usePhoneContainer";
import { useAhora } from "@/hooks/useAhora";
import { haceTiempo, type TipoAviso } from "@/lib/notificaciones";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { useTextoAviso } from "./useTextoAviso";

const ICONO: Record<TipoAviso, LucideIcon> = {
  bienvenida: Sparkles,
  pedido: Package,
  evento: CalendarHeart,
  rescate: Recycle,
  surtido: Leaf,
  checkin: Coins,
  nuevoPedido: ShoppingBag,
  stock: Store,
  cobro: Coins,
  mayoreo: Sprout,
  lote: Sprout,
  impacto: TrendingUp,
};

/** Campana con contador de no leídos y bandeja de notificaciones (arriba a la derecha). */
export function Campana() {
  const t = useTranslations("notificaciones");
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();
  const ahora = useAhora();
  const container = usePhoneContainer();
  const texto = useTextoAviso();
  const avisos = useAppStore((s) => s.avisos);
  const sistema = useAppStore((s) => s.avisosSistema);
  const setSistema = useAppStore((s) => s.setAvisosSistema);
  const marcarLeidos = useAppStore((s) => s.marcarAvisosLeidos);
  const [abierta, setAbierta] = useState(false);
  const noLeidos = hydrated ? avisos.filter((a) => !a.leida).length : 0;
  const soportaSistema = typeof window !== "undefined" && "Notification" in window;

  const alternarSistema = async (v: boolean) => {
    if (!v) return setSistema(false);
    const permiso = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    setSistema(permiso === "granted");
  };

  return (
    <Sheet
      open={abierta}
      onOpenChange={(v) => {
        setAbierta(v);
        if (!v) marcarLeidos();
      }}
    >
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label={noLeidos ? t("abrirConNuevas", { n: noLeidos }) : t("abrir")}
        className="relative grid size-11 place-items-center rounded-pill bg-morado/70 text-crema shadow-md backdrop-blur transition-colors hover:bg-morado focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {noLeidos ? <BellRing className="size-5" strokeWidth={1.75} aria-hidden /> : <Bell className="size-5" strokeWidth={1.75} aria-hidden />}
        {noLeidos > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-chile px-1 text-[11px] leading-5 font-bold text-white" aria-hidden>
            {noLeidos > 9 ? "9+" : noLeidos}
          </span>
        )}
      </button>
      <SheetContent side="bottom" container={container} className="flex max-h-[85%] flex-col gap-3 bg-crema px-4 pb-6">
        <SheetHeader className="flex-row items-center justify-between gap-2 px-1">
          <div>
            <SheetTitle className="font-display text-3xl text-morado-700">{t("titulo")}</SheetTitle>
            <SheetDescription className="text-[13px] text-tinta-2">{t("descripcion")}</SheetDescription>
          </div>
        </SheetHeader>
        {soportaSistema && (
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-2 text-sm font-semibold">
            <span className="flex flex-col">
              {t("sistema")}
              <span className="text-[12px] font-normal text-tinta-2">{t("sistemaTexto")}</span>
            </span>
            <Switch checked={hydrated && sistema} onCheckedChange={(v) => void alternarSistema(v)} aria-label={t("sistema")} />
          </label>
        )}
        <ul className="flex flex-col gap-2 overflow-y-auto" aria-live="polite">
          {hydrated && avisos.length === 0 && <li className="rounded-2xl bg-white p-4 text-tinta-2">{t("vacio")}</li>}
          {hydrated &&
            avisos.map((a) => {
              const Icono = ICONO[a.tipo] ?? Bell;
              const { titulo, texto: cuerpo } = texto(a);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    disabled={!a.href}
                    onClick={() => {
                      setAbierta(false);
                      marcarLeidos();
                      if (a.href) router.push(a.href);
                    }}
                    className={cn("flex w-full items-start gap-3 rounded-2xl bg-white p-3 text-left", !a.leida && "ring-2 ring-morado/30")}
                  >
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", a.leida ? "bg-morado-50 text-morado-700" : "bg-morado text-crema")} aria-hidden>
                      <Icono className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-2 font-bold text-tinta">
                        {titulo}
                        {!a.leida && <span className="sr-only">{t("nueva")}</span>}
                      </span>
                      <span className="text-[13px] text-tinta-2">{cuerpo}</span>
                      {ahora && <span className="mt-0.5 text-[11px] text-tinta-2">{haceTiempo(a.fecha, ahora, locale)}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
