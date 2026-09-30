"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { puedeVolver } from "@/components/shell/HistorialInterno";
import { cn } from "@/lib/utils";

/**
 * Regresa a la pantalla anterior de la app; si se entró directo por link (no hay a dónde volver dentro de la
 * app), va a `fallback`. Con `destino`, siempre va ahí (p. ej. del pedido pagado a «Mis pedidos»).
 */
export function BotonVolver({ fallback = "/explorar", destino, className }: { fallback?: string; destino?: string; className?: string }) {
  const t = useTranslations("mercado");
  const router = useRouter();
  return (
    <button
      type="button"
      data-volver
      aria-label={t("volver")}
      onClick={() => (destino ? router.push(destino) : puedeVolver() ? router.back() : router.push(fallback))}
      className={cn(
        "pressable grid size-11 place-items-center rounded-pill bg-white text-morado shadow-md hover:bg-crema focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <ArrowLeft className="size-5" aria-hidden />
    </button>
  );
}
