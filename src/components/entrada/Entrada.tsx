"use client";

import { useEffect, useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { HOME_PERFIL, useAppStore, useHydrated, type Perfil } from "@/store/useAppStore";
import { Splash } from "./Splash";
import { Onboarding } from "./Onboarding";
import { SelectorPerfil } from "./SelectorPerfil";

const SPLASH_MS = 1200;
// El splash solo se ve al abrir la app, no al volver al selector desde dentro.
let splashMostrado = false;

/** M0 · Entrada: splash → idioma + onboarding (3 slides) → selector de perfil. */
export function Entrada() {
  const router = useRouter();
  const hydrated = useHydrated();
  const perfil = useAppStore((s) => s.perfil);
  const onboardingVisto = useAppStore((s) => s.onboardingVisto);
  const setPerfil = useAppStore((s) => s.setPerfil);
  const marcarOnboarding = useAppStore((s) => s.marcarOnboarding);
  const [splash, setSplash] = useState(() => !splashMostrado);
  const saltarSplash = () => {
    splashMostrado = true;
    setSplash(false);
  };

  // Si ya hay perfil, va directo a su home.
  useEffect(() => {
    if (hydrated && perfil) router.replace(HOME_PERFIL[perfil]);
  }, [hydrated, perfil, router]);

  useEffect(() => {
    const id = setTimeout(() => {
      splashMostrado = true;
      setSplash(false);
    }, SPLASH_MS);
    return () => clearTimeout(id);
  }, []);

  // Al elegir, el selector se queda en pantalla hasta que llega el home del perfil (sin destello del splash).
  const [eligiendo, setEligiendo] = useState(false);
  const elegir = (p: Perfil) => {
    setEligiendo(true);
    marcarOnboarding();
    setPerfil(p);
  };

  if (eligiendo) return <SelectorPerfil onElegir={elegir} />;
  if (splash || !hydrated || perfil) return <Splash onSkip={saltarSplash} />;
  if (!onboardingVisto) return <Onboarding onDone={marcarOnboarding} />;
  return <SelectorPerfil onElegir={elegir} />;
}
