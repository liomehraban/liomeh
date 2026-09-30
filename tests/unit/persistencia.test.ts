import { describe, expect, it } from "vitest";

import { almacenamientoSeguro, CLAVE_ESTADO, mezclarEstado, recortarEstado, sinFotos, TOPES } from "@/store/persistencia";
import { estadoInicial, useAppStore } from "@/store/useAppStore";

describe("persistencia del store", () => {
  it("un estado v2 guardado sin los campos nuevos se completa con el inicial (también los anidados)", () => {
    const viejo = { perfil: "locatario", puntos: 120, locatario: { pedidos: [], catalogoExtra: [], cobros: [] } };
    const s = mezclarEstado(estadoInicial(), viejo);
    expect(s.puntos).toBe(120);
    expect(s.perfil).toBe("locatario");
    expect(s.vendedores).toEqual({});
    expect(s.avisos).toEqual([]);
    expect(s.planVence).toBeNull();
    expect(s.locatario.ediciones).toEqual({});
    expect(s.locatario.plan).toBe(estadoInicial().locatario.plan);
  });

  it("la migración del store sube a v3 sin romper nada", async () => {
    const migrate = useAppStore.persist.getOptions().migrate!;
    const r = (await migrate({ puntos: 5, pedidos: [{ folio: "viejo" }] }, 1)) as ReturnType<typeof estadoInicial>;
    expect(r.pedidos).toEqual([]);
    expect(r.puntos).toBe(5);
    expect(r.presentacion).toEqual(estadoInicial().presentacion);
    expect(useAppStore.persist.getOptions().version).toBe(3);
  });

  it("aplica topes, deja fotos solo en lo más reciente y poda fichas de vendedores sin uso", () => {
    const foto = "data:image/jpeg;base64,xx";
    const s = recortarEstado({
      ...estadoInicial(),
      checkins: Array.from({ length: 500 }, (_, i) => ({ objetivo: String(i), mercadoId: "m", fecha: "" })),
      resenasPropias: Array.from({ length: 30 }, (_, i) => ({ id: String(i), fotoUrl: foto })),
      carrito: [{ puestoId: "a", items: [] }],
      vendedores: { a: { id: "a" }, b: { id: "b" } },
    } as never) as unknown as Record<string, unknown[]> & { vendedores: Record<string, unknown> };
    expect(s.checkins).toHaveLength(TOPES.checkins);
    expect((s.resenasPropias as { fotoUrl?: string }[]).filter((r) => r.fotoUrl)).toHaveLength(TOPES.fotos);
    expect(Object.keys(s.vendedores)).toEqual(["a"]);
  });

  it("si localStorage se llena, reintenta sin fotos y nunca lanza", () => {
    const guardado: Record<string, string> = {};
    let intentos = 0;
    const lleno = {
      getItem: (k: string) => guardado[k] ?? null,
      setItem: (k: string, v: string) => {
        intentos++;
        if (v.includes("data:")) throw new DOMException("lleno", "QuotaExceededError");
        guardado[k] = v;
      },
      removeItem: () => {},
    } as unknown as Storage;
    const st = almacenamientoSeguro(() => lleno);
    expect(() => st.setItem("k", JSON.stringify({ a: [{ fotoUrl: "data:img" }] }))).not.toThrow();
    expect(intentos).toBe(2);
    expect(guardado.k).toContain('"fotoUrl":null');
    expect(sinFotos('{"fotoUrl":"data:x"}')).toBe('{"fotoUrl":null}');
  });
});

describe("migración de la clave de almacenamiento", () => {
  const memoria = (inicial: Record<string, string>) => {
    const m = new Map(Object.entries(inicial));
    return {
      m,
      s: { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as unknown as Storage,
    };
  };

  it("copia lo guardado con la clave anterior y la borra", () => {
    const { m, s } = memoria({ "pasele-demo": '{"state":{"puntos":5}}' });
    const st = almacenamientoSeguro(() => s);
    expect(st.getItem(CLAVE_ESTADO)).toBe('{"state":{"puntos":5}}');
    expect(m.get(CLAVE_ESTADO)).toBe('{"state":{"puntos":5}}');
    expect(m.has("pasele-demo")).toBe(false);
  });

  it("si ya hay estado con la clave nueva, ignora la anterior", () => {
    const { m, s } = memoria({ [CLAVE_ESTADO]: "nuevo", "pasele-demo": "viejo" });
    expect(almacenamientoSeguro(() => s).getItem(CLAVE_ESTADO)).toBe("nuevo");
    expect(m.get("pasele-demo")).toBe("viejo");
  });
});
