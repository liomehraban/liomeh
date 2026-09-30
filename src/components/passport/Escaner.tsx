"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Info, Search, Store, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { EncabezadoSimple } from "@/components/cart/EncabezadoSimple";
import type { ObjetivoCheckin } from "@/data/pasaporte";
import { evaluarInsignias, type ContextoInsignias } from "@/lib/loyalty";
import type { Lealtad } from "@/lib/schemas";
import { normalizar } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

type Resultado = { tipo: "ok"; puntos: number; selloNuevo: boolean; nombre: string; mercado: string } | { tipo: "yaHoy"; nombre: string };

const ESPERA_MS = 2000;

/** M9 · Escanear QR del puesto: cámara simulada, detección a los 2 s, +10 (1 por puesto al día) y sello si es mercado nuevo. */
export function Escaner({ objetivos, ctx, insignias }: { objetivos: ObjetivoCheckin[]; ctx: ContextoInsignias; insignias: Lealtad["insignias"] }) {
  const t = useTranslations("escanear");
  const tp = useTranslations("pasaporte");
  const params = useSearchParams();
  const hacerCheckin = useAppStore((s) => s.hacerCheckin);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(() => {
    const p = params.get("puesto");
    return p && objetivos.some((o) => o.objetivo === p) ? p : null;
  });
  const [fase, setFase] = useState<"listo" | "escaneando" | "resultado">("listo");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const filtrados = useMemo(() => {
    const n = normalizar(q);
    return n ? objetivos.filter((o) => normalizar(`${o.nombre} ${o.mercadoNombre}`).includes(n)) : objetivos;
  }, [objetivos, q]);
  const objetivo = objetivos.find((o) => o.objetivo === sel);

  const insigniasDe = () => {
    const s = useAppStore.getState();
    const huertos = s.pedidos.flatMap((p) => p.items.map((i) => i.huertoId).filter((h): h is string => !!h));
    return new Set([...s.insignias, ...evaluarInsignias({ sellos: s.sellos, checkins: s.checkins ?? [], huertosComprados: huertos }, ctx)]);
  };

  const escanear = () => {
    if (!objetivo) return;
    setFase("escaneando");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const antes = insigniasDe();
      const r = hacerCheckin(objetivo.objetivo, objetivo.mercadoId);
      const nombre = objetivo.tipo === "mostrador" ? t("mostrador", { mercado: objetivo.mercadoNombre }) : objetivo.nombre;
      if (!r.ok) {
        setResultado({ tipo: "yaHoy", nombre });
        toast(t("yaHoy", { nombre }));
      } else {
        setResultado({ tipo: "ok", puntos: r.puntos, selloNuevo: r.selloNuevo, nombre, mercado: objetivo.mercadoNombre });
        navigator.vibrate?.(60);
        toast.success(t("ok", { n: r.puntos }));
        const nuevas = [...insigniasDe()].filter((i) => !antes.has(i));
        nuevas.forEach((id) => toast.success(t("insignia", { nombre: insignias.find((x) => x.id === id)?.nombre ?? id })));
      }
      setFase("resultado");
    }, ESPERA_MS);
  };

  return (
    <div className="flex min-h-full flex-col">
      <EncabezadoSimple titulo={t("titulo")} fallback="/yo" />
      <div className="flex flex-col gap-4 p-5">
        {/* Cámara simulada */}
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-card bg-morado-900" aria-label={t("camara")} role="img">
          <motion.div
            className="relative size-3/5"
            animate={fase === "escaneando" ? { scale: [1, 0.94, 1] } : { scale: 1 }}
            transition={{ duration: 0.9, repeat: fase === "escaneando" ? Infinity : 0 }}
          >
            {["top-0 left-0 border-t-4 border-l-4", "top-0 right-0 border-t-4 border-r-4", "bottom-0 left-0 border-b-4 border-l-4", "right-0 bottom-0 border-r-4 border-b-4"].map((c) => (
              <span key={c} className={cn("absolute size-10 rounded-sm border-dorado", c)} />
            ))}
            {fase === "escaneando" && (
              <motion.span
                className="absolute inset-x-2 h-0.5 bg-dorado shadow-[0_0_12px_#F2B01E]"
                animate={{ top: ["8%", "92%", "8%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            {fase === "resultado" && resultado && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 grid place-items-center">
                {resultado.tipo === "ok" ? <CheckCircle2 className="size-20 text-nopal-700" aria-hidden /> : <XCircle className="size-20 text-cempasuchil" aria-hidden />}
              </motion.div>
            )}
          </motion.div>
          <p className="absolute bottom-3 text-sm font-semibold text-crema" aria-live="polite">
            {fase === "escaneando" ? t("escaneando") : fase === "resultado" && resultado ? t("detectado", { nombre: resultado.nombre }) : t("apunta")}
          </p>
        </div>

        <p className="flex items-center gap-2 rounded-2xl bg-dorado-200/60 p-3 text-sm font-semibold">
          <Info className="size-4 shrink-0 text-morado" aria-hidden />
          {tp("escanearTexto")}
        </p>

        {fase === "resultado" && resultado ? (
          <div className="flex flex-col gap-3" role="status">
            {resultado.tipo === "ok" ? (
              <div className="rounded-card bg-nopal-700 p-4 text-center text-white">
                <p className="font-display text-4xl">+{resultado.puntos}</p>
                <p>{t("ok", { n: resultado.puntos })}</p>
                {resultado.selloNuevo && <p className="mt-1 font-bold">{t("selloNuevo", { mercado: resultado.mercado })}</p>}
              </div>
            ) : (
              <div className="rounded-card bg-cempasuchil p-4 text-center font-semibold text-morado-900">{t("yaHoy", { nombre: resultado.nombre })}</div>
            )}
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={() => setFase("listo")}>
                {t("otra")}
              </Button>
              <Button asChild>
                <Link href="/yo">{t("volverYo")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <fieldset className="flex min-w-0 flex-col gap-2" disabled={fase === "escaneando"}>
              <legend className="mb-1 text-sm text-tinta-2">{t("demo")}</legend>
              <label className="flex h-12 items-center gap-2 rounded-pill border border-border bg-white px-4 focus-within:ring-[3px] focus-within:ring-ring/40">
                <Search className="size-5 text-morado" aria-hidden />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("buscar")} aria-label={t("buscar")} className="min-w-0 flex-1 bg-transparent outline-none" />
              </label>
              <ul role="radiogroup" aria-label={t("elige")} className="flex max-h-60 flex-col gap-1 overflow-y-auto rounded-2xl border border-border bg-white p-1">
                {filtrados.map((o) => (
                  <li key={o.objetivo}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={sel === o.objetivo}
                      onClick={() => setSel(o.objetivo)}
                      className={cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-sm", sel === o.objetivo ? "bg-morado text-crema" : "hover:bg-morado-50")}
                    >
                      <Store className="size-4 shrink-0" aria-hidden />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold">{o.tipo === "mostrador" ? t("mostrador", { mercado: o.nombre }) : o.nombre}</span>
                        {o.tipo === "puesto" && <span className={cn("truncate text-[12px]", sel === o.objetivo ? "text-crema/80" : "text-tinta-2")}>{o.mercadoNombre}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </fieldset>
            <Button size="lg" onClick={escanear} disabled={!objetivo || fase === "escaneando"} data-demo="escanear">
              {fase === "escaneando" ? t("escaneando") : t("titulo")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
