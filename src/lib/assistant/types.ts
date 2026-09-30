import { z } from "zod";

import type { Evento, Lealtad, Mercado, Productor, Puesto, Ruta } from "../schemas";

export const TIPOS_CARD = ["mercado", "puesto", "productor", "evento", "ruta"] as const;
export type TipoCard = (typeof TIPOS_CARD)[number];

export const Card = z.object({ tipo: z.enum(TIPOS_CARD), id: z.string() });
export type Card = z.infer<typeof Card>;

/** Respuesta que se le pide al modelo (JSON validado con zod). */
export const RespuestaModelo = z.object({
  text: z.string(),
  cards: z.array(Card).max(3),
});
export type RespuestaModelo = z.infer<typeof RespuestaModelo>;

export type Intencion = "comida" | "abierto" | "llegar" | "productor" | "eventos" | "artesanias" | "comercioJusto" | "puntos" | "ayuda";

export type PuestoConMercado = Puesto & { mercadoId: string };

export type DatosAsistente = {
  mercados: Mercado[];
  puestos: PuestoConMercado[];
  productores: Productor[];
  eventos: Evento[];
  rutas: Ruta[];
  lealtad: Lealtad;
};

export type Locale = "es" | "en";
export type Ubicacion = { lat: number; lng: number };

/** Tarjeta lista para pintar en el chat (resuelta en el servidor). */
export type TarjetaResuelta = Card & {
  titulo: string;
  subtitulo?: string;
  lat?: number;
  lng?: number;
  /** Para «Llévame» de puestos: mercado con interior. */
  mercadoId?: string;
};

export type RespuestaAsistente = { text: string; cards: TarjetaResuelta[]; fuente: "ia" | "reglas"; intencion?: Intencion };
