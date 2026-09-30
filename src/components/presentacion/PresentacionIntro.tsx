"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shell/Logo";
import { PASOS } from "@/lib/presentacion";
import { useAppStore } from "@/store/useAppStore";
import { persona } from "./BarraPresentacion";
import { EVENTO_SIGUIENTE } from "./Conductor";

/** /presentacion: guion de 10 pasos y botón para arrancar. */
export function PresentacionIntro() {
  const t = useTranslations("presentacion");
  const comenzar = () => {
    const st = useAppStore.getState();
    st.resetDemo();
    st.setPresentacion({ activa: true, paso: -1 });
    window.dispatchEvent(new Event(EVENTO_SIGUIENTE));
  };
  return (
    <div className="flex flex-col gap-5 bg-crema px-5 pt-16 pb-40">
      <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
      <Logo className="w-48" />
      <div>
        <h1 className="font-display text-4xl text-morado-700">{t("titulo")}</h1>
        <p className="mt-1 text-tinta-2">{t("texto")}</p>
      </div>
      <ol className="flex flex-col gap-2">
        {PASOS.map((p, i) => (
          <li key={p.id} className="flex gap-3 rounded-2xl bg-white p-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-morado font-bold text-crema">{i + 1}</span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[12px] font-bold text-morado-700">{t(`perfiles.${persona(p)}`)}</span>
              <span className="font-semibold">{t(`pasos.${p.id}.titulo` as "pasos.buscar.titulo")}</span>
              <span className="text-[13px] text-tinta-2">{t(`pasos.${p.id}.espera` as "pasos.buscar.espera")}</span>
            </span>
          </li>
        ))}
      </ol>
      <Button size="lg" onClick={comenzar}>
        <Play aria-hidden />
        {t("comenzar")}
      </Button>
    </div>
  );
}
