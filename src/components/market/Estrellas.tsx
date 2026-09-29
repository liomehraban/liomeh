import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/** Rating con estrella y conteo. `total` opcional. */
export function Estrellas({ rating, total, className }: { rating: number; total?: number; className?: string }) {
  const t = useTranslations("explorar");
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold text-tinta", className)}>
      <Star className="size-4 fill-dorado text-dorado" aria-hidden />
      <span className="sr-only">{t("calificacion", { rating })}</span>
      <span aria-hidden>{rating.toFixed(1)}</span>
      {total !== undefined && <span className="font-normal text-tinta-2">({t("resenas", { n: total })})</span>}
    </span>
  );
}
