"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/** Web Share API con fallback a copiar el link. */
export function BotonCompartir({ titulo, texto, className }: { titulo: string; texto?: string; className?: string }) {
  const t = useTranslations("mercado");
  const compartir = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const i = document.createElement("textarea");
      i.value = url;
      document.body.appendChild(i);
      i.select();
      document.execCommand("copy");
      i.remove();
    }
    toast.success(t("linkCopiado"));
  };
  return (
    <button
      type="button"
      onClick={compartir}
      aria-label={t("compartir")}
      className={cn(
        "grid size-11 place-items-center rounded-pill bg-white text-morado shadow-md hover:bg-crema focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <Share2 className="size-5" aria-hidden />
    </button>
  );
}
