import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPinOff } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getRepository } from "@/data/repository";
import { Button } from "@/components/ui/button";
import { InteriorView } from "@/components/interior/InteriorView";

export async function generateStaticParams() {
  return (await getRepository().mercados()).map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/mercado/[id]/interior">): Promise<Metadata> {
  const { id, locale } = await params;
  const m = await getRepository().mercado(id);
  const t = await getTranslations({ locale: locale as Locale, namespace: "interior" });
  return { title: m ? `${m.nombre_display} · ${t("titulo")}` : t("titulo") };
}

export default async function InteriorPage({ params }: PageProps<"/[locale]/mercado/[id]/interior">) {
  const { id, locale } = await params;
  setRequestLocale(locale as Locale);
  const repo = getRepository();
  const mercado = await repo.mercado(id);
  if (!mercado) notFound();
  const interior = mercado.interior_disponible ? await repo.interior(id) : null;

  if (!interior) {
    const t = await getTranslations("interior");
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <MapPinOff className="size-12 text-morado" strokeWidth={1.5} aria-hidden />
        <h1 className="font-display text-4xl text-morado-700">{t("proximamente")}</h1>
        <p className="text-tinta-2">{t("proximamenteTexto")}</p>
        <Button asChild variant="secondary">
          <Link href={`/mercado/${id}`}>{t("irFicha")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Suspense>
        <InteriorView interior={interior} nombreMercado={mercado.nombre_display} />
      </Suspense>
    </div>
  );
}
