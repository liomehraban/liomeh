"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { ICONO_PERFIL, PERFILES } from "@/components/shell/perfiles";
import type { Perfil } from "@/store/useAppStore";

export function SelectorPerfil({ onElegir }: { onElegir: (p: Perfil) => void }) {
  const t = useTranslations();
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-crema">
      <header className="relative bg-morado px-5 pt-16 pb-6 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <h1 className="font-display text-[44px]">{t("entrada.elegirPerfil")}</h1>
        <p className="mt-2 text-crema/90">{t("entrada.elegirPerfilTexto")}</p>
      </header>

      <ul className="flex flex-col gap-3 p-5">
        {PERFILES.map((p, i) => {
          const Icono = ICONO_PERFIL[p];
          return (
            <motion.li
              key={p}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => onElegir(p)}
                className="flex w-full items-center gap-4 rounded-card border border-border bg-white p-4 text-left shadow-sm transition-colors hover:border-morado focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-morado-50 text-morado">
                  <Icono className="size-6" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-lg font-bold text-tinta">{t(`perfiles.${p}`)}</span>
                  <span className="text-sm text-tinta-2">{t(`entrada.perfilDesc.${p}`)}</span>
                </span>
                <ChevronRight className="size-5 text-gris" aria-hidden />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
