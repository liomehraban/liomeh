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
