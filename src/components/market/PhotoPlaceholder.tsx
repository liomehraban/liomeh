import { Candy, Carrot, Fish, Flower2, Palette, Store, Truck, UtensilsCrossed, type LucideIcon } from "lucide-react";

import { categoriaGiro, COLOR_GIRO, type CategoriaGiro } from "@/lib/giros";
import { cn } from "@/lib/utils";

const ICONO: Record<CategoriaGiro, LucideIcon> = {
  comida: UtensilsCrossed,
  frutas: Carrot,
  flores: Flower2,
  artesanias: Palette,
  pescados: Fish,
  dulces: Candy,
  mayoreo: Truck,
  otros: Store,
};

type Props = {
  /** Giro en texto libre (se clasifica) o categoría ya resuelta. */
  giro?: string | null;
  categoria?: CategoriaGiro;
  className?: string;
  iconClassName?: string;
};

/**
 * Placeholder fotográfico: degradado giro → morado + papel picado al 12% + ícono del giro.
 * No se usan fotos de la guía (propiedad de SECTUR).
 */
export function PhotoPlaceholder({ giro, categoria, className, iconClassName }: Props) {
  const cat = categoria ?? categoriaGiro(giro);
  const Icono = ICONO[cat];
  return (
    <div
      aria-hidden
      className={cn("relative isolate grid aspect-video place-items-center overflow-hidden rounded-card", className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${COLOR_GIRO[cat]} 0%, var(--color-morado) 100%)` }}
    >
      <div className="absolute inset-0 -z-10 bg-[url(/papel-picado.svg)] [background-size:120px_auto] bg-repeat opacity-[0.12] mix-blend-luminosity" />
      <Icono className={cn("size-12 text-crema/90", iconClassName)} strokeWidth={1.75} />
    </div>
  );
}
