import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { getRepository } from "@/data/repository";
import { resumenPuestos } from "@/data/comercio";
import { datosProductor } from "@/data/vistas-demo";
import { FichaProductor } from "@/components/huertos/FichaProductor";

/** M18 · Así ve el público la ficha del productor, sin salir de su navegación (tab bar de productor). */
export default async function PerfilPublicoPage({ params }: PageProps<"/[locale]/productor/huerto/publico">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const repo = getRepository();
  const { productor } = await datosProductor();
  const [zonas, resenas, vendedores] = await Promise.all([repo.zonasHuerto(), repo.resenas(productor.id), resumenPuestos()]);
  const nombres = Object.fromEntries(Object.values(vendedores).map((v) => [v.id, v.nombre]));
  return <FichaProductor productor={productor} zona={zonas.find((z) => z.id === productor.zona_id) ?? null} resenas={resenas} nombres={nombres} />;
}
