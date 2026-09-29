"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";

import { demoSeed } from "@/data/demo-seed";
import type { Producto, Resena } from "@/lib/schemas";
import type { Locale } from "@/i18n/routing";

export type Perfil = "consumidor" | "locatario" | "productor" | "gobierno";
export type PlanConsumidor = "Gratis" | "Pase Turista" | "Mercado+";

export const HOME_PERFIL: Record<Perfil, string> = {
  consumidor: "/explorar",
  locatario: "/locatario",
  productor: "/productor",
  gobierno: "/gobierno",
};

import { agregarItem, cambiarCantidad, type ItemCarrito, type LineaCarrito } from "@/lib/carrito";

export type { ItemCarrito, LineaCarrito };

export type EstadoPedido = "recibido" | "preparando" | "listo" | "en camino" | "entregado";
export type Pedido = {
  folio: string;
  fecha: string;
  puestoId: string;
  items: ItemCarrito[];
  subtotal: number;
  servicio: number;
  envio: number;
  total: number;
  metodo: "qr" | "tarjeta";
  entrega: "recoger" | "envio";
  estado: EstadoPedido;
  puntos: number;
};

export type PedidoLocatario = (typeof demoSeed.locatario.pedidos_pendientes)[number] & { folio?: string };
export type Cobro = { id: string; monto: number; metodo: "qr" | "tarjeta"; fecha: string };
export type Lote = (typeof demoSeed.productor.lotes)[number] & { id?: string };
export type PedidoMayoreo = (typeof demoSeed.productor.pedidos_mayoreo)[number] & { id?: string };

type DatosDemo = {
  perfil: Perfil | null;
  locale: Locale;
  plan: PlanConsumidor;
  onboardingVisto: boolean;
  carrito: LineaCarrito[];
  pedidos: Pedido[];
  puntos: number;
  sellos: string[];
  insignias: string[];
  recordatorios: string[];
  resenasPropias: Resena[];
  /** puestoId → fecha ISO del último check-in (máx. 1 por día) */
  checkinsHoy: Record<string, string>;
  asistente: { fecha: string; usados: number };
  locatario: { pedidos: PedidoLocatario[]; catalogoExtra: Producto[]; cobros: Cobro[] };
  productor: { lotes: Lote[]; pedidos: PedidoMayoreo[] };
};

type Acciones = {
  setPerfil: (perfil: Perfil) => void;
  setLocale: (locale: Locale) => void;
  setPlan: (plan: PlanConsumidor) => void;
  marcarOnboarding: () => void;
  agregarAlCarrito: (puestoId: string, item: ItemCarrito) => void;
  cambiarCantidad: (puestoId: string, nombre: string, qty: number) => void;
  quitarGrupo: (puestoId: string) => void;
  /** Restablece todo desde los JSON. Conserva el idioma. */
  resetDemo: () => void;
};

export type AppState = DatosDemo & Acciones;

export function estadoInicial(): DatosDemo {
  return {
    perfil: null,
    locale: "es",
    plan: "Gratis",
    onboardingVisto: false,
    carrito: [],
    pedidos: [],
    puntos: demoSeed.usuario.puntos,
    sellos: [...demoSeed.usuario.sellos],
    insignias: [...demoSeed.usuario.insignias],
    recordatorios: [],
    resenasPropias: [],
    checkinsHoy: {},
    asistente: { fecha: "", usados: 0 },
    locatario: { pedidos: demoSeed.locatario.pedidos_pendientes.map((p) => ({ ...p })), catalogoExtra: [], cobros: [] },
    productor: {
      lotes: demoSeed.productor.lotes.map((l) => ({ ...l })),
      pedidos: demoSeed.productor.pedidos_mayoreo.map((p) => ({ ...p })),
    },
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...estadoInicial(),
      setPerfil: (perfil) => set({ perfil }),
      setLocale: (locale) => set({ locale }),
      setPlan: (plan) => set({ plan }),
      marcarOnboarding: () => set({ onboardingVisto: true }),
      agregarAlCarrito: (puestoId, item) => set((s) => ({ carrito: agregarItem(s.carrito, puestoId, item) })),
      cambiarCantidad: (puestoId, nombre, qty) => set((s) => ({ carrito: cambiarCantidad(s.carrito, puestoId, nombre, qty) })),
      quitarGrupo: (puestoId) => set((s) => ({ carrito: s.carrito.filter((l) => l.puestoId !== puestoId) })),
      resetDemo: () => set((s) => ({ ...estadoInicial(), locale: s.locale })),
    }),
    {
      name: "pasele-demo",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { setPerfil, setLocale, setPlan, marcarOnboarding, agregarAlCarrito, cambiarCantidad, quitarGrupo, resetDemo, ...datos } = s;
        return datos;
      },
    },
  ),
);

const subscribeHydration = (cb: () => void) => useAppStore.persist.onFinishHydration(cb);

/** true cuando el store ya leyó localStorage (evita parpadeos y redirecciones prematuras). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeHydration,
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}
