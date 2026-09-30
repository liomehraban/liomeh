import { ViewTransition, type ReactNode } from "react";
import { TabBar } from "./TabBar";

/**
 * Layout de una sección con TabBar: contenido con scroll propio + barra anclada abajo.
 * Al navegar, solo el contenido hace un «fade-through» (clase `pantalla` en globals.css); la barra no se mueve.
 */
export function AppShell({ perfil, children, extra }: { perfil: "consumidor" | "locatario" | "productor"; children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <main id="contenido" className="relative flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <ViewTransition default="pantalla">{children}</ViewTransition>
      </main>
      {extra}
      <TabBar perfil={perfil} />
    </div>
  );
}
