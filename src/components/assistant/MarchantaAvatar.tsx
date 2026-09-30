import { cn } from "@/lib/utils";

/**
 * Avatar de «Marchanta» (ajolote con sombrero y canasta): recorte circular de la cara para tamaños chicos
 * (burbujas del chat). Para el personaje completo saliendo del disco usa <MarchantaPersonaje>.
 */
export function MarchantaAvatar({ className, title }: { className?: string; title?: string }) {
  return (
    <span
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("block size-10 rounded-full bg-no-repeat", className)}
      // Centra la cara (≈53 % × 35 % de la imagen) con la imagen al 190 % del círculo.
      style={{ backgroundImage: "url(/marchanta/marchanta-192.webp)", backgroundSize: "190% auto", backgroundPosition: "56% 17%" }}
    />
  );
}
