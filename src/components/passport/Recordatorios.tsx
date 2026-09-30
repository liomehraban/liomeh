"use client";

import { BellRing } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { formatRangoFechas } from "@/lib/eventos";
import type { Evento } from "@/lib/schemas";
import { useAppStore, useHydrated } from "@/store/useAppStore";

export function Recordatorios({ eventos }: { eventos: Evento[] }) {
  const t = useTranslations("pasaporte");
  const locale = useLocale();
  const hydrated = useHydrated();
  const ids = useAppStore((s) => s.recordatorios);
  const lista = hydrated ? eventos.filter((e) => ids.includes(e.id)) : [];
  return (
    <section aria-labelledby="recordatorios" className="flex flex-col gap-3 rounded-card border border-border bg-white p-5">
      <h2 id="recordatorios" className="text-xl font-bold text-morado-700">
        {t("recordatorios")}
      </h2>
      {lista.length === 0 ? (
        <p className="text-tinta-2">
          {t("sinRecordatorios")}{" "}
          <Link href="/agenda" className="font-semibold text-morado underline">
            →
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {lista.map((e) => (
            <li key={e.id} className="flex items-center gap-3 text-sm">
              <BellRing className="size-5 shrink-0 text-dorado" aria-hidden />
              <span className="flex-1 font-semibold">{e.titulo}</span>
              {e.inicio !== "recurrente" && <span className="text-tinta-2">{formatRangoFechas(e.inicio, e.fin, locale)}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
