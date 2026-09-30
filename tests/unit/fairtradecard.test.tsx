import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

import es from "../../messages/es.json";
import en from "../../messages/en.json";
import huertos from "../../data/huertos.json";
import { FairTradeCard } from "../../src/components/fairtrade/FairTradeCard";

const jurado = huertos.productores.find((p) => p.id === "prod-milpa-01")!;
const render = (p: (typeof huertos.productores)[number], locale: "es" | "en" = "es") =>
  renderToString(
    <NextIntlClientProvider locale={locale} messages={locale === "es" ? es : en}>
      <FairTradeCard productor={p} />
    </NextIntlClientProvider>,
  );

describe("<FairTradeCard>", () => {
  it("copy del guion con los valores de comercio_justo", () => {
    const html = render(jurado);
    expect(html).toContain("De cada $150 del ciento de nopal, $70 se quedan con Familia Jurado Nopaleros (antes $35).");
    expect(html).toContain("¡El doble!");
    expect(html).toContain("29.7 km");
  });
  it("las barras tienen texto equivalente", () => {
    const html = render(jurado);
    expect(html).toContain('role="img" aria-label="Con intermediarios: el productor recibe $35 (23%) de $150"');
    expect(html).toContain('aria-label="Con Bara Bara: el productor recibe $70 (47%) de $150"');
  });
  it("sin «el doble» cuando mejora_pct < 95", () => {
    const otro = huertos.productores.find((p) => p.comercio_justo.mejora_pct < 95);
    if (otro) expect(render(otro)).not.toContain("¡El doble!");
  });
  it("en inglés", () => expect(render(jurado, "en")).toContain("Twice as much!"));
});
