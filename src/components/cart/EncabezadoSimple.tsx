import { BotonVolver } from "@/components/market/ficha/BotonVolver";

/**
 * Encabezado de pantallas de flujo (carrito, checkout, pedido, escanear, planes): la franja de papel picado
 * completa arriba (como en Yo y Agenda) y, debajo, la fila de volver + título, sin que nada quede encimado.
 * La fila empieza bajo los controles flotantes (12 px + 44 px), así el título usa todo el ancho.
 */
export function EncabezadoSimple({ titulo, fallback = "/explorar", destino }: { titulo: string; fallback?: string; destino?: string }) {
  return (
    <header className="relative flex items-center gap-3 bg-morado px-4 pt-[calc(4rem+env(safe-area-inset-top))] pb-4 text-crema">
      <div className="papel-picado absolute inset-x-0 top-[env(safe-area-inset-top)] h-10" aria-hidden />
      <BotonVolver fallback={fallback} destino={destino} className="shrink-0" />
      <h1 className="min-w-0 pt-1 font-display text-4xl leading-none break-words">{titulo}</h1>
    </header>
  );
}
