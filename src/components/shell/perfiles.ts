import { Backpack, BarChart3, Sprout, Store, type LucideIcon } from "lucide-react";
import type { Perfil } from "@/store/useAppStore";

export const PERFILES: Perfil[] = ["consumidor", "locatario", "productor", "gobierno"];

export const ICONO_PERFIL: Record<Perfil, LucideIcon> = {
  consumidor: Backpack,
  locatario: Store,
  productor: Sprout,
  gobierno: BarChart3,
};
