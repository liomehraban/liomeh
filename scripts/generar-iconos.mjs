/**
 * Genera los íconos de la PWA (192, 512, maskable 512 y apple-touch 180) desde un SVG:
 * «BARA BARA» en Bebas Neue sobre morado CDMX, con franja de papel picado.
 * Uso: node scripts/generar-iconos.mjs  (requiere Chromium de Playwright)
 */
import { existsSync, readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const fuente = readFileSync(new URL("./assets/bebas-neue-latin.woff2", import.meta.url)).toString("base64");
const CHROMIUM = "/opt/pw-browsers/chromium";

/** `seguro` = fracción del lienzo donde cabe el texto (maskable exige la zona segura del 80%). */
const svg = (lado, seguro, picado) => {
  const s = lado * seguro;
  const fs = s * 0.36;
  const banderas = Array.from({ length: 6 }, (_, i) => {
    const w = lado / 6;
    const x = i * w;
    const color = ["#E4007C", "#F29F05", "#3C8D2F", "#C8A96A", "#E4007C", "#F29F05"][i];
    return `<path d="M${x} 0 H${x + w} V${lado * 0.1} L${x + w / 2} ${lado * 0.135} L${x} ${lado * 0.1} Z" fill="${color}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">
  <style>@font-face{font-family:Bebas;src:url(data:font/woff2;base64,${fuente}) format("woff2");}</style>
  <rect width="${lado}" height="${lado}" fill="#93408F"/>
  ${picado ? `<line x1="0" y1="1" x2="${lado}" y2="1" stroke="#3E1C3C" stroke-width="2"/>${banderas}` : ""}
  <g font-family="Bebas" fill="#FEFAEB" text-anchor="middle">
    <text x="${lado / 2}" y="${lado / 2 - fs * 0.02}" font-size="${fs}" letter-spacing="${fs * 0.02}">BARA</text>
    <text x="${lado / 2}" y="${lado / 2 + fs * 0.86}" font-size="${fs}" letter-spacing="${fs * 0.02}">BARA</text>
  </g>
  <rect x="${lado / 2 - s * 0.22}" y="${lado / 2 + fs * 1.02}" width="${s * 0.44}" height="${Math.max(2, lado * 0.018)}" rx="${lado * 0.009}" fill="#C8A96A"/>
</svg>`;
};

const iconos = [
  { archivo: "public/icons/icon-192.png", lado: 192, seguro: 0.92, picado: true },
  { archivo: "public/icons/icon-512.png", lado: 512, seguro: 0.92, picado: true },
  { archivo: "public/icons/maskable-512.png", lado: 512, seguro: 0.7, picado: false },
  { archivo: "public/icons/apple-touch-icon.png", lado: 180, seguro: 0.86, picado: true },
  { archivo: "src/app/icon.png", lado: 64, seguro: 1, picado: false },
];

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {});
const page = await browser.newPage();
for (const i of iconos) {
  await page.setViewportSize({ width: i.lado, height: i.lado });
  await page.setContent(`<html><body style="margin:0">${svg(i.lado, i.seguro, i.picado)}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
  await page.locator("svg").screenshot({ path: i.archivo, omitBackground: false });
  console.log("✓", i.archivo);
}
await browser.close();
