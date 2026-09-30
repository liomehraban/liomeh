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
    <div className="flex min-h-full flex-col gap-5 bg-crema px-5">
      {/* Franja fija arriba con fondo sólido: el texto que se desplaza pasa por debajo, no entre las banderitas. */}
      <div className="papel-picado sticky top-0 z-10 -mx-5 mb-1 box-content h-10 shrink-0 bg-crema bg-origin-content pt-[env(safe-area-inset-top)] shadow-[0_6px_8px_-6px_rgba(62,28,60,0.12)]" aria-hidden />
      <Logo className="text-6xl text-morado" />
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
      {/* CTA anclado abajo: visible sin recorrer los 10 pasos; mt-auto lo lleva al fondo si la lista es corta. */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-auto bg-gradient-to-t from-crema from-75% to-crema/0 px-5 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button size="lg" onClick={comenzar} className="w-full shadow-md">
          <Play aria-hidden />
          {t("comenzar")}
        </Button>
      </div>
    </div>
  );
}
