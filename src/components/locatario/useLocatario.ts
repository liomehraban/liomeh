"use client";

import { useMemo } from "react";

import { useAhora } from "@/hooks/useAhora";
import { hoyCDMX } from "@/lib/eventos";
import { kpisHoy, type KpisBase } from "@/lib/locatario";
import { useAppStore, useHydrated } from "@/store/useAppStore";

/** KPIs de hoy del locatario combinando usuarios_demo con lo que pasó en la demo (todos los perfiles). */
export function useKpisLocatario(base: KpisBase, puestoId: string) {
  const hydrated = useHydrated();
  const ahora = useAhora();
  const cobros = useAppStore((s) => s.locatario.cobros);
  const pedidos = useAppStore((s) => s.locatario.pedidos);
  const checkins = useAppStore((s) => s.checkins);
  return useMemo(() => {
    if (!hydrated || !ahora) return { kpis: base, extraHoy: 0 };
    const hoy = hoyCDMX(ahora);
    const esHoy = (iso: string) => hoyCDMX(new Date(iso)) === hoy;
    const cobrosHoy = cobros.filter((c) => esHoy(c.fecha));
    // Los pedidos creados en la demo tienen folio y fecha; los de usuarios_demo ya están en la base.
    const montosPedidos = pedidos.filter((p) => p.folio && p.fecha && esHoy(p.fecha)).map((p) => p.total);
    const nCheckins = (checkins ?? []).filter((c) => c.objetivo === puestoId && esHoy(c.fecha)).length;
    const kpis = kpisHoy(base, {
      cobros: cobrosHoy.map((c) => c.monto),
      cobrosQr: cobrosHoy.filter((c) => c.metodo === "qr").length,
      pedidosApp: montosPedidos,
      checkins: nCheckins,
    });
    return { kpis, extraHoy: kpis.ventas_mxn - base.ventas_mxn };
  }, [hydrated, ahora, base, cobros, pedidos, checkins, puestoId]);
}

/** «Graciela (Doña Chela)» → «Doña Chela». */
export const nombreCorto = (n: string) => /\(([^)]+)\)/.exec(n)?.[1] ?? n.split(" ")[0];
