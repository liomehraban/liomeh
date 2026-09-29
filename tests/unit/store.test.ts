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
