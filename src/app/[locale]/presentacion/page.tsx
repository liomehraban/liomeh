import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { PresentacionIntro } from "@/components/presentacion/PresentacionIntro";

export default async function PresentacionPage({ params }: PageProps<"/[locale]/presentacion">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <PresentacionIntro />;
}
