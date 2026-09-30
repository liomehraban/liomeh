import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

export type Institucion = "cdmx" | "turismo" | "medioAmbiente" | "economia";

/** Archivos en public/logos, recortados a ~170 px de alto. */
const LOGO: Record<Institucion, { src: string; width: number; height: number }> = {
  cdmx: { src: "/logos/gobierno-cdmx.webp", width: 936, height: 172 },
  turismo: { src: "/logos/turismo.webp", width: 668, height: 168 },
  medioAmbiente: { src: "/logos/medio-ambiente.webp", width: 1096, height: 168 },
  economia: { src: "/logos/economia.webp", width: 750, height: 168 },
};

/**
 * Logo oficial de una institución. Los archivos traen fondo blanco:
 * `mix-blend-multiply` lo funde con fondos claros. No usar sobre fondos oscuros.
 */
export function LogoInstitucion({ id, className }: { id: Institucion; className?: string }) {
  const t = useTranslations("instituciones");
  const { src, width, height } = LOGO[id];
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={t(id)}
      className={cn("h-9 w-auto max-w-full object-contain mix-blend-multiply", className)}
    />
  );
}
