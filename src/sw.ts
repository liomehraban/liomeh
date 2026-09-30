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
  // Sin activación automática: una versión nueva espera a que la persona toque «Recargar»
  // (evita pedir chunks que ya no existen en pestañas abiertas). Serwist atiende el mensaje SKIP_WAITING.
  skipWaiting: false,
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
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (ventanas) => {
        const abierta = ventanas[0] as WindowClient | undefined;
        if (!abierta) return self.clients.openWindow(url);
        // navigate() falla en ventanas que este SW no controla: entonces se abre una nueva.
        const v = await abierta.navigate(url).catch(() => null);
        return v ? v.focus() : self.clients.openWindow(url);
      })
      .catch(() => self.clients.openWindow(url)),
  );
});
