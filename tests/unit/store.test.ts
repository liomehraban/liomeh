import { describe, it, expect, beforeEach } from "vitest";

// localStorage mínimo para persist en entorno node
const mem = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
} as Storage;

const { useAppStore, estadoInicial } = await import("../../src/store/useAppStore");

describe("useAppStore", () => {
  beforeEach(() => useAppStore.getState().resetDemo());

  it("arranca con los puntos y sellos de lealtad.json", () => {
    const s = useAppStore.getState();
    expect(s.puntos).toBe(740);
    expect(s.sellos).toContain("la-merced");
    expect(s.perfil).toBeNull();
  });

  it("persiste perfil y locale", () => {
    useAppStore.getState().setPerfil("locatario");
    useAppStore.getState().setLocale("en");
    const saved = JSON.parse(mem.get("pasele-demo")!);
    expect(saved.state.perfil).toBe("locatario");
    expect(saved.state.locale).toBe("en");
  });

  it("resetDemo restablece todo salvo el idioma", () => {
    useAppStore.setState({ puntos: 9999, perfil: "gobierno", locale: "en" });
    useAppStore.getState().resetDemo();
    const s = useAppStore.getState();
    expect(s.puntos).toBe(estadoInicial().puntos);
    expect(s.perfil).toBeNull();
    expect(s.locale).toBe("en");
    expect(s.locatario.pedidos).toHaveLength(2);
  });
});

describe("registrarPedido", () => {
  beforeEach(() => useAppStore.getState().resetDemo());
  const input = {
    puestoId: "pancita-dona-chela",
    mercadoId: "la-merced",
    items: [{ nombre: "Pancita", precio: 115, unidad: "plato", qty: 2 }, { nombre: "Sope", precio: 35, unidad: "pieza", qty: 2 }],
    resumen: { subtotal: 300, descuento: 0, servicio: 9, servicioOriginal: 9, envio: 0, total: 309 },
    metodo: "qr" as const,
    entrega: "recoger" as const,
  };

  it("guarda el pedido, vacía ese grupo, suma 30 puntos una vez y llega al locatario", () => {
    const st = useAppStore.getState();
    st.agregarAlCarrito("pancita-dona-chela", input.items[0]);
    st.agregarAlCarrito("dona-tere", { nombre: "Pinole", precio: 35, unidad: "vaso", qty: 1 });
    const antes = useAppStore.getState().puntos;
    const p = useAppStore.getState().registrarPedido(input);
    const s = useAppStore.getState();
    expect(p.folio).toMatch(/^PSL-\d{4}$/);
    expect(s.pedidos[0].folio).toBe(p.folio);
    expect(s.puntos).toBe(antes + 30);
    expect(s.carrito.map((l) => l.puestoId)).toEqual(["dona-tere"]);
    expect(s.locatario.pedidos[0].folio).toBe(p.folio);
    expect(s.locatario.pedidos).toHaveLength(3);
  });

  it("pedidos de otros puestos no llegan al panel de Doña Chela", () => {
    useAppStore.getState().registrarPedido({ ...input, puestoId: "dona-tere" });
    expect(useAppStore.getState().locatario.pedidos).toHaveLength(2);
  });
});

describe("compra a productor", () => {
  beforeEach(() => useAppStore.getState().resetDemo());
  it("da puntos dobles y no agrega sello de mercado", () => {
    const s0 = useAppStore.getState();
    const p = s0.registrarPedido({
      puestoId: "prod-milpa-01",
      mercadoId: "",
      items: [{ nombre: "Nopal verdura (ciento)", precio: 70, unidad: "ciento", qty: 2, huertoId: "prod-milpa-01" }],
      resumen: { subtotal: 140, descuento: 0, servicio: 9, servicioOriginal: 9, envio: 0, total: 149 },
      metodo: "qr",
      entrega: "recoger",
    });
    expect(p.puntos).toBe(28);
    expect(useAppStore.getState().puntos).toBe(s0.puntos + 28);
    expect(useAppStore.getState().sellos).toEqual(s0.sellos);
  });
  it("reservarVisita guarda la reserva", () => {
    const r = useAppStore.getState().reservarVisita({ productorId: "prod-xochi-01", fecha: "2026-10-05", personas: 2, total: 400 });
    expect(r.id).toMatch(/^VIS-\d{4}$/);
    expect(useAppStore.getState().reservasVisita[0]).toEqual(r);
  });
});

describe("pasaporte en el store", () => {
  beforeEach(() => useAppStore.getState().resetDemo());
  it("check-in: +10, luego «yaHoy» sin sumar", () => {
    const p0 = useAppStore.getState().puntos;
    expect(useAppStore.getState().hacerCheckin("jugos-moreno", "la-merced")).toMatchObject({ ok: true, puntos: 10 });
    expect(useAppStore.getState().hacerCheckin("jugos-moreno", "la-merced")).toEqual({ ok: false, motivo: "yaHoy" });
    expect(useAppStore.getState().puntos).toBe(p0 + 10);
  });
  it("primer check-in en mercado nuevo: sello con fecha y +60", () => {
    const p0 = useAppStore.getState().puntos;
    useAppStore.getState().hacerCheckin("mercado:53-rio-blanco", "53-rio-blanco");
    const s = useAppStore.getState();
    expect(s.sellos).toContain("53-rio-blanco");
    expect(s.sellosFechas["53-rio-blanco"]).toBeTruthy();
    expect(s.puntos).toBe(p0 + 60);
  });
  it("canje resta puntos y genera cupón; sin puntos no canjea", () => {
    const c = useAppStore.getState().canjear({ id: "agua", titulo: "Agua fresca gratis", puntos: 120 });
    expect(c?.codigo).toMatch(/^PSL-AGUA-\d{6}$/);
    expect(useAppStore.getState().puntos).toBe(740 - 120);
    expect(useAppStore.getState().canjear({ id: "huerto", titulo: "Visita", puntos: 99999 })).toBeNull();
  });
  it("reseña propia da +15", () => {
    useAppStore.getState().escribirResena({ objetivo_id: "la-merced", estrellas: 5, texto: "Todo delicioso y la gente muy amable.", idioma: "es" });
    expect(useAppStore.getState().puntos).toBe(755);
    expect(useAppStore.getState().resenasPropias[0].objetivo_id).toBe("la-merced");
  });
  it("rescate suma kg una sola vez por oferta", () => {
    useAppStore.getState().rescatar("r1", "donacion", 3);
    useAppStore.getState().rescatar("r1", "compra", 3);
    expect(useAppStore.getState().rescates).toHaveLength(1);
  });
  it("recordatorios toggle", () => {
    expect(useAppStore.getState().toggleRecordatorio("mole-2026")).toBe(true);
    expect(useAppStore.getState().toggleRecordatorio("mole-2026")).toBe(false);
  });
});
