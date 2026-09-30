"use client";

import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PASOS } from "@/lib/presentacion";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { BarraPresentacion } from "./BarraPresentacion";
import { DedoDemo, type EstadoDedo } from "./DedoDemo";
import { Cancelado, ejecutarPaso } from "./ejecutor";

/** Evento con el que /presentacion arranca el guion. */
export const EVENTO_SIGUIENTE = "barabara:presentacion-siguiente";

let corrida = 0;

/**
 * Estado de ejecución en memoria (no persistido). Vive fuera del componente porque cambiar de idioma
 * vuelve a montar el layout: si fuera estado local, «Siguiente» se habilitaría a medio paso.
 */
const useEjecucion = create<{ ejecutando: boolean; dedo: EstadoDedo }>(() => ({
  ejecutando: false,
  dedo: { x: 0, y: 0, toque: 0, visible: false },
}));
const setEjecutando = (ejecutando: boolean) => useEjecucion.setState({ ejecutando });
const setDedo = (f: (d: EstadoDedo) => EstadoDedo) => useEjecucion.setState((s) => ({ dedo: f(s.dedo) }));

/** Cancela el paso en curso (también lo usa «Reiniciar demo» de Ajustes). */
export function cancelarPresentacion() {
  corrida++;
  setEjecutando(false);
  setDedo((d) => ({ ...d, visible: false }));
}

/** Monta la barra y ejecuta el guion. Vive en el layout, así sobrevive a la navegación. */
export function Conductor() {
  const t = useTranslations("presentacion");
  const router = useRouter();
  const hydrated = useHydrated();
  const { activa, paso, completado = true } = useAppStore((s) => s.presentacion);
  const ejecutando = useEjecucion((s) => s.ejecutando);
  const dedo = useEjecucion((s) => s.dedo);
  const reducido = useRef(false);

  const correr = useCallback(
    async (i: number) => {
      const paso = PASOS[i];
      if (!paso) return;
      const id = ++corrida;
      const vivo = () => id === corrida;
      const st = useAppStore.getState();
      st.setPresentacion({ activa: true, paso: i, completado: false });
      if (paso.vaciarCarrito) st.quitarGrupo(paso.vaciarCarrito);
      st.setPerfil(paso.perfil);
      st.marcarOnboarding();
      reducido.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setEjecutando(true);
      try {
        await ejecutarPaso(paso, {
          vivo,
          reducido: reducido.current,
          navegar: (ruta, locale: Locale) => router.push(ruta, { locale }),
          dedo: async (el, tocar) => {
            const r = el.getBoundingClientRect();
            setDedo((d) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2, toque: tocar ? d.toque + 1 : d.toque, visible: true }));
            await new Promise((ok) => setTimeout(ok, reducido.current ? 60 : 550));
          },
        });
        if (vivo()) useAppStore.getState().setPresentacion({ completado: true });
      } catch (e) {
        if (!(e instanceof Cancelado)) console.warn(e);
      } finally {
        if (vivo()) {
          setEjecutando(false);
          setDedo((d) => ({ ...d, visible: false }));
        }
      }
    },
    [router],
  );

  const siguiente = useCallback(() => {
    const { paso } = useAppStore.getState().presentacion;
    if (paso >= PASOS.length - 1) {
      corrida++;
      useAppStore.getState().setPresentacion({ activa: false, paso: -1, completado: true });
      router.push("/presentacion", { locale: "es" });
      return;
    }
    void correr(paso + 1);
  }, [correr, router]);

  const reiniciar = useCallback(() => {
    cancelarPresentacion();
    const st = useAppStore.getState();
    st.resetDemo();
    st.setPresentacion({ activa: true, paso: -1, completado: true });
    toast.success(t("reiniciado"));
    router.push("/presentacion", { locale: "es" });
  }, [router, t]);

  const salir = useCallback(() => {
    cancelarPresentacion();
    useAppStore.getState().setPresentacion({ activa: false, paso: -1, completado: true });
  }, []);

  const reintentar = useCallback(() => {
    const { paso } = useAppStore.getState().presentacion;
    void correr(Math.max(0, paso));
  }, [correr]);

  useEffect(() => {
    const h = () => siguiente();
    window.addEventListener(EVENTO_SIGUIENTE, h);
    return () => window.removeEventListener(EVENTO_SIGUIENTE, h);
  }, [siguiente]);

  if (!hydrated || !activa) return null;
  return (
    <>
      <BarraPresentacion
        paso={paso}
        ejecutando={ejecutando}
        // Un paso que no terminó (falló, se canceló o se recargó a la mitad) se ofrece para reintentar.
        interrumpido={paso >= 0 && !completado && !ejecutando}
        onSiguiente={siguiente}
        onReintentar={reintentar}
        onReiniciar={reiniciar}
        onSalir={salir}
      />
      <DedoDemo estado={dedo} />
    </>
  );
}
