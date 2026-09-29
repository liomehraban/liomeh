"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

import { useAppStore, useHydrated } from "@/store/useAppStore";

/** La URL manda: mantiene `locale` del store alineado con /[locale]. */
export function LocaleSync() {
  const locale = useLocale();
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && useAppStore.getState().locale !== locale) useAppStore.getState().setLocale(locale);
  }, [hydrated, locale]);
  return null;
}
