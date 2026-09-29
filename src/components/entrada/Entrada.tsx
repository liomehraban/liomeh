"use client";

import { useEffect, useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { HOME_PERFIL, useAppStore, useHydrated, type Perfil } from "@/store/useAppStore";
import { Splash } from "./Splash";
import { Onboarding } from "./Onboarding";
import { SelectorPerfil } from "./SelectorPerfil";

const SPLASH_MS = 1200;

/** M0 · Entrada: splash → idioma + onboarding (3 slides) → selector de perfil. */
export function Entrada() {
  const router = useRouter();
  const hydrated = useHydrated();
  const perfil = useAppStore((s) => s.perfil);
  const onboardingVisto = useAppStore((s) => s.onboardingVisto);
  const setPerfil = useAppStore((s) => s.setPerfil);
  const marcarOnboarding = useAppStore((s) => s.marcarOnboarding);
  const [splash, setSplash] = useState(true);

  // Si ya hay perfil, va directo a su home.
  useEffect(() => {
    if (hydrated && perfil) router.replace(HOME_PERFIL[perfil]);
  }, [hydrated, perfil, router]);

  useEffect(() => {
    const id = setTimeout(() => setSplash(false), SPLASH_MS);
    return () => clearTimeout(id);
  }, []);

  const elegir = (p: Perfil) => {
    marcarOnboarding();
    setPerfil(p);
  };

  if (splash || !hydrated || perfil) return <Splash onSkip={() => setSplash(false)} />;
  if (!onboardingVisto) return <Onboarding onDone={marcarOnboarding} />;
  return <SelectorPerfil onElegir={elegir} />;
}
