import { Campana } from "@/components/avisos/Campana";
import { ProfileSwitcher } from "./ProfileSwitcher";

/** Controles flotantes presentes en todas las pantallas (arriba a la derecha). */
export function TopControls() {
  return (
    <div className="pointer-events-none absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-40 flex gap-2 [&>*]:pointer-events-auto">
      <Campana />
      <ProfileSwitcher />
    </div>
  );
}
