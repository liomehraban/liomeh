"use client";

import { useTranslations } from "next-intl";

import type { Productor, ZonaHuerto } from "@/lib/schemas";
import { TarjetaProductor } from "./TarjetaProductor";

export function FichaZona({ zona, productores }: { zona: ZonaHuerto; productores: Productor[] }) {
  const t = useTranslations("huertos");
  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="pr-10">
        <p className="text-[13px] font-semibold text-nopal">
          {t("zona")} · {zona.alcaldia}
        </p>
        <h2 className="font-display text-[30px] text-morado-700">{zona.nombre}</h2>
      </div>
      <p className="text-sm leading-relaxed">{zona.descripcion}</p>
      <div>
        <h3 className="mb-1.5 text-sm font-bold text-morado-700">{t("cultivos")}</h3>
        <ul className="flex flex-wrap gap-1.5">
          {zona.cultivos.map((c) => (
            <li key={c} className="rounded-pill bg-nopal/10 px-2.5 py-1 text-[13px] font-semibold text-nopal">
              {c}
            </li>
          ))}
        </ul>
      </div>
      {productores.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-morado-700">{t("productoresZona")}</h3>
          {productores.map((p) => (
            <TarjetaProductor key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
