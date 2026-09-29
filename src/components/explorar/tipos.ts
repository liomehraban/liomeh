import type { CategoriaGiro } from "@/lib/giros";
import type { Horario } from "@/lib/schemas";
import type { Rating } from "@/lib/resenas";

/** Proyección ligera de Mercado para el mapa (lo que viaja al cliente). */
export type MercadoMapa = {
  id: string;
  nombre: string;
  alcaldia: string;
  lat: number;
  lng: number;
  tipos: string[];
  giros: string[];
  destacado: boolean;
  categoria: CategoriaGiro;
  lema?: string;
  lema_en?: string;
  horario?: Horario;
  rating: Rating | null;
};
