"use client";

import { Campana } from "@/components/avisos/Campana";
import { usePathname } from "@/i18n/navigation";
import { ProfileSwitcher } from "./ProfileSwitcher";

/** En la entrada (splash, onboarding y selector) y en la portada de la presentación todavía no hay perfil. */
const SIN_CONTROLES = ["/", "/presentacion"];

/** Controles flotantes presentes en todas las pantallas con perfil (arriba a la derecha). */
export function TopControls() {
  const pathname = usePathname();
  if (SIN_CONTROLES.includes(pathname)) return null;
  return (
    <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-40 flex gap-2 [&>*]:pointer-events-auto">
      <Campana />
      <ProfileSwitcher />
    </div>
  );
}
