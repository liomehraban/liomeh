import Image from "next/image";

import { cn } from "@/lib/utils";

/** Marchanta de cuerpo entero para estados vacíos, errores y bienvenida. Decorativa (sin texto alternativo). */
export function MarchantaIlustracion({ className }: { className?: string }) {
  return <Image src="/marchanta/marchanta-512.webp" alt="" aria-hidden width={512} height={498} unoptimized className={cn("pointer-events-none h-auto w-36 select-none", className)} />;
}
