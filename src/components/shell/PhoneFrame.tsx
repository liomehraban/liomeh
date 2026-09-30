"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { PHONE_ROOT_ID } from "@/hooks/usePhoneContainer";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const noop = () => () => {};

/**
 * En desktop (≥768 px) muestra la app dentro de un device de 390×844 sobre fondo crema, con logotipo
 * y QR «Abrir en tu teléfono». En móvil ocupa toda la pantalla. El panel de gobierno usa layout ancho.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const t = useTranslations("shell");
  const pathname = usePathname();
  const ancho = pathname.startsWith("/gobierno");
  const url = useSyncExternalStore(noop, () => window.location.origin + pathname, () => "");

  if (ancho) {
    return (
      <div id={PHONE_ROOT_ID} className="relative min-h-dvh w-full bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-dvh md:flex md:items-center md:justify-center md:gap-10 md:bg-crema lg:gap-16 md:p-4">
      <aside className="hidden max-w-xs flex-col items-start gap-6 lg:flex">
        <div className="papel-picado h-12 w-64" aria-hidden />
        <Logo className="w-64" />
        <p className="text-lg text-tinta-2">{t("escaneaQR")}</p>
        <div className="rounded-card bg-white p-4 shadow-sm">
          {url ? (
            <QRCodeSVG value={url} size={148} fgColor="#3E1C3C" bgColor="#FFFFFF" title={t("abrirEnTelefono")} />
          ) : (
            <div className="size-[148px]" />
          )}
        </div>
        <p className="font-semibold text-morado-700">{t("abrirEnTelefono")}</p>
      </aside>
      <div
        id={PHONE_ROOT_ID}
        className={cn(
          "relative h-dvh w-full overflow-hidden bg-background [transform:translateZ(0)]",
          "md:h-[min(844px,calc(100dvh-2rem))] md:w-[390px] md:shrink-0 md:rounded-[48px] md:border-[10px] md:border-morado-900 md:shadow-2xl",
        )}
      >
        {children}
      </div>
    </div>
  );
}
