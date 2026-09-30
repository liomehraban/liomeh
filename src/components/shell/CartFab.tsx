"use client";

import { ShoppingBasket } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { piezasCarrito } from "@/lib/carrito";

/**
 * Pantallas donde el carrito flotante estorbaría controles del tercio inferior (mapa de huertos,
 * ruta del interior, seguimiento del pedido, preguntas del asistente) o ya no aplica (carrito, pago).
 */
const SIN_FAB = [/^\/huertos$/, /^\/mercado\/[^/]+\/interior/, /^\/pedido\//, /^\/carrito/, /^\/checkout/, /^\/asistente/];

/**
 * Carrito flotante del consumidor: aparece solo si hay productos. Las pantallas con panel inferior
 * (Explorar) publican `--fab-extra` en el marco para que el botón quede por encima de sus controles;
 * el resto reserva su espacio al final del contenido (--fab en globals.css). Se oculta con una hoja abierta.
 */
export function CartFab() {
  const t = useTranslations("shell");
  const hydrated = useHydrated();
  const pathname = usePathname();
  const piezas = useAppStore((s) => piezasCarrito(s.carrito));
  if (!hydrated || piezas === 0 || SIN_FAB.some((r) => r.test(pathname))) return null;
  return (
    <Link
      href="/carrito"
      data-cart-fab
      aria-label={`${t("carrito")} (${piezas})`}
      className="pressable absolute right-4 bottom-[calc(var(--fab-extra,0px)+5.25rem+env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-[bottom] focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none"
    >
      <ShoppingBasket className="size-6" strokeWidth={1.75} aria-hidden />
      <span className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-pill bg-dorado px-1.5 text-xs font-bold text-morado-900">
        {piezas}
      </span>
    </Link>
  );
}
