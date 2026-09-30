"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMessages, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/market/PhotoPlaceholder";
import { LocaleToggle } from "@/components/shell/LocaleToggle";
import type { CategoriaGiro } from "@/lib/giros";
import { cn } from "@/lib/utils";

const ILUSTRACION: CategoriaGiro[] = ["otros", "frutas", "flores"];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const t = useTranslations();
  const slides = useMessages().entrada.slides;
  const [[i, dir], setPaso] = useState<[number, 1 | -1]>([0, 1]);
  const ultimo = i === slides.length - 1;
  const ir = (n: number) => n >= 0 && n < slides.length && setPaso([n, n > i ? 1 : -1]);

  return (
    <div className="flex h-full flex-col bg-crema">
      <div className="flex flex-col items-start gap-2 px-5 pt-[max(1rem,env(safe-area-inset-top))] pr-20">
        <span className="text-sm font-semibold text-tinta-2">{t("entrada.elegirIdioma")}</span>
        <LocaleToggle className="bg-morado-50" />
      </div>

      <div className="relative flex-1 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.section
            key={i}
            custom={dir}
            variants={{ entra: (d: number) => ({ opacity: 0, x: 60 * d }), quieto: { opacity: 1, x: 0 }, sale: (d: number) => ({ opacity: 0, x: -60 * d }) }}
            initial="entra"
            animate="quieto"
            exit="sale"
            transition={{ duration: 0.25, ease: "easeOut" }}
            // Deslizar con el dedo: a la izquierda avanza, a la derecha regresa (como un carrusel nativo).
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -400) ir(i + 1);
              else if (info.offset.x > 60 || info.velocity.x > 400) ir(i - 1);
            }}
            aria-roledescription="slide"
            aria-label={t("entrada.paso", { actual: i + 1, total: slides.length })}
            className="flex h-full cursor-grab touch-pan-y flex-col justify-center gap-6 px-5 active:cursor-grabbing"
          >
            <PhotoPlaceholder categoria={ILUSTRACION[i]} className="aspect-[4/3] max-h-[34dvh] w-full" iconClassName="size-20" />
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-[44px] text-morado-700">{t(`entrada.slides.${i}.titulo` as "entrada.slides.0.titulo")}</h2>
              <p className="text-lg text-tinta-2">{t(`entrada.slides.${i}.texto` as "entrada.slides.0.texto")}</p>
            </div>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-center" aria-hidden>
          {slides.map((_, j) => (
            <button key={j} type="button" tabIndex={-1} onClick={() => ir(j)} className="grid h-6 w-7 place-items-center">
              <span className={cn("h-2 rounded-pill transition-all", j === i ? "w-6 bg-morado" : "w-2 bg-morado/25")} />
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          {!ultimo && (
            <Button variant="ghost" className="flex-1" onClick={onDone}>
              {t("comun.saltar")}
            </Button>
          )}
          <Button className="flex-1" onClick={() => (ultimo ? onDone() : ir(i + 1))}>
            {ultimo ? t("comun.empezar") : t("comun.siguiente")}
          </Button>
        </div>
      </div>
    </div>
  );
}
