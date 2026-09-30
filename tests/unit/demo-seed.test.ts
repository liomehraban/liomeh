import { describe, expect, it } from "vitest";

import lealtadJson from "../../data/lealtad.json";
import demoJson from "../../data/usuarios_demo.json";
import { demoSeed } from "@/data/demo-seed";
import { Lealtad, UsuariosDemo } from "@/lib/schemas";

describe("demo-seed", () => {
  it("los JSON del estado inicial cumplen los esquemas (el cliente no los valida)", () => {
    expect(() => Lealtad.parse(lealtadJson)).not.toThrow();
    expect(() => UsuariosDemo.parse(demoJson)).not.toThrow();
    expect(demoSeed.locatario.puesto_id).toBe("pancita-dona-chela");
  });
});
