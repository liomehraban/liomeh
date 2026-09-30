import { describe, expect, it, vi } from "vitest";
import { cacheConVigencia } from "../../src/data/cache";

describe("cacheConVigencia", () => {
  it("reutiliza el valor mientras está vigente y lo renueva al vencer", async () => {
    let t = 0;
    const cargar = vi.fn(async () => t);
    const c = cacheConVigencia(cargar, 1000, () => t);
    expect(await c()).toBe(0);
    t = 999;
    expect(await c()).toBe(0);
    t = 1000;
    expect(await c()).toBe(1000);
    expect(cargar).toHaveBeenCalledTimes(2);
  });

  it("no guarda un error: el siguiente llamado reintenta", async () => {
    const cargar = vi.fn().mockRejectedValueOnce(new Error("red")).mockResolvedValueOnce("ok");
    const c = cacheConVigencia(cargar, 60_000);
    await expect(c()).rejects.toThrow("red");
    expect(await c()).toBe("ok");
  });

  it("invalidar obliga a recargar", async () => {
    const cargar = vi.fn(async () => Math.random());
    const c = cacheConVigencia(cargar, 60_000);
    await c();
    c.invalidar();
    await c();
    expect(cargar).toHaveBeenCalledTimes(2);
  });
});
