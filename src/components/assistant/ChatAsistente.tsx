"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mic, MicOff, SendHorizontal, Sparkles } from "lucide-react";
import { useLocale, useMessages, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { preguntasRestantes } from "@/lib/planes";
import type { RespuestaAsistente } from "@/lib/assistant/types";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { MarchantaAvatar } from "./MarchantaAvatar";
import { TarjetaAsistente } from "./TarjetaAsistente";
import { useDictado } from "./useDictado";

type Mensaje = { id: number; role: "user" | "assistant"; content: string; respuesta?: RespuestaAsistente; aviso?: "agotado" | "error" };

/** M22 · Chat con Marchanta. */
export function ChatAsistente() {
  const t = useTranslations("asistente");
  const chips = useMessages().asistente.chips as string[];
  const locale = useLocale();
  const hydrated = useHydrated();
  const plan = useAppStore((s) => s.plan);
  const perfil = useAppStore((s) => s.perfil);
  const contador = useAppStore((s) => s.asistente);
  const preguntar = useAppStore((s) => s.preguntarAsistente);
  const [mensajes, setMensajes] = useState<Mensaje[]>([{ id: 0, role: "assistant", content: t("saludo") }]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const seq = useRef(1);
  const nuevoId = () => seq.current++;
  const dictado = useDictado(locale, (x) => setTexto((prev) => (prev ? `${prev} ${x}` : x)));

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, cargando]);

  const restantes = hydrated ? preguntasRestantes(contador ?? { fecha: "", usados: 0 }, plan) : null;

  const enviar = async (contenido: string) => {
    const q = contenido.trim();
    if (!q || cargando) return;
    setTexto("");
    const usuario: Mensaje = { id: nuevoId(), role: "user", content: q };
    if (!preguntar()) {
      setMensajes((m) => [...m, usuario, { id: nuevoId(), role: "assistant", content: t("agotado"), aviso: "agotado" }]);
      return;
    }
    const historial = [...mensajes.filter((m) => !m.aviso && m.id !== 0), usuario];
    setMensajes((m) => [...m, usuario]);
    setCargando(true);
    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historial.map(({ role, content }) => ({ role, content })), locale, perfil }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const r = (await res.json()) as RespuestaAsistente;
      setMensajes((m) => [...m, { id: nuevoId(), role: "assistant", content: r.text, respuesta: r }]);
    } catch {
      setMensajes((m) => [...m, { id: nuevoId(), role: "assistant", content: t("error"), aviso: "error" }]);
    } finally {
      setCargando(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void enviar(texto);
  };

  return (
    <div className="flex h-full flex-col bg-papel">
      <header className="relative flex items-center gap-3 bg-morado px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pr-16 pb-3 text-crema">
        <div className="papel-picado absolute inset-x-0 top-0 h-5 opacity-50" aria-hidden />
        <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-dorado ring-4 ring-crema/40">
          <MarchantaAvatar className="size-12" />
        </span>
        <div className="relative flex min-w-0 flex-col">
          <h1 className="font-display text-3xl">{t("titulo")}</h1>
          <p className="text-[13px] text-crema/90">{t("subtitulo")}</p>
        </div>
      </header>

      <p className="bg-dorado-200 px-4 py-1.5 text-center text-[12px] font-semibold text-morado-900" aria-live="polite">
        {restantes === null ? t("limite") : restantes === Infinity ? t("ilimitado") : `${t("limite")} · ${t("restantes", { n: restantes })}`}
      </p>

      <div className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-relevant="additions">
        <ul className="flex flex-col gap-3">
          {mensajes.map((m) => (
            <li key={m.id} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "assistant" && (
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-dorado" aria-hidden>
                  <MarchantaAvatar className="size-7" />
                </span>
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
                {m.respuesta?.fuente === "ia" && (
                  <span className="flex items-center gap-1 text-[11px] text-tinta-2">
                    <Sparkles className="size-3" aria-hidden />
                    {t("fuenteIA")}
                  </span>
                )}
                {m.respuesta?.cards.map((c) => (
                  <TarjetaAsistente key={`${c.tipo}-${c.id}`} c={c} />
                ))}
              </div>
            </li>
          ))}
          {cargando && (
            <li className="flex items-center gap-2 text-sm text-tinta-2" role="status">
              <span className="grid size-8 place-items-center rounded-full bg-dorado" aria-hidden>
                <MarchantaAvatar className="size-7" />
              </span>
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

      <div className="flex flex-col gap-2 border-t border-border bg-crema px-3 pt-2 pb-3">
        {mensajes.length <= 3 && (
          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none]" role="group" aria-label={t("sugerencias")}>
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => void enviar(c)}
                disabled={cargando}
                className="flex min-h-11 shrink-0 items-center rounded-pill border border-morado/40 bg-white px-3.5 text-[13px] font-semibold whitespace-nowrap text-morado-700 hover:bg-morado-50 disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={dictado.escuchando ? t("escuchando") : t("placeholder")}
            aria-label={t("placeholder")}
            maxLength={500}
            enterKeyHint="send"
            className="h-12 min-w-0 flex-1 rounded-pill border border-input bg-white px-4 text-base outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
          {dictado.disponible && (
            <button
              type="button"
              onClick={dictado.alternar}
              aria-label={dictado.escuchando ? t("escuchando") : t("microfono")}
              aria-pressed={dictado.escuchando}
              className={cn("grid size-12 shrink-0 place-items-center rounded-full border", dictado.escuchando ? "animate-pulse border-chile bg-chile text-white" : "border-morado text-morado")}
            >
              {dictado.escuchando ? <MicOff className="size-5" aria-hidden /> : <Mic className="size-5" aria-hidden />}
            </button>
          )}
          <button
            type="submit"
            disabled={!texto.trim() || cargando}
            aria-label={t("enviar")}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <SendHorizontal className="size-5" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
