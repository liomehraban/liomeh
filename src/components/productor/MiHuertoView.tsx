import { Eye, Leaf, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { EncabezadoPerfil } from "@/components/locatario/EncabezadoPerfil";
import { Estrellas } from "@/components/market/Estrellas";
import { FairTradeCard } from "@/components/fairtrade/FairTradeCard";
import { precioJusto } from "@/lib/fairtrade";
import type { Productor } from "@/lib/schemas";

/** M18 · Productor › Mi huerto: perfil público y su <FairTradeCard>. */
export function MiHuertoView({ productor: p, plan }: { productor: Productor; plan: string }) {
  const t = useTranslations("productor.huerto");
  const f = precioJusto(p);
  return (
    <div className="flex flex-col">
      <EncabezadoPerfil titulo={t("titulo")} subtitulo={p.nombre} />
      <div className="flex flex-col gap-5 p-5">
        <p className="rounded-card bg-nopal p-4 font-bold text-white" role="status">
          {t("mes", { veces: f.esDoble ? t("doble") : t("masPct", { pct: f.mejoraPct }) })}
        </p>
        <FairTradeCard productor={p} />
        <section aria-labelledby="perfil" className="flex flex-col gap-2 rounded-card border border-border bg-white p-4">
          <h2 id="perfil" className="font-bold text-morado-700">
            {t("perfil")}
          </h2>
          <p className="font-display text-3xl text-morado-700">{p.nombre}</p>
          <p className="flex items-center gap-1.5 text-sm text-tinta-2">
            <MapPin className="size-4" aria-hidden />
            {p.pueblo}, {p.alcaldia}
          </p>
          <Estrellas rating={p.rating} total={p.num_resenas} />
          <ul className="flex flex-wrap gap-1.5">
            {p.practicas.map((x) => (
              <li key={x} className="flex items-center gap-1 rounded-pill bg-nopal/10 px-2.5 py-0.5 text-[13px] font-semibold text-nopal">
                <Leaf className="size-3.5" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
          <Button asChild variant="secondary" className="mt-1">
            <Link href={`/huertos/${p.id}`}>
              <Eye aria-hidden />
              {t("verPerfil")}
            </Link>
          </Button>
        </section>
        <p className="text-[13px] text-tinta-2">{t("comision", { plan })}</p>
      </div>
    </div>
  );
}
