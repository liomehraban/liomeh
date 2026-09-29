import { BotonVolver } from "@/components/market/ficha/BotonVolver";

/** Encabezado de pantallas de flujo (carrito, checkout, pedido). */
export function EncabezadoSimple({ titulo, fallback = "/explorar" }: { titulo: string; fallback?: string }) {
  return (
    <header className="relative flex items-center gap-3 bg-morado px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4 pr-16 text-crema">
      <div className="papel-picado absolute inset-x-0 top-0 h-6 opacity-60" aria-hidden />
      <BotonVolver fallback={fallback} className="relative shrink-0" />
      <h1 className="relative font-display text-4xl">{titulo}</h1>
    </header>
  );
}
