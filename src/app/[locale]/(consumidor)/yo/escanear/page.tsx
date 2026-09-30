import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { contextoInsignias, objetivosCheckin } from "@/data/pasaporte";
import { Escaner } from "@/components/passport/Escaner";

export default async function EscanearPage({ params }: PageProps<"/[locale]/yo/escanear">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const [objetivos, ctx, lealtad] = await Promise.all([objetivosCheckin(), contextoInsignias(), getRepository().lealtad()]);
  const contexto = { mercados: ctx.mercados, productores: ctx.productores };
  return (
    <Suspense>
      <Escaner objetivos={objetivos} ctx={contexto} insignias={lealtad.insignias} />
    </Suspense>
  );
}
