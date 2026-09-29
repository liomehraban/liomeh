"use client";

import { useSyncExternalStore } from "react";

export const PHONE_ROOT_ID = "phone-root";

const subscribe = () => () => {};

/** Nodo del marco de teléfono: los portales (sheets, diálogos) se montan dentro para no salirse del device en desktop. */
export function usePhoneContainer(): HTMLElement | null {
  return useSyncExternalStore(
    subscribe,
    () => document.getElementById(PHONE_ROOT_ID),
    () => null,
  );
}
