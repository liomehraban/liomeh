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
import { construirPedido, type NuevoPedido, type Pedido } from "@/lib/pedidos";

export type { ItemCarrito, LineaCarrito };

export type { Pedido };
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
  reservasVisita: ReservaVisita[];
};

export type ReservaVisita = { id: string; productorId: string; fecha: string; personas: number; total: number; creada: string };

type Acciones = {
  setPerfil: (perfil: Perfil) => void;
  setLocale: (locale: Locale) => void;
  setPlan: (plan: PlanConsumidor) => void;
  marcarOnboarding: () => void;
  agregarAlCarrito: (puestoId: string, item: ItemCarrito) => void;
  cambiarCantidad: (puestoId: string, nombre: string, qty: number) => void;
  quitarGrupo: (puestoId: string) => void;
  /** Crea el pedido pagado: lo guarda, vacía ese grupo, suma puntos (una sola vez) y el sello del mercado. */
  registrarPedido: (input: Omit<NuevoPedido, "planMercadoMas">) => Pedido;
  reservarVisita: (r: Omit<ReservaVisita, "id" | "creada">) => ReservaVisita;
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
    reservasVisita: [],
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...estadoInicial(),
      setPerfil: (perfil) => set({ perfil }),
      setLocale: (locale) => set({ locale }),
      setPlan: (plan) => set({ plan }),
      marcarOnboarding: () => set({ onboardingVisto: true }),
      agregarAlCarrito: (puestoId, item) => set((s) => ({ carrito: agregarItem(s.carrito, puestoId, item) })),
      cambiarCantidad: (puestoId, nombre, qty) => set((s) => ({ carrito: cambiarCantidad(s.carrito, puestoId, nombre, qty) })),
      quitarGrupo: (puestoId) => set((s) => ({ carrito: s.carrito.filter((l) => l.puestoId !== puestoId) })),
      registrarPedido: (input) => {
        const s = get();
        const pedido = construirPedido({ ...input, planMercadoMas: s.plan === "Mercado+" }, s.pedidos.map((p) => p.folio));
        const hora = new Date(pedido.fecha).toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
        const paraLocatario = pedido.puestoId === demoSeed.locatario.puesto_id;
        set({
          pedidos: [pedido, ...s.pedidos],
          carrito: s.carrito.filter((l) => l.puestoId !== pedido.puestoId),
          puntos: s.puntos + pedido.puntos,
          sellos: !pedido.mercadoId || s.sellos.includes(pedido.mercadoId) ? s.sellos : [...s.sellos, pedido.mercadoId],
          locatario: paraLocatario
            ? {
                ...s.locatario,
                pedidos: [
                  {
                    id: pedido.folio,
                    folio: pedido.folio,
                    cliente: "Pásele",
                    items: pedido.items.map((i) => `${i.qty} × ${i.nombre}`).join(", "),
                    total: pedido.total,
                    tipo: pedido.entrega === "recoger" ? "Recoger en puesto" : "Envío (terceros)",
                    hora,
                  },
                  ...s.locatario.pedidos,
                ],
              }
            : s.locatario,
        });
        return pedido;
      },
      reservarVisita: (r) => {
        const reserva = { ...r, id: `VIS-${Math.floor(1000 + Math.random() * 9000)}`, creada: new Date().toISOString() };
        set((s) => ({ reservasVisita: [reserva, ...s.reservasVisita] }));
        return reserva;
      },
      resetDemo: () => set((s) => ({ ...estadoInicial(), locale: s.locale })),
    }),
    {
      name: "pasele-demo",
      version: 2,
      // v2: nueva forma de Pedido (resumen, puntos, mercadoId)
      migrate: (persisted, version) => (version < 2 ? { ...(persisted as object), pedidos: [] } : persisted) as AppState,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { setPerfil, setLocale, setPlan, marcarOnboarding, agregarAlCarrito, cambiarCantidad, quitarGrupo, registrarPedido, reservarVisita, resetDemo, ...datos } = s;
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
