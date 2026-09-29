"use client";

import { DropdownMenu } from "radix-ui";
import { Check, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { usePhoneContainer } from "@/hooks/usePhoneContainer";
import { HOME_PERFIL, useAppStore, useHydrated, type Perfil } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { ICONO_PERFIL, PERFILES } from "./perfiles";

/** Botón flotante (demo/pitch): cambia de perfil con un toque sobre la opción. */
export function ProfileSwitcher({ className }: { className?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const container = usePhoneContainer();
  const hydrated = useHydrated();
  const perfil = useAppStore((s) => s.perfil);
  const setPerfil = useAppStore((s) => s.setPerfil);
  const Icono = hydrated && perfil ? ICONO_PERFIL[perfil] : UserRound;

  const elegir = (p: Perfil) => {
    setPerfil(p);
    router.push(HOME_PERFIL[p]);
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label={
          hydrated && perfil
            ? `${t("shell.cambiarPerfil")} · ${t("shell.perfilActual", { perfil: t(`perfiles.${perfil}`) })}`
            : t("shell.cambiarPerfil")
        }
        className={cn(
          "grid size-11 place-items-center rounded-pill bg-morado/70 text-crema shadow-md backdrop-blur transition-colors hover:bg-morado focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-morado",
          className,
        )}
      >
        <Icono className="size-5" strokeWidth={1.75} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={container}>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[60] min-w-56 rounded-card border border-border bg-crema p-1.5 shadow-xl"
        >
          <DropdownMenu.Label className="px-3 py-2 text-[13px] font-semibold text-tinta-2">
            {t("shell.cambiarPerfil")}
          </DropdownMenu.Label>
          {PERFILES.map((p) => {
            const I = ICONO_PERFIL[p];
            const activo = hydrated && perfil === p;
            return (
              <DropdownMenu.Item
                key={p}
                onSelect={() => elegir(p)}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 text-[15px] font-semibold text-tinta outline-none data-[highlighted]:bg-morado-50"
              >
                <I className="size-5 text-morado" strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{t(`perfiles.${p}`)}</span>
                {activo && <Check className="size-4 text-nopal" aria-hidden />}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
