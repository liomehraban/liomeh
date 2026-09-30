"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, House, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "@/i18n/navigation";
import { HOME_PERFIL, useAppStore, useHydrated, type Perfil } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { ICONO_PERFIL, PERFILES } from "./perfiles";

/**
 * Botón flotante (demo/pitch) para cambiar de perfil. Abre una hoja inferior con los 4 perfiles
 * y la salida a la pantalla de inicio, donde se vuelve a elegir con qué perfil entrar.
 */
export function ProfileSwitcher({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const hydrated = useHydrated();
  const perfil = useAppStore((s) => s.perfil);
  const setPerfil = useAppStore((s) => s.setPerfil);
  const salirDePerfil = useAppStore((s) => s.salirDePerfil);
  const [abierto, setAbierto] = useState(false);
  const actual = hydrated ? perfil : null;
  // Consumidor: persona (la mochila del selector de perfiles se confundía con el carrito).
  const Icono = actual && actual !== "consumidor" ? ICONO_PERFIL[actual] : UserRound;

  const elegir = (p: Perfil) => {
    setAbierto(false);
    setPerfil(p);
    router.push(HOME_PERFIL[p]);
  };

  const volverAlInicio = () => {
    setAbierto(false);
    salirDePerfil();
    router.push("/");
  };

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger
        aria-label={actual ? `${t("shell.cambiarPerfil")} · ${t("shell.perfilActual", { perfil: t(`perfiles.${actual}`) })}` : t("shell.cambiarPerfil")}
        className={cn(
          "pressable relative grid size-11 place-items-center rounded-pill bg-white text-morado shadow-md ring-1 ring-black/5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
          className,
        )}
      >
        <Icono className="size-5" strokeWidth={2} aria-hidden />
        <span className="absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full bg-dorado text-morado-900 ring-2 ring-white" aria-hidden>
          <ArrowLeftRight className="size-3" strokeWidth={2.5} />
        </span>
      </SheetTrigger>
      <SheetContent closeLabel={t("comun.cerrar")} className="pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <SheetHeader>
          <SheetTitle>{t("shell.cambiarPerfil")}</SheetTitle>
          <SheetDescription>{t("shell.cambiarPerfilTexto")}</SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-2 px-5">
          {PERFILES.map((p) => {
            const I = ICONO_PERFIL[p];
            const activo = actual === p;
            return (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => elegir(p)}
                  aria-current={activo ? "true" : undefined}
                  className={cn(
                    "pressable flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 bg-white px-3 py-2 text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                    activo ? "border-morado" : "border-border",
                  )}
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", activo ? "bg-morado text-white" : "bg-morado-50 text-morado")}>
                    <I className="size-5" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-bold text-tinta">{t(`perfiles.${p}`)}</span>
                    <span className="text-[13px] text-tinta-2">{t(`entrada.perfilDesc.${p}`)}</span>
                  </span>
                  {activo && (
                    <span className="flex shrink-0 items-center gap-1 rounded-pill bg-morado-50 px-2 py-1 text-xs font-bold text-morado-700">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                      {t("shell.estasAqui")}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="px-5">
          <Button variant="secondary" className="w-full" onClick={volverAlInicio}>
            <House aria-hidden />
            {t("shell.volverInicio")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
