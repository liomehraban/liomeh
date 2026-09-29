import type { ReactNode } from "react";
import { TabBar } from "./TabBar";

/** Layout de una sección con TabBar: contenido con scroll propio + barra fija abajo. */
export function AppShell({ perfil, children, extra }: { perfil: "consumidor" | "locatario" | "productor"; children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <main id="contenido" className="relative flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>
      {extra}
      <TabBar perfil={perfil} />
    </div>
  );
}
