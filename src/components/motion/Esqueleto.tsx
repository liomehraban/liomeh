import { cn } from "@/lib/utils";

/** Bloque de carga (color sólido que late) mientras la app lee lo guardado en el teléfono. */
export function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-2xl bg-morado-50 motion-reduce:animate-none", className)} />;
}
