"use client";

import { useRef, useState, useSyncExternalStore } from "react";

type Reconocimiento = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type Constructor = new () => Reconocimiento;

const ctor = (): Constructor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Constructor; webkitSpeechRecognition?: Constructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};
const noop = () => () => {};

/** Dictado con Web Speech API. `disponible` es false si el navegador no lo soporta (el botón se oculta). */
export function useDictado(locale: string, onTexto: (t: string) => void) {
  const disponible = useSyncExternalStore(noop, () => !!ctor(), () => false);
  const [escuchando, setEscuchando] = useState(false);
  const rec = useRef<Reconocimiento | null>(null);

  const alternar = () => {
    const C = ctor();
    if (!C) return;
    if (escuchando) {
      rec.current?.stop();
      return;
    }
    const r = new C();
    r.lang = locale === "en" ? "en-US" : "es-MX";
    r.interimResults = false;
    r.onresult = (e) => onTexto(Array.from(e.results).map((x) => x[0].transcript).join(" "));
    r.onend = () => setEscuchando(false);
    r.onerror = () => setEscuchando(false);
    rec.current = r;
    setEscuchando(true);
    r.start();
  };

  return { disponible, escuchando, alternar };
}
