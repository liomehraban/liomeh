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
import { consumirPregunta } from "@/lib/planes";
import { puedeAgregarProducto, siguienteEstadoLocatario, type EstadoLocatario, type PlanLocatario } from "@/lib/locatario";
import { normalizarEstadoMayoreo, type EstadoMayoreo } from "@/lib/productor";
import { evaluarCheckin, nuevoCupon, PUNTOS_RESENA_FOTO, puedeCanjear, type Checkin, type Cupon, type ResultadoCheckin } from "@/lib/loyalty";

export type { ItemCarrito, LineaCarrito };

export type { Pedido };
export type PedidoLocatario = (typeof demoSeed.locatario.pedidos_pendientes)[number] & { folio?: string; estado?: EstadoLocatario };
export type Cobro = { id: string; monto: number; metodo: "qr" | "tarjeta"; fecha: string };
export type Lote = (typeof demoSeed.productor.lotes)[number] & { id?: string; fotoUrl?: string; publicado?: string };
export type PedidoMayoreo = (typeof demoSeed.productor.pedidos_mayoreo)[number] & { id?: string; estadoId?: EstadoMayoreo; folio?: string };
export type ProductoLocatario = Producto & { disponible?: boolean; origen?: string; fotoUrl?: string };
export type EdicionProducto = { p?: number; disponible?: boolean };

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
  resenasPropias: ResenaPropia[];
  /** Historial de check-ins QR (máx. 1 por objetivo al día). */
  checkins: Checkin[];
  /** mercadoId → fecha ISO en que se ganó el sello (los de la demo no tienen fecha). */
  sellosFechas: Record<string, string>;
  cupones: Cupon[];
  rescates: Rescate[];
  /** rutaId → fecha ISO de inicio */
  rutasIniciadas: Record<string, string>;
  reservasTour: ReservaTour[];
  asistente: { fecha: string; usados: number };
  locatario: {
    pedidos: PedidoLocatario[];
    catalogoExtra: ProductoLocatario[];
    cobros: Cobro[];
    /** Cambios de precio/disponibilidad por nombre de producto (catálogo base y extra). */
    ediciones: Record<string, EdicionProducto>;
    plan: PlanLocatario;
  };
  productor: { lotes: Lote[]; pedidos: PedidoMayoreo[] };
  reservasVisita: ReservaVisita[];
};

export type ResenaPropia = Resena & { fotoUrl?: string };
export type Rescate = { ofertaId: string; tipo: "compra" | "donacion"; kg: number; fecha: string };
export type ReservaTour = { id: string; rutaId: string; fecha: string; personas: number; total: number; creada: string };

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
  hacerCheckin: (objetivo: string, mercadoId: string) => ResultadoCheckin;
  canjear: (r: { id: string; titulo: string; puntos: number }) => Cupon | null;
  escribirResena: (r: Pick<Resena, "objetivo_id" | "estrellas" | "texto" | "idioma"> & { fotoUrl?: string }) => ResenaPropia;
  rescatar: (ofertaId: string, tipo: Rescate["tipo"], kg: number) => void;
  toggleRecordatorio: (eventoId: string) => boolean;
  iniciarRuta: (rutaId: string) => void;
  reservarTour: (r: Omit<ReservaTour, "id" | "creada">) => ReservaTour;
  /** Consume una pregunta del límite diario del asistente; false si ya se agotó. */
  preguntarAsistente: () => boolean;
  cobrar: (monto: number, metodo: Cobro["metodo"]) => Cobro;
  avanzarPedidoLocatario: (id: string) => void;
  editarProducto: (nombre: string, cambios: EdicionProducto) => void;
  /** false si el plan Gratis ya llegó al límite de 20 productos. */
  agregarProductoLocatario: (p: ProductoLocatario, totalActual: number) => boolean;
  setPlanLocatario: (plan: PlanLocatario) => void;
  publicarLote: (l: Omit<Lote, "id" | "publicado">) => Lote;
  cambiarEstadoMayoreo: (id: string, estado: EstadoMayoreo) => void;
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
    checkins: [],
    sellosFechas: {},
    cupones: [],
    rescates: [],
    rutasIniciadas: {},
    reservasTour: [],
    asistente: { fecha: "", usados: 0 },
    locatario: {
      pedidos: demoSeed.locatario.pedidos_pendientes.map((p) => ({ ...p, estado: "nuevo" as const })),
      catalogoExtra: [],
      cobros: [],
      ediciones: {},
      plan: demoSeed.locatario.plan as PlanLocatario,
    },
    productor: {
      lotes: demoSeed.productor.lotes.map((l, i) => ({ ...l, id: `lote-${i + 1}` })),
      pedidos: demoSeed.productor.pedidos_mayoreo.map((p, i) => ({ ...p, id: `may-${i + 1}`, estadoId: normalizarEstadoMayoreo(p.estado) })),
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
        const paraProductor = pedido.puestoId === demoSeed.productor.productor_id;
        set({
          pedidos: [pedido, ...s.pedidos],
          carrito: s.carrito.filter((l) => l.puestoId !== pedido.puestoId),
          puntos: s.puntos + pedido.puntos,
          sellos: !pedido.mercadoId || s.sellos.includes(pedido.mercadoId) ? s.sellos : [...s.sellos, pedido.mercadoId],
          sellosFechas:
            !pedido.mercadoId || s.sellos.includes(pedido.mercadoId) ? s.sellosFechas : { ...s.sellosFechas, [pedido.mercadoId]: pedido.fecha },
          locatario: paraLocatario
            ? {
                ...s.locatario,
                pedidos: [
                  {
                    id: pedido.folio,
                    folio: pedido.folio,
                    cliente: "Bara Bara",
                    items: pedido.items.map((i) => `${i.qty} × ${i.nombre}`).join(", "),
                    total: pedido.total,
                    tipo: pedido.entrega === "recoger" ? "Recoger en puesto" : "Envío (terceros)",
                    hora,
                    estado: "nuevo",
                  },
                  ...s.locatario.pedidos,
                ],
              }
            : s.locatario,
          productor: paraProductor
            ? {
                ...s.productor,
                pedidos: [
                  {
                    id: pedido.folio,
                    folio: pedido.folio,
                    cliente: "Bara Bara",
                    producto: pedido.items.map((i) => i.nombre).join(", "),
                    cantidad: pedido.items.map((i) => `${i.qty} ${i.unidad}`).join(", "),
                    total: pedido.total,
                    estado: "Nuevo",
                    estadoId: "nuevo",
                  },
                  ...s.productor.pedidos,
                ],
              }
            : s.productor,
        });
        return pedido;
      },
      reservarVisita: (r) => {
        const reserva = { ...r, id: `VIS-${Math.floor(1000 + Math.random() * 9000)}`, creada: new Date().toISOString() };
        set((s) => ({ reservasVisita: [reserva, ...s.reservasVisita] }));
        return reserva;
      },
      hacerCheckin: (objetivo, mercadoId) => {
        const s = get();
        const r = evaluarCheckin(s, objetivo, mercadoId);
        if (!r.ok) return r;
        set({
          checkins: [r.checkin, ...s.checkins],
          puntos: s.puntos + r.puntos,
          sellos: r.selloNuevo ? [...s.sellos, mercadoId] : s.sellos,
          sellosFechas: r.selloNuevo ? { ...s.sellosFechas, [mercadoId]: r.checkin.fecha } : s.sellosFechas,
        });
        return r;
      },
      canjear: (rec) => {
        const s = get();
        if (!puedeCanjear(s.puntos, rec.puntos)) return null;
        const cupon = nuevoCupon(rec);
        set({ puntos: s.puntos - rec.puntos, cupones: [cupon, ...s.cupones] });
        return cupon;
      },
      escribirResena: (r) => {
        const resena: ResenaPropia = {
          ...r,
          id: `propia-${Date.now()}`,
          autor: "Tú",
          origen: "",
          fecha: new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" }),
          verificada: "check-in QR",
          fotos: r.fotoUrl ? 1 : 0,
          simulado: false,
        };
        set((s) => ({ resenasPropias: [resena, ...s.resenasPropias], puntos: s.puntos + PUNTOS_RESENA_FOTO }));
        return resena;
      },
      rescatar: (ofertaId, tipo, kg) =>
        set((s) => (s.rescates.some((x) => x.ofertaId === ofertaId) ? s : { rescates: [{ ofertaId, tipo, kg, fecha: new Date().toISOString() }, ...s.rescates] })),
      toggleRecordatorio: (eventoId) => {
        const activo = !get().recordatorios.includes(eventoId);
        set((s) => ({ recordatorios: activo ? [...s.recordatorios, eventoId] : s.recordatorios.filter((x) => x !== eventoId) }));
        return activo;
      },
      iniciarRuta: (rutaId) => set((s) => (s.rutasIniciadas[rutaId] ? s : { rutasIniciadas: { ...s.rutasIniciadas, [rutaId]: new Date().toISOString() } })),
      preguntarAsistente: () => {
        const s = get();
        const r = consumirPregunta(s.asistente ?? { fecha: "", usados: 0 }, s.plan);
        set({ asistente: r.contador });
        return r.ok;
      },
      cobrar: (monto, metodo) => {
        const cobro: Cobro = { id: `COB-${Math.floor(1000 + Math.random() * 9000)}`, monto, metodo, fecha: new Date().toISOString() };
        set((s) => ({ locatario: { ...s.locatario, cobros: [cobro, ...s.locatario.cobros] } }));
        return cobro;
      },
      avanzarPedidoLocatario: (id) =>
        set((s) => ({
          locatario: { ...s.locatario, pedidos: s.locatario.pedidos.map((p) => (p.id === id ? { ...p, estado: siguienteEstadoLocatario(p.estado) } : p)) },
        })),
      editarProducto: (nombre, cambios) =>
        set((s) => ({ locatario: { ...s.locatario, ediciones: { ...s.locatario.ediciones, [nombre]: { ...s.locatario.ediciones?.[nombre], ...cambios } } } })),
      agregarProductoLocatario: (p, totalActual) => {
        const s = get();
        if (!puedeAgregarProducto(totalActual, s.locatario.plan ?? "Gratis")) return false;
        set({ locatario: { ...s.locatario, catalogoExtra: [...s.locatario.catalogoExtra, p] } });
        return true;
      },
      setPlanLocatario: (plan) => set((s) => ({ locatario: { ...s.locatario, plan } })),
      publicarLote: (l) => {
        const lote: Lote = { ...l, id: `lote-${Date.now()}`, publicado: new Date().toISOString() };
        set((s) => ({ productor: { ...s.productor, lotes: [lote, ...s.productor.lotes] } }));
        return lote;
      },
      cambiarEstadoMayoreo: (id, estado) =>
        set((s) => ({ productor: { ...s.productor, pedidos: s.productor.pedidos.map((p) => (p.id === id ? { ...p, estadoId: estado } : p)) } })),
      reservarTour: (r) => {
        const reserva = { ...r, id: `TOUR-${Math.floor(1000 + Math.random() * 9000)}`, creada: new Date().toISOString() };
        set((s) => ({ reservasTour: [reserva, ...s.reservasTour] }));
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
        const { setPerfil, setLocale, setPlan, marcarOnboarding, agregarAlCarrito, cambiarCantidad, quitarGrupo, registrarPedido, reservarVisita, hacerCheckin, canjear, escribirResena, rescatar, toggleRecordatorio, iniciarRuta, reservarTour, preguntarAsistente, cobrar, avanzarPedidoLocatario, editarProducto, agregarProductoLocatario, setPlanLocatario, publicarLote, cambiarEstadoMayoreo, resetDemo, ...datos } = s;
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
