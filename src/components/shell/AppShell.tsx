import type { ReactNode } from "react";
import { MainActualizable } from "./MainActualizable";
import { TabBar } from "./TabBar";

/** Layout de una sección con TabBar: contenido con scroll propio + barra fija abajo. */
export function AppShell({ perfil, children, extra }: { perfil: "consumidor" | "locatario" | "productor"; children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <MainActualizable className="relative flex-1 overflow-y-auto overscroll-contain">{children}</MainActualizable>
      {extra}
      <TabBar perfil={perfil} />
    </div>
  );
}
