"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/next/react";

import { AvisoActualizacion } from "./AvisoActualizacion";

/**
 * Registra /sw.js (generado por `serwist build`) solo en producción. `cacheOnNavigation` va apagado:
 * en esta versión manda objetos URL al SW (DataCloneError); lo visitado ya se cachea con `defaultCache`.
 */
export function RegistroSW({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== "production"} reloadOnOnline={false} cacheOnNavigation={false}>
      <AvisoActualizacion />
      {children}
    </SerwistProvider>
  );
}
