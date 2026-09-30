"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import { useAppStore, useHydrated } from "@/store/useAppStore";

const POR_PAGINA = 6;
const giro = (i: number) => [-8, 5, -3, 7, -6, 3][i % 6];

/** Pasaporte ilustrado: páginas de sellos circulares en tinta morada con nombre y fecha. */
export function PaginasSellos({ nombres }: { nombres: Record<string, string> }) {
  const t = useTranslations("pasaporte");
  const locale = useLocale();
  const hydrated = useHydrated();
  const sellos = useAppStore((s) => s.sellos);
  const fechas = useAppStore((s) => s.sellosFechas) ?? {};
  const [pag, setPag] = useState(0);
  if (!hydrated) return <div className="h-72 rounded-card bg-dorado-200/40" />;

  // más recientes primero
  const orden = [...sellos].reverse();
  const paginas = Math.max(1, Math.ceil(orden.length / POR_PAGINA));
  const actual = Math.min(pag, paginas - 1);
  const visibles = orden.slice(actual * POR_PAGINA, (actual + 1) * POR_PAGINA);
  const corto = (id: string) => (nombres[id] ?? id).replace(/^Mercado (de )?/, "").replace(/\s*\(.*\)$/, "");

  return (
    <section aria-labelledby="sellos" className="relative flex flex-col gap-3 overflow-hidden rounded-card border-2 border-dorado/60 bg-[#FBF3E0] p-4 shadow-inner">
      <div className="flex items-baseline justify-between">
        <h2 id="sellos" className="font-display text-3xl text-morado-700">
          {t("titulo")}
        </h2>
        <span className="text-sm font-semibold text-tinta-2">{t("sellos", { n: sellos.length })}</span>
      </div>
      <ul className="grid grid-cols-3 gap-3">
        {visibles.map((id, i) => (
          <motion.li
            key={id}
            initial={{ scale: 1.4, opacity: 0, rotate: giro(i) - 20 }}
            animate={{ scale: 1, opacity: 1, rotate: giro(i) }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.05 }}
            className="flex aspect-square flex-col items-center justify-center rounded-full border-[3px] border-double border-morado/80 p-1.5 text-center text-morado"
            aria-label={t("selloDe", { mercado: nombres[id] ?? id })}
          >
            <span className="font-display text-[15px] leading-tight">{corto(id)}</span>
            {fechas[id] && (
              <span className="mt-0.5 text-[10px] font-semibold">
                {new Date(fechas[id]).toLocaleDateString(locale === "en" ? "en-US" : "es-MX", { day: "numeric", month: "short", year: "2-digit", timeZone: "America/Mexico_City" })}
              </span>
            )}
          </motion.li>
        ))}
      </ul>
      {paginas > 1 && (
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setPag(actual - 1)} disabled={actual === 0} aria-label={t("anterior")} className="grid size-11 place-items-center rounded-pill text-morado disabled:text-gris/40">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <span className="text-[13px] text-tinta-2">{t("pagina", { n: actual + 1, total: paginas })}</span>
          <button type="button" onClick={() => setPag(actual + 1)} disabled={actual >= paginas - 1} aria-label={t("siguiente")} className="grid size-11 place-items-center rounded-pill text-morado disabled:text-gris/40">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
