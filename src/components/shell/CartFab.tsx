"use client";

import { ChevronRight, ShoppingBasket } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { piezasCarrito, subtotalGrupo } from "@/lib/carrito";
import { formatMXN } from "@/lib/money";

/**
 * Pantallas donde el carrito flotante estorbaría controles del tercio inferior (mapa de huertos,
 * ruta del interior, seguimiento del pedido, preguntas del asistente) o ya no aplica (carrito, pago).
 */
const SIN_FAB = [/^\/huertos$/, /^\/mercado\/[^/]+\/interior/, /^\/pedido\//, /^\/carrito/, /^\/checkout/, /^\/asistente/];
/** Ficha de un vendedor (puesto o productor): ahí el carrito se vuelve la barra «Ir a pagar» de ese pedido. */
const FICHA_VENDEDOR = /^\/(?:puesto|huertos)\/([^/]+)$/;

const POSICION = "absolute bottom-[calc(var(--fab-extra,0px)+5.25rem+env(safe-area-inset-bottom))] z-30";

/**
 * Carrito del consumidor: aparece solo si hay productos. En la ficha del vendedor con productos en el
 * pedido es una barra ancha que lleva directo a pagar; en el resto, un botón flotante al carrito.
 * Las pantallas con panel inferior (Explorar) publican `--fab-extra` en el marco para que quede por encima
 * de sus controles; el resto reserva su espacio al final del contenido (--fab en globals.css).
 */
export function CartFab() {
  const t = useTranslations("shell");
  const locale = useLocale();
  const hydrated = useHydrated();
  const pathname = usePathname();
  const carrito = useAppStore((s) => s.carrito);
  const piezas = piezasCarrito(carrito);
  if (!hydrated || piezas === 0 || SIN_FAB.some((r) => r.test(pathname))) return null;

  const vendedorId = FICHA_VENDEDOR.exec(pathname)?.[1];
  const linea = vendedorId ? carrito.find((l) => l.puestoId === decodeURIComponent(vendedorId)) : undefined;
  if (linea) {
    const n = piezasCarrito([linea]);
    return (
      <Link
        href={`/checkout?puesto=${encodeURIComponent(linea.puestoId)}`}
        data-cart-fab
        data-demo="ir-a-pagar"
        className={`pressable ${POSICION} inset-x-4 flex min-h-14 items-center gap-3 rounded-pill bg-primary py-2 pr-4 pl-2 text-primary-foreground shadow-xl focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none`}
      >
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
          <ShoppingBasket className="size-5" strokeWidth={1.75} aria-hidden />
          <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-pill bg-dorado px-1 text-[12px] font-bold text-morado-900">{n}</span>
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="font-bold">{t("irAPagar")}</span>
          <span className="text-[13px] text-crema/90">{t("productosPedido", { n })}</span>
        </span>
        <span className="ml-auto flex items-center gap-1 font-bold">
          {formatMXN(subtotalGrupo(linea), locale)}
          <ChevronRight className="size-5" aria-hidden />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/carrito"
      data-cart-fab
      aria-label={`${t("carrito")} (${piezas})`}
      className={`pressable ${POSICION} right-4 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl transition-[bottom] focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none`}
    >
      <ShoppingBasket className="size-6" strokeWidth={1.75} aria-hidden />
      <span className="absolute -top-1 -right-1 grid min-w-6 place-items-center rounded-pill bg-dorado px-1.5 text-xs font-bold text-morado-900">
        {piezas}
      </span>
    </Link>
  );
}
