"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { avisosDePedidos, bandejaInicial, siguienteAviso, type Aviso, type DatosAvisos } from "@/lib/notificaciones";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { useTextoAviso } from "./useTextoAviso";

const PRIMERO_MS = 12_000;
const ENTRE_MS: [number, number] = [40_000, 90_000];

/**
 * Programa las notificaciones simuladas del perfil activo: una al rato de entrar y luego cada 40–90 s,
 * más los cambios de etapa de los pedidos. Se pausa en el modo presentación.
 * Con la app en segundo plano y permiso concedido, usa los avisos del sistema.
 */
export function MotorAvisos({ datos }: { datos: DatosAvisos }) {
  const t = useTranslations("notificaciones");
  const texto = useTextoAviso();
  const router = useRouter();
  const hydrated = useHydrated();
  const perfil = useAppStore((s) => s.perfil);
  const presentando = useAppStore((s) => s.presentacion.activa);
  // Refs para que el efecto no se reinicie con cada render (idioma, router).
  const mostrarRef = useRef<(a: Aviso) => void>(() => {});
  useEffect(() => {
    mostrarRef.current = (a: Aviso) => {
      const { titulo, texto: cuerpo } = texto(a);
      const sistema = useAppStore.getState().avisosSistema && typeof Notification !== "undefined" && Notification.permission === "granted";
      if (document.hidden && sistema) {
        const opciones: NotificationOptions = { body: cuerpo, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: a.id, data: { url: a.href ?? "/" } };
        navigator.serviceWorker?.ready.then((r) => r.showNotification(titulo, opciones)).catch(() => new Notification(titulo, opciones));
        return;
      }
      toast(titulo, {
        description: cuerpo,
        action: a.href ? { label: t("ver"), onClick: () => router.push(a.href!) } : undefined,
      });
    };
  });

  useEffect(() => {
    if (!hydrated || !perfil || presentando) return;
    const st = useAppStore.getState();
    st.sembrarAvisos(bandejaInicial(perfil, datos, new Date()));

    let timer: ReturnType<typeof setTimeout>;
    const programar = (ms: number) => {
      timer = setTimeout(() => {
        const s = useAppStore.getState();
        const r = siguienteAviso(
          perfil,
          datos,
          { pedidos: s.pedidos, recordatorios: s.recordatorios, lotes: s.productor.lotes, entregados: s.avisosEntregados },
          new Date(),
          Math.floor(Math.random() * 2 ** 31),
        );
        if (r) {
          s.recibirAviso(r.aviso, r.efecto);
          mostrarRef.current(r.aviso);
        }
        programar(ENTRE_MS[0] + Math.random() * (ENTRE_MS[1] - ENTRE_MS[0]));
      }, ms);
    };
    programar(PRIMERO_MS);

    // Pedidos de la persona: avisar en cuanto cambian de etapa.
    const pedidos = perfil === "consumidor"
      ? setInterval(() => {
          const s = useAppStore.getState();
          const now = new Date();
          for (const a of avisosDePedidos(s.pedidos, now, s.avisosEntregados)) {
            const aviso = { ...a, fecha: now.toISOString(), leida: false };
            s.recibirAviso(aviso);
            mostrarRef.current(aviso);
          }
        }, 3000)
      : undefined;

    return () => {
      clearTimeout(timer);
      clearInterval(pedidos);
    };
  }, [hydrated, perfil, presentando, datos]);

  return null;
}
