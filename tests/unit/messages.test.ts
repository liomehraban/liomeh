import { describe, it, expect } from "vitest";
import es from "../../messages/es.json";
import en from "../../messages/en.json";

const keys = (o: unknown, p = ""): string[] =>
  o && typeof o === "object"
    ? Object.entries(o).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k))
    : [p];

describe("messages", () => {
  it("es y en tienen exactamente las mismas llaves", () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });
});
