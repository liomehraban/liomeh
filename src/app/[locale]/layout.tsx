import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Bebas_Neue, Public_Sans } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { PhoneFrame } from "@/components/shell/PhoneFrame";
import { TopControls } from "@/components/shell/TopControls";
import { LocaleSync } from "@/components/shell/LocaleSync";
import { MotionProvider } from "@/components/shell/MotionProvider";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const publicSans = Public_Sans({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-public-sans", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : "es", namespace: "meta" });
  return { title: { default: t("titulo"), template: `%s · Bara Bara` }, description: t("descripcion") };
}

export const viewport: Viewport = {
  themeColor: "#93408F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${bebas.variable} ${publicSans.variable}`}>
      <body>
        <NextIntlClientProvider>
          <MotionProvider>
            <LocaleSync />
            <PhoneFrame>
              <TopControls />
              {children}
              <Toaster />
            </PhoneFrame>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
