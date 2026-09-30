"use client";

import {
  CalendarDays,
  ClipboardList,
  Map,
  QrCode,
  ShoppingBag,
  Sprout,
  Store,
  Sun,
  Tractor,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { MarchantaPersonaje } from "@/components/assistant/MarchantaPersonaje";
import { cn } from "@/lib/utils";

type TabKey = "explorar" | "huertos" | "asistente" | "agenda" | "yo" | "hoy" | "cobrar" | "pedidos" | "catalogo" | "cuenta" | "cosecha" | "huerto";
type Tab = { key: TabKey; href: string; icon?: LucideIcon; match?: string[]; central?: boolean; exact?: boolean };

const TABS: Record<"consumidor" | "locatario" | "productor", Tab[]> = {
  consumidor: [
    { key: "explorar", href: "/explorar", icon: Map, match: ["/explorar", "/mercado", "/puesto", "/carrito", "/checkout", "/pedido"] },
    { key: "huertos", href: "/huertos", icon: Sprout },
    { key: "asistente", href: "/asistente", central: true },
    { key: "agenda", href: "/agenda", icon: CalendarDays, match: ["/agenda", "/rutas"] },
    { key: "yo", href: "/yo", icon: UserRound },
  ],
  locatario: [
    { key: "hoy", href: "/locatario", icon: Sun, exact: true },
    { key: "cobrar", href: "/locatario/cobrar", icon: QrCode },
    { key: "pedidos", href: "/locatario/pedidos", icon: ShoppingBag },
    { key: "catalogo", href: "/locatario/catalogo", icon: Store },
    { key: "cuenta", href: "/locatario/cuenta", icon: UserRound, match: ["/locatario/cuenta", "/locatario/plan"] },
  ],
  productor: [
    { key: "cosecha", href: "/productor", icon: Tractor, exact: true },
    { key: "pedidos", href: "/productor/pedidos", icon: ClipboardList },
    { key: "huerto", href: "/productor/huerto", icon: Sprout },
    { key: "cuenta", href: "/productor/cuenta", icon: UserRound },
  ],
};

/** Vibración corta al cambiar de pestaña (Android; iOS no expone la API y se ignora). */
const vibrar = () => navigator.vibrate?.(8);

export function TabBar({ perfil }: { perfil: keyof typeof TABS }) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const activa = (tab: Tab) =>
    tab.exact ? pathname === tab.href : (tab.match ?? [tab.href]).some((m) => pathname === m || pathname.startsWith(`${m}/`));

  return (
    <nav
      aria-label={t("navegacion")}
      data-nav-tab
      style={{ viewTransitionName: "tab-bar" }}
      className="relative z-30 shrink-0 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(62,28,60,0.06)]"
    >
      <ul className="flex h-16 items-stretch justify-around px-1">
        {TABS[perfil].map((tab) => {
          const on = activa(tab);
          const label = t(`tabs.${tab.key}`);
          if (tab.central) {
            return (
              <li key={tab.key} className="flex flex-1 justify-center">
                <Link
                  href={tab.href}
                  onClick={vibrar}
                  aria-current={on ? "page" : undefined}
                  className="pressable group -mt-6 flex flex-col items-center gap-0.5 rounded-2xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <MarchantaPersonaje activo={on} />
                  <span className={cn("text-[11px] font-semibold text-tinta-2", on && "font-bold text-morado")}>{label}</span>
                </Link>
              </li>
            );
          }
          const Icon = tab.icon!;
          return (
            <li key={tab.key} className="flex flex-1">
              <Link
                href={tab.href}
                onClick={vibrar}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "pressable flex w-full flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold text-tinta-2 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  on && "font-bold text-morado",
                )}
              >
                {/* Indicador de pestaña activa: píldora sólida detrás del ícono (Material 3 / iOS). */}
                <span className={cn("grid h-8 w-14 place-items-center rounded-pill transition-colors duration-200", on && "bg-morado text-white")}>
                  <Icon className="size-[22px]" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
