import { beforeEach, describe, expect, it } from "vitest";

import { crearCandado } from "@/components/avisos/candado";

// localStorage mínimo en memoria (las pruebas corren en Node).
const memoria = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => memoria.get(k) ?? null,
  setItem: (k: string, v: string) => void memoria.set(k, v),
  removeItem: (k: string) => void memoria.delete(k),
  clear: () => memoria.clear(),
  key: () => null,
  length: 0,
} as Storage;

describe("candado del motor de avisos entre pestañas", () => {
  beforeEach(() => memoria.clear());
  it("solo una pestaña a la vez; otra lo toma si la dueña deja de renovarlo", () => {
    const a = crearCandado("a");
    const b = crearCandado("b");
    expect(a.tomar(1000)).toBe(true);
    expect(b.tomar(2000)).toBe(false);
    expect(a.tomar(3000)).toBe(true);
    expect(b.tomar(3000 + 13_000)).toBe(true);
    b.soltar();
    expect(a.tomar(20_000)).toBe(true);
  });
});
