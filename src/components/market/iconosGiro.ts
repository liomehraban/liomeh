import { Candy, Carrot, Fish, Flower2, Palette, Store, Truck, Utensils, type LucideIcon } from "lucide-react";

import type { CategoriaGiro } from "@/lib/giros";

/** Ícono de cada categoría de giro (placeholders, listas de puestos). Comida: cubiertos sin cruzar (no «prohibido comer»). */
export const ICONO_GIRO: Record<CategoriaGiro, LucideIcon> = {
  comida: Utensils,
  frutas: Carrot,
  flores: Flower2,
  artesanias: Palette,
  pescados: Fish,
  dulces: Candy,
  mayoreo: Truck,
  otros: Store,
};
