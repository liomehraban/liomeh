import { QrCode } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getRepository } from "@/data/repository";
import { resumenPuestos } from "@/data/comercio";
import { contextoInsignias } from "@/data/pasaporte";
import { enIdioma } from "@/lib/idioma";
import { Button } from "@/components/ui/button";
import { AjustesDemo } from "@/components/shell/AjustesDemo";
import { MisPedidos } from "@/components/cart/MisPedidos";
import { PaginasSellos } from "@/components/passport/PaginasSellos";
import { NivelCard } from "@/components/passport/NivelCard";
import { Insignias } from "@/components/passport/Insignias";
import { Recompensas } from "@/components/passport/Recompensas";
import { Recordatorios } from "@/components/passport/Recordatorios";
import { PlanActual } from "@/components/passport/PlanActual";

export default async function YoPage({ params }: PageProps<"/[locale]/yo">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations();
  const repo = getRepository();
  const [lealtad, eventos, puestos, ctx] = await Promise.all([repo.lealtad(), repo.eventos(), resumenPuestos(), contextoInsignias()]);
  const { nombres, ...contexto } = ctx;

  return (
    <div className="flex flex-col">
      <header className="relative bg-morado px-5 pt-16 pb-6 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-10" aria-hidden />
        <h1 className="font-display text-4xl">{t("yo.hola", { nombre: lealtad.usuario_demo.nombre })}</h1>
      </header>
      <div className="flex flex-col gap-5 p-5">
        <NivelCard niveles={lealtad.niveles} />
        <Button asChild size="lg" variant="premium">
          <Link href="/yo/escanear">
            <QrCode aria-hidden />
            {t("pasaporte.escanear")}
          </Link>
        </Button>
        <p className="-mt-3 text-center text-[13px] text-tinta-2">{t("pasaporte.escanearTexto")}</p>
        <PaginasSellos nombres={nombres} />
        <Insignias insignias={lealtad.insignias} ctx={contexto} />
        <Recompensas recompensas={lealtad.recompensas} />
        <details className="rounded-card border border-border bg-white p-4">
          <summary className="min-h-11 cursor-pointer content-center font-bold text-morado-700">{t("pasaporte.comoSeGana")}</summary>
          <ul className="flex flex-col gap-2 pt-2 text-sm">
            {lealtad.como_se_gana.map((x) => (
              <li key={x.accion} className="flex justify-between gap-3">
                <span>{enIdioma(x, "accion", locale)}</span>
                <span className="shrink-0 font-semibold text-morado">{enIdioma(x, "puntos", locale)}</span>
              </li>
            ))}
          </ul>
        </details>
        <MisPedidos puestos={puestos} />
        <Recordatorios eventos={eventos} />
        <PlanActual />
        <AjustesDemo />
      </div>
    </div>
  );
}
