"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const noop = () => () => {};
const enQA = () => {
  try {
    return new URLSearchParams(window.location.search).has("qa") || localStorage.getItem("pasele-qa") === "1";
  } catch {
    return false;
  }
};

/** Muestra su contenido solo en modo QA (?qa en la URL o localStorage «pasele-qa» = 1). */
export function SoloQA({ children }: { children: ReactNode }) {
  const qa = useSyncExternalStore(noop, enQA, () => false);
  return qa ? <>{children}</> : null;
}
