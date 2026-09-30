/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import { CacheableResponsePlugin, ExpirationPlugin, Serwist, StaleWhileRevalidate, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // Shell, chunks (incluyen los JSON de /data, que se importan en el bundle), íconos y páginas offline.
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Teselas y estilo de CARTO Voyager
      matcher: ({ url }) => url.hostname.endsWith("cartocdn.com") || url.hostname.endsWith("carto.com"),
      handler: new StaleWhileRevalidate({
        cacheName: "carto-tiles",
        plugins: [new CacheableResponsePlugin({ statuses: [0, 200] }), new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 30 * 24 * 3600 })],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      { url: "/en/offline", matcher: ({ request }) => request.destination === "document" && new URL(request.url).pathname.startsWith("/en") },
      { url: "/es/offline", matcher: ({ request }) => request.destination === "document" },
    ],
  },
});

serwist.addEventListeners();

// Avisos del sistema (notificaciones simuladas): al tocarlos, abre o enfoca la app en la pantalla del aviso.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | null)?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const abierta = ventanas.find((v) => "focus" in v) as WindowClient | undefined;
      return abierta ? abierta.navigate(url).then((v) => v?.focus()) : self.clients.openWindow(url);
    }),
  );
});
