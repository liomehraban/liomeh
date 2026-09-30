"use client";

import type { ReactNode } from "react";
import { SerwistProvider } from "@serwist/next/react";

/** Registra /sw.js (generado por `serwist build`) solo en producción. */
export function RegistroSW({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV !== "production"} reloadOnOnline={false}>
      {children}
    </SerwistProvider>
  );
}
