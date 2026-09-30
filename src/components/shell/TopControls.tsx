"use client";

import { Campana } from "@/components/avisos/Campana";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ProfileSwitcher } from "./ProfileSwitcher";

/** En la entrada (splash, onboarding y selector) y en la portada de la presentación todavía no hay perfil. */
const SIN_CONTROLES = ["/", "/presentacion"];

/** Controles flotantes presentes en todas las pantallas con perfil (arriba a la derecha). */
export function TopControls() {
  const pathname = usePathname();
  if (SIN_CONTROLES.includes(pathname)) return null;
  // El panel de gobierno se desplaza con la ventana (no dentro de #contenido) y no tiene barra inferior: los
  // controles van fijos para que cambiar de perfil siga a la mano después de bajar por el panel.
  const fijo = pathname.startsWith("/gobierno");
  return (
    <div className={cn("pointer-events-none top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-40 flex gap-2 [&>*]:pointer-events-auto", fijo ? "fixed" : "absolute")}>
      <Campana />
      <ProfileSwitcher />
    </div>
  );
}
