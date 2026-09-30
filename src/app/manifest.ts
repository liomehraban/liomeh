import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bara Bara · Mercados CDMX",
    short_name: "Bara Bara",
    description: "Los mercados públicos de la Ciudad de México: compra, cobra y distribuye con comercio justo.",
    id: "/",
    start_url: "/es",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es-MX",
    theme_color: "#93408F",
    background_color: "#FEFAEB",
    categories: ["shopping", "food", "travel"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
