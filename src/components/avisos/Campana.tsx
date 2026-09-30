"use client";

import { useMemo, useState } from "react";
import { Bell, BellRing, CalendarHeart, Coins, Leaf, Package, Recycle, ShoppingBag, Sparkles, Sprout, Store, TrendingUp, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  const todos = useAppStore((s) => s.avisos);
  const perfil = useAppStore((s) => s.perfil);
  // Solo los avisos del perfil activo (los antiguos sin perfil se muestran siempre).
  const avisos = useMemo(() => todos.filter((a) => !a.perfil || a.perfil === perfil), [todos, perfil]);
  const sistema = useAppStore((s) => s.avisosSistema);
  const setSistema = useAppStore((s) => s.setAvisosSistema);
  const marcarLeidos = useAppStore((s) => s.marcarAvisosLeidos);
  const [abierta, setAbierta] = useState(false);
  // Al cambiar de pantalla (incluido el «atrás» del sistema) la hoja se cierra.
  const ruta = usePathname();
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    if (abierta) setAbierta(false);
  }
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
        if (!v) marcarLeidos(perfil);
      }}
    >
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label={noLeidos ? t("abrirConNuevas", { n: noLeidos }) : t("abrir")}
        className="pressable relative grid size-11 place-items-center rounded-pill bg-white text-morado shadow-md ring-1 ring-black/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {noLeidos ? <BellRing className="size-5" strokeWidth={2} aria-hidden /> : <Bell className="size-5" strokeWidth={2} aria-hidden />}
        {noLeidos > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-chile px-1 text-xs leading-5 font-bold text-white" aria-hidden>
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
        <ul className="-mx-1 flex min-h-0 flex-col gap-2 overflow-y-auto overscroll-contain px-1 py-1" aria-live="polite">
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
                      marcarLeidos(perfil);
                      if (a.href) router.push(a.href);
                    }}
                    className={cn("flex w-full items-start gap-3 rounded-2xl border-2 bg-white p-3 text-left shadow-sm disabled:opacity-100", a.leida ? "border-transparent" : "border-morado/35")}
                  >
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", a.leida ? "bg-morado-50 text-morado-700" : "bg-morado text-crema")} aria-hidden>
                      <Icono className="size-5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-start justify-between gap-2 leading-snug font-bold text-tinta">
                        <span className="min-w-0 break-words">{titulo}</span>
                        {!a.leida && (
                          <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-chile">
                            <span className="sr-only">{t("nueva")}</span>
                          </span>
                        )}
                      </span>
                      <span className="text-[13px] leading-snug break-words text-tinta-2">{cuerpo}</span>
                      {ahora && <span className="mt-0.5 text-xs text-tinta-2">{haceTiempo(a.fecha, ahora, locale)}</span>}
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
