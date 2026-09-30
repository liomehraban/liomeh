/**
 * Genera los recursos de marca desde los originales de scripts/assets/marca (icono oficial, logotipo y
 * Marchanta): íconos de la PWA (192, 512, maskable 512, apple-touch 180), favicon y logotipo web.
 * Uso: pnpm icons  (requiere Chromium de Playwright). Después conviene reducir los PNG a 256 colores
 * (p. ej. pngquant); así pesan ~10–45 KB sin diferencia visible.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const CHROMIUM = "/opt/pw-browsers/chromium";
const dataUrl = (archivo) => `data:image/webp;base64,${readFileSync(new URL(`./assets/marca/${archivo}`, import.meta.url)).toString("base64")}`;

/** Morado del cuadro del ícono (fondo del maskable, que exige lienzo lleno y 80% de zona segura). */
const MORADO_ICONO = "#86057C";
const CREMA = "#FEFAEB";

const salidas = [
  // { archivo, fuente, ancho, alto, escala (fracción del lado que ocupa el recorte), fondo, formato }
  { archivo: "public/icons/icon-192.png", fuente: "icono.webp", lado: 192, escala: 0.96 },
  { archivo: "public/icons/icon-512.png", fuente: "icono.webp", lado: 512, escala: 0.96 },
  { archivo: "public/icons/maskable-512.png", fuente: "icono.webp", lado: 512, escala: 0.74, fondo: MORADO_ICONO },
  { archivo: "public/icons/apple-touch-icon.png", fuente: "icono.webp", lado: 180, escala: 0.9, fondo: CREMA },
  { archivo: "src/app/icon.png", fuente: "icono.webp", lado: 64, escala: 1 },
  { archivo: "public/marca/logotipo-640.webp", fuente: "logotipo.webp", ancho: 640, formato: "image/webp" },
];

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {});
const page = await browser.newPage();
for (const s of salidas) {
  const b64 = await page.evaluate(
    async ({ src, s }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      // Recorte a lo visible (sin el margen transparente del original).
      const tmp = new OffscreenCanvas(img.width, img.height);
      const tc = tmp.getContext("2d");
      tc.drawImage(img, 0, 0);
      const { data } = tc.getImageData(0, 0, img.width, img.height);
      let x0 = img.width, y0 = img.height, x1 = 0, y1 = 0;
      for (let y = 0; y < img.height; y++)
        for (let x = 0; x < img.width; x++)
          if (data[(y * img.width + x) * 4 + 3] > 8) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
      const w = x1 - x0 + 1, h = y1 - y0 + 1;
      const ancho = s.lado ?? s.ancho;
      const alto = s.lado ?? Math.round((ancho * h) / w);
      const c = new OffscreenCanvas(ancho, alto);
      const ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      if (s.fondo) {
        ctx.fillStyle = s.fondo;
        ctx.fillRect(0, 0, ancho, alto);
      }
      const k = Math.min((ancho * (s.escala ?? 1)) / w, (alto * (s.escala ?? 1)) / h);
      ctx.drawImage(img, x0, y0, w, h, (ancho - w * k) / 2, (alto - h * k) / 2, w * k, h * k);
      const blob = await c.convertToBlob({ type: s.formato ?? "image/png", quality: 0.86 });
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return btoa(bin);
    },
    { src: dataUrl(s.fuente), s },
  );
  writeFileSync(s.archivo, Buffer.from(b64, "base64"));
  console.log("✓", s.archivo);
}
await browser.close();
