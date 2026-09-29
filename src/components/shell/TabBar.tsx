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
import { MarchantaAvatar } from "@/components/assistant/MarchantaAvatar";
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

export function TabBar({ perfil }: { perfil: keyof typeof TABS }) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const activa = (tab: Tab) =>
    tab.exact ? pathname === tab.href : (tab.match ?? [tab.href]).some((m) => pathname === m || pathname.startsWith(`${m}/`));

  return (
    <nav
      aria-label={t("navegacion")}
      className="relative z-30 shrink-0 border-t border-border bg-crema/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
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
                  aria-current={on ? "page" : undefined}
                  className="group -mt-6 flex flex-col items-center gap-0.5 rounded-pill focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "grid size-16 place-items-center rounded-full bg-dorado shadow-lg ring-4 ring-crema transition-transform group-hover:scale-105 group-focus-visible:ring-morado/60",
                      on && "ring-morado/30",
                    )}
                  >
                    <MarchantaAvatar className="size-12" />
                  </span>
                  <span className={cn("text-xs font-semibold text-tinta-2", on && "text-morado")}>{label}</span>
                </Link>
              </li>
            );
          }
          const Icon = tab.icon!;
          return (
            <li key={tab.key} className="flex flex-1">
              <Link
                href={tab.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-tinta-2 transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  on && "text-morado",
                )}
              >
                <Icon className="size-6" strokeWidth={on ? 2.25 : 1.75} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
