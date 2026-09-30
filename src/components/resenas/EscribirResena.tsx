"use client";

import { useState } from "react";
import { Camera, PenLine, Star, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MIN_CARACTERES_RESENA, resenaValida } from "@/lib/resenas";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { reducirFoto } from "./foto";

/** «Escribir reseña»: estrellas, texto (mín. 20) y foto local opcional. +15 puntos con foto, la primera vez. */
export function EscribirResena({ objetivoId }: { objetivoId: string }) {
  const t = useTranslations("resenas");
  const locale = useLocale() as "es" | "en";
  const escribir = useAppStore((s) => s.escribirResena);
  const [abierto, setAbierto] = useState(false);
  const [estrellas, setEstrellas] = useState(0);
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const valida = resenaValida({ estrellas, texto });

  const publicar = () => {
    if (!valida) return;
    const r = escribir({ objetivo_id: objetivoId, estrellas, texto: texto.trim(), idioma: locale, fotoUrl: foto });
    toast.success(r.editada ? t("editada") : r.puntos ? t("publicada", { puntos: r.puntos }) : t("publicadaSinPuntos"));
    setAbierto(false);
    setEstrellas(0);
    setTexto("");
    setFoto(undefined);
  };

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="w-full">
          <PenLine aria-hidden />
          {t("escribir")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("tuResena")}</DialogTitle>
        </DialogHeader>
        <div role="radiogroup" aria-label={t("estrellas")} className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={estrellas === n}
              aria-label={t("estrella", { n })}
              onClick={() => setEstrellas(n)}
              className="grid size-11 place-items-center rounded-pill focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <Star className={cn("size-8", n <= estrellas ? "fill-dorado text-dorado" : "text-gris/50")} aria-hidden />
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t("texto")}
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            maxLength={600}
            className="rounded-2xl border border-input bg-white p-3 text-base font-normal outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
          <span className={cn("text-[13px] font-normal", texto.trim().length >= MIN_CARACTERES_RESENA ? "text-nopal-700" : "text-tinta-2")}>
            {t("minimo", { n: MIN_CARACTERES_RESENA, actual: texto.trim().length })}
          </span>
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{t("foto")}</span>
          {foto ? (
            <div className="relative w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" className="h-28 rounded-2xl object-cover" />
              <button type="button" onClick={() => setFoto(undefined)} aria-label={t("quitarFoto")} className="absolute -top-2 -right-2 grid size-9 place-items-center rounded-full bg-tinta text-white">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-pill border border-dashed border-morado px-4 text-sm font-semibold text-morado focus-within:ring-[3px] focus-within:ring-ring/50">
              <Camera className="size-4" aria-hidden />
              {t("foto")}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setFoto(await reducirFoto(f));
                }}
              />
            </label>
          )}
        </div>
        <Button onClick={publicar} disabled={!valida}>
          {t("publicar")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
