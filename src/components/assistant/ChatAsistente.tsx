"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { preguntasRestantes } from "@/lib/planes";
import type { RespuestaAsistente } from "@/lib/assistant/types";
import type { PreguntaRapida } from "@/data/respuestas-asistente";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { MarchantaAvatar } from "./MarchantaAvatar";
import { MarchantaPersonaje } from "./MarchantaPersonaje";
import { TarjetaAsistente } from "./TarjetaAsistente";

type Mensaje = { id: number; role: "user" | "assistant"; content: string; respuesta?: RespuestaAsistente; aviso?: "agotado" };

/**
 * M22 · Marchanta simulada: preguntas rápidas con respuestas preguardadas (calculadas en el servidor
 * con los datos reales). No hay texto libre ni llamadas de red: la IA se conectará en otra etapa.
 */
export function ChatAsistente({ preguntas }: { preguntas: PreguntaRapida[] }) {
  const t = useTranslations("asistente");
  const hydrated = useHydrated();
  const plan = useAppStore((s) => s.plan);
  const contador = useAppStore((s) => s.asistente);
  const preguntar = useAppStore((s) => s.preguntarAsistente);
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ id: 0, role: "assistant", content: t("saludo") }]);
  const [cargando, setCargando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const seq = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nuevoId = () => seq.current++;

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, cargando]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const restantes = hydrated ? preguntasRestantes(contador ?? { fecha: "", usados: 0 }, plan) : null;

  const elegir = (p: PreguntaRapida) => {
    if (cargando) return;
    const usuario: Mensaje = { id: nuevoId(), role: "user", content: p.pregunta };
    if (!preguntar()) {
      setMensajes((m) => [...m, usuario, { id: nuevoId(), role: "assistant", content: t("agotado"), aviso: "agotado" }]);
      return;
    }
    setMensajes((m) => [...m, usuario]);
    setCargando(true);
    // Pausa breve de «escribiendo…» para que se sienta como conversación.
    const pausa = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 900;
    timer.current = setTimeout(() => {
      setMensajes((m) => [...m, { id: nuevoId(), role: "assistant", content: p.respuesta.text, respuesta: p.respuesta }]);
      setCargando(false);
    }, pausa);
  };

  return (
    <div data-pantalla-completa className="flex h-full flex-col bg-papel">
      <header className="relative flex items-end gap-3 bg-morado px-4 pt-[max(2rem,env(safe-area-inset-top))] pr-28 pb-3 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-5 opacity-50" aria-hidden />
        <MarchantaPersonaje className="shrink-0" />
        <div className="relative flex min-w-0 flex-col">
          <h1 className="font-display text-3xl">{t("titulo")}</h1>
          <p className="text-[13px] text-crema/90">{t("subtitulo")}</p>
        </div>
      </header>

      <p className="bg-dorado-200 px-4 py-1.5 text-center text-[12px] font-semibold text-morado-900" aria-live="polite">
        {restantes === null ? t("limite") : restantes === Infinity ? t("ilimitado") : `${t("limite")} · ${t("restantes", { n: restantes })}`}
      </p>

      <div className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-relevant="additions">
        <ul data-revelar className="flex flex-col gap-3">
          {mensajes.map((m) => (
            <li key={m.id} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" && (
                <MarchantaAvatar className="mt-1 size-9 shrink-0 bg-dorado ring-2 ring-white" />
              )}
              <div className={cn("flex max-w-[85%] flex-col gap-2", m.role === "user" && "items-end")}>
                <p
                  className={cn(
                    "rounded-card px-4 py-2.5 text-[15px] leading-snug whitespace-pre-line",
                    m.role === "user" ? "rounded-br-md bg-morado text-crema" : "rounded-bl-md bg-white text-tinta shadow-sm",
                    m.aviso === "agotado" && "bg-cempasuchil/20",
                  )}
                >
                  <span className="sr-only">{m.role === "user" ? `${t("tu")}: ` : `${t("titulo")}: `}</span>
                  {m.content}
                </p>
                {m.aviso === "agotado" && (
                  <Button asChild size="sm" variant="premium">
                    <Link href="/yo/planes">{t("verPlanes")}</Link>
                  </Button>
                )}
                {m.respuesta?.cards.map((c) => (
                  <TarjetaAsistente key={`${c.tipo}-${c.id}`} c={c} />
                ))}
              </div>
            </li>
          ))}
          {cargando && (
            <li className="flex items-center gap-2 text-sm text-tinta-2" role="status">
              <MarchantaAvatar className="size-9 shrink-0 bg-dorado ring-2 ring-white" />
              <span className="flex gap-1 rounded-card bg-white px-4 py-3 shadow-sm" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-2 animate-bounce rounded-full bg-morado/60" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </span>
              <span className="sr-only">{t("escribiendo")}</span>
            </li>
          )}
        </ul>
        <div ref={fin} />
      </div>

      <div className="border-t border-border bg-crema px-3 pt-2 pb-[calc(var(--asoma,0px)+0.75rem)]">
        <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-tinta-2">
          <MessageCircleQuestion className="size-4" aria-hidden />
          {t("sugerencias")}
        </p>
        <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto" role="group" aria-label={t("sugerencias")}>
          {preguntas.map((p) => (
            <button
              key={p.pregunta}
              type="button"
              onClick={() => elegir(p)}
              disabled={cargando}
              data-demo={`pregunta:${p.respuesta.intencion}`}
              className="flex min-h-11 items-center rounded-pill border border-morado/40 bg-white px-3.5 text-left text-[13px] font-semibold text-morado-700 hover:bg-morado-50 disabled:opacity-50"
            >
              {p.pregunta}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
