import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";
const google = process.env.NEXT_PUBLIC_MAP_PROVIDER === "google";

// Mapas: estilo, teselas, sprites y glifos de CARTO (o Google Maps si se elige ese proveedor).
const hostsMapa = ["https://*.cartocdn.com", "https://*.carto.com", ...(google ? ["https://*.googleapis.com", "https://*.gstatic.com", "https://*.google.com"] : [])];

/**
 * CSP sin nonces (las páginas son estáticas/ISR): Next necesita scripts y estilos en línea.
 * El worker de MapLibre se sirve desde /maplibre y también puede crearse como blob.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${google ? " https://maps.googleapis.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${hostsMapa.join(" ")}`,
  "font-src 'self' data:",
  `connect-src 'self' ${hostsMapa.join(" ")}${isDev ? " ws:" : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const cabecerasSeguridad = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // Ubicación para «Cerca de ti»; cámara y micrófono no se usan (el escaneo de QR es simulado).
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: cabecerasSeguridad },
      // El service worker siempre se revalida para que las versiones nuevas lleguen.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
};

export default withNextIntl(nextConfig);
