"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { MarchantaIlustracion } from "@/components/assistant/MarchantaIlustracion";
import { Logo } from "@/components/shell/Logo";

export function Splash({ onSkip }: { onSkip: () => void }) {
  const t = useTranslations("entrada");
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label={t("saltarSplash")}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-morado text-crema focus-visible:outline-none"
    >
      <div className="papel-picado absolute inset-x-0 top-0 h-16" aria-hidden />
      <div className="papel-picado absolute inset-x-0 bottom-0 h-16 rotate-180" aria-hidden />
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <Logo priority className="w-64 drop-shadow-lg" />
        <span className="text-base font-semibold text-dorado-200">{t("eslogan")}</span>
        <MarchantaIlustracion className="mt-4 w-40 drop-shadow-xl" />
      </motion.div>
    </button>
  );
}
