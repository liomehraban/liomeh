// @ts-check
// Serwist en modo «configurator»: el service worker se compila después de `next build`
// con @serwist/cli, así que funciona con Turbopack (el plugin de webpack no aplica en Next 16).
import { readFileSync } from "node:fs";
import { serwist } from "@serwist/next/config";

// Revisión estable por build (el BUILD_ID de Next), para que el precache solo cambie con cada deploy.
const revision = (() => {
  try {
    return readFileSync(".next/BUILD_ID", "utf8").trim();
  } catch {
    return process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now());
  }
})();

export default serwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Hay ~1,600 páginas prerenderizadas (mercados y puestos × 2 idiomas): precachearlas todas haría
  // la instalación pesadísima. Se precachea el shell; lo demás se cachea al visitarlo.
  precachePrerendered: false,
  // /asistente no se precachea: se regenera cada 15 min («abierto ahora», eventos del mes).
  additionalPrecacheEntries: ["es", "en"].flatMap((l) =>
    ["", "/offline", "/explorar", "/yo", "/agenda", "/huertos"].map((r) => ({ url: `/${l}${r}`, revision })),
  ),
  globIgnores: ["public/sw.js", "public/sw.js.map", "**/*-dev.*.mjs", "**/maplibre-gl-dev.*"],
});
