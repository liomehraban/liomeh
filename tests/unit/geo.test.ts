import { describe, it, expect } from "vitest";
import { haversine, formatDistance, bbox, masCercanos, comoLlegarUrl, ZOCALO } from "../../src/lib/geo";

describe("geo", () => {
  it("haversine Zócalo → La Merced ≈ 1.2 km", () => {
    const d = haversine(ZOCALO, { lat: 19.4253, lng: -99.1227 });
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1500);
  });
  it("haversine de un punto a sí mismo es 0", () => expect(haversine(ZOCALO, ZOCALO)).toBe(0));
  it("formatDistance", () => {
    expect(formatDistance(843)).toBe("840 m");
    expect(formatDistance(3)).toBe("10 m");
    expect(formatDistance(1234)).toBe("1.2 km");
    expect(formatDistance(1234, "en")).toBe("1.2 km");
    expect(formatDistance(23700)).toBe("24 km");
  });
  it("bbox", () => {
    expect(bbox([{ lat: 1, lng: 2 }, { lat: -1, lng: 5 }])).toEqual([2, -1, 5, 1]);
    expect(bbox([])).toBeNull();
  });
  it("masCercanos ordena por distancia", () => {
    const r = masCercanos([{ id: "lejos", lat: 19.3, lng: -99.1 }, { id: "cerca", lat: 19.433, lng: -99.133 }], ZOCALO, 1);
    expect(r[0].id).toBe("cerca");
  });
  it("comoLlegarUrl usa transporte público", () =>
    expect(comoLlegarUrl({ lat: 19.4253, lng: -99.1227 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=19.4253,-99.1227&travelmode=transit",
    ));
});
