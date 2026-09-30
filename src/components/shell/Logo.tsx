import Image from "next/image";

import { cn } from "@/lib/utils";

/** Logotipo oficial «BARA BARA» (letras crema con contorno morado y gotas de color). El ancho lo da `className`. */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/marca/logotipo-640.webp" alt="Bara Bara" width={640} height={380} unoptimized priority={priority} className={cn("h-auto w-56 select-none", className)} />;
}
