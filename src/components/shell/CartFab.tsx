"use client";

import { ShoppingBasket } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { piezasCarrito } from "@/lib/carrito";

/** Carrito flotante del consumidor: aparece solo si hay productos. */
export function CartFab() {
  const t = useTranslations("shell");
  const hydrated = useHydrated();
  const pathname = usePathname();
  const piezas = useAppStore((s) => piezasCarrito(s.carrito));
  if (!hydrated || piezas === 0 || pathname.startsWith("/carrito") || pathname.startsWith("/checkout")) return null;
  return (
    <Link
      href="/carrito"
      aria-label={`${t("carrito")} (${piezas})`}
      className="pressable absolute right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ShoppingBasket className="size-6" strokeWidth={1.75} aria-hidden />
      <span className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-pill bg-dorado px-1.5 text-xs font-bold text-morado-900">
        {piezas}
      </span>
    </Link>
  );
}
