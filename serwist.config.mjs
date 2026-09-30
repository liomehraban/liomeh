// @ts-check
// Serwist en modo «configurator»: el service worker se compila después de `next build`
// con @serwist/cli, así que funciona con Turbopack (el plugin de webpack no aplica en Next 16).
import { serwist } from "@serwist/next/config";

export default serwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Hay ~1,600 páginas prerenderizadas (mercados y puestos × 2 idiomas): precachearlas todas haría
  // la instalación pesadísima. Se precachea el shell; lo demás se cachea al visitarlo.
  precachePrerendered: false,
  additionalPrecacheEntries: ["es", "en"].flatMap((l) =>
    ["", "/offline", "/explorar", "/yo", "/agenda", "/huertos", "/asistente"].map((r) => ({ url: `/${l}${r}`, revision: process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now()) })),
  ),
  globIgnores: ["public/sw.js", "public/sw.js.map", "**/*-dev.*.mjs", "**/maplibre-gl-dev.*"],
});
