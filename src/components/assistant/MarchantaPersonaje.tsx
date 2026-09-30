import Image from "next/image";

import { cn } from "@/lib/utils";

const SRC = "/marchanta/marchanta-192.webp";
// Encuadre del personaje respecto al disco: más ancho que el disco (branquias fuera) y la base hundida
// 4 px para que la canasta quede recortada por el borde.
const IMG = "pointer-events-none absolute bottom-[-4px] left-1/2 w-[132%] max-w-none -translate-x-1/2 select-none";

/**
 * Marchanta (ajolote con sombrero y canasta) «saliendo» de un disco dorado: la mitad de abajo queda
 * recortada por el círculo y la de arriba (sombrero y branquias) se sale del borde. Decorativo.
 */
export function MarchantaPersonaje({ activo = false, className }: { activo?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative block size-15", className)}>
      <span className={cn("absolute inset-0 rounded-full bg-dorado shadow-md ring-4 ring-white transition-shadow", activo && "ring-morado")} />
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <Image src={SRC} alt="" width={192} height={187} unoptimized className={IMG} />
      </span>
      <Image src={SRC} alt="" width={192} height={187} unoptimized className={cn(IMG, "[clip-path:inset(0_0_40%_0)]")} />
    </span>
  );
}
