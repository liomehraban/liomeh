"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Regresa a la pantalla anterior; si se entró directo por link, va al mapa. */
export function BotonVolver({ fallback = "/explorar", className }: { fallback?: string; className?: string }) {
  const t = useTranslations("mercado");
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={t("volver")}
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className={cn(
        "grid size-11 place-items-center rounded-pill bg-crema/85 text-morado shadow-md backdrop-blur hover:bg-crema focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <ArrowLeft className="size-5" aria-hidden />
    </button>
  );
}
