"use client";

import { useState } from "react";
import { Camera, Crown, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useVocabulario } from "@/hooks/useVocabulario";
import { Link } from "@/i18n/navigation";
import { reducirFoto } from "@/components/resenas/foto";
import { catalogoEfectivo, LIMITE_CATALOGO_GRATIS } from "@/lib/locatario";
import { formatMXN } from "@/lib/money";
import type { Producto } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated } from "@/store/useAppStore";
import { EncabezadoPerfil } from "./EncabezadoPerfil";

/** M15 · Locatario › Catálogo: precio y disponibilidad en línea, alta de productos y límite de 20 en Gratis. */
export function CatalogoView({ base, productores }: { base: Producto[]; productores: { id: string; nombre: string }[] }) {
  const t = useTranslations("locatario.catalogo");
  const voc = useVocabulario();
  const locale = useLocale();
  const hydrated = useHydrated();
  const extra = useAppStore((s) => s.locatario.catalogoExtra);
  const ediciones = useAppStore((s) => s.locatario.ediciones);
  const plan = useAppStore((s) => s.locatario.plan) ?? "Gratis";
  const editar = useAppStore((s) => s.editarProducto);
  const agregar = useAppStore((s) => s.agregarProductoLocatario);
  const lista = catalogoEfectivo(base, hydrated ? extra : [], hydrated ? ediciones : {});

  const [abierto, setAbierto] = useState(false);
  const [upsell, setUpsell] = useState(false);
  const [form, setForm] = useState({ n: "", p: "", u: "pieza", origen: "", fotoUrl: "" as string | undefined });

  const abrir = () => (plan === "Gratis" && lista.length >= LIMITE_CATALOGO_GRATIS ? setUpsell(true) : setAbierto(true));
  const guardar = () => {
    const precio = Math.round(Number(form.p));
    if (!form.n.trim() || !precio) return;
    const ok = agregar({ n: form.n.trim(), p: precio, u: form.u.trim() || "pieza", origen: form.origen || undefined, fotoUrl: form.fotoUrl || undefined, disponible: true }, lista.length);
    if (!ok) {
      setAbierto(false);
      setUpsell(true);
      return;
    }
    toast.success(t("agregado", { producto: form.n.trim() }));
    setForm({ n: "", p: "", u: "pieza", origen: "", fotoUrl: "" });
    setAbierto(false);
  };

  return (
    <div className="flex flex-col">
      <EncabezadoPerfil titulo={t("titulo")} subtitulo={`${t("total", { n: lista.length })}${plan === "Gratis" ? ` · ${t("limite", { n: LIMITE_CATALOGO_GRATIS })}` : ""}`} />
      <div className="flex flex-col gap-3 p-5">
        <Button onClick={abrir}>
          <Plus aria-hidden />
          {t("agregar")}
        </Button>
        <ul className="flex flex-col gap-2">
          {lista.map((x) => (
            <li key={x.n} className={cn("flex items-center gap-3 rounded-2xl border border-border bg-white p-3", !x.disponible && "opacity-60")}>
              {x.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={x.fotoUrl} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">{x.n}</span>
                <span className="text-[12px] text-tinta-2">
                  / {voc("unidades", x.u)}
                  {x.origen ? ` · ${x.origen}` : ""}
                  {!x.disponible ? ` · ${t("agotado")}` : ""}
                </span>
              </div>
              <label className="flex items-center gap-1 text-sm font-semibold">
                $
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={x.p}
                  aria-label={t("precio", { producto: x.n })}
                  onChange={(e) => {
                    const v = Math.round(Number(e.target.value));
                    if (v > 0) editar(x.n, { p: v });
                  }}
                  className="h-11 w-20 rounded-xl border border-input bg-white px-2 text-right"
                />
              </label>
              <Switch checked={x.disponible} onCheckedChange={(v) => editar(x.n, { disponible: v })} aria-label={t("disponible", { producto: x.n })} />
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[88%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("agregar")}</DialogTitle>
          </DialogHeader>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t("nombre")}
            <Input value={form.n} onChange={(e) => setForm({ ...form, n: e.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t("precio", { producto: "" }).trim()}
              <Input type="number" inputMode="numeric" min={1} value={form.p} onChange={(e) => setForm({ ...form, p: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t("unidad")}
              <Input value={form.u} onChange={(e) => setForm({ ...form, u: e.target.value })} />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t("origen")}
            <select value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} className="h-12 rounded-pill border border-input bg-white px-4 font-normal">
              <option value="">{t("origenNinguno")}</option>
              {productores.map((p) => (
                <option key={p.id} value={p.nombre}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-pill border border-dashed border-morado px-4 text-sm font-semibold text-morado focus-within:ring-[3px] focus-within:ring-ring/50">
            <Camera className="size-4" aria-hidden />
            {t("foto")}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setForm({ ...form, fotoUrl: await reducirFoto(f) });
              }}
            />
          </label>
          {form.fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.fotoUrl} alt="" className="h-24 w-fit rounded-2xl object-cover" />
          )}
          {form.p && <p className="text-sm text-tinta-2">{formatMXN(Math.round(Number(form.p)) || 0, locale)} / {form.u}</p>}
          <Button onClick={guardar} disabled={!form.n.trim() || !(Number(form.p) > 0)}>
            {t("guardar")}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={upsell} onOpenChange={setUpsell}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="size-5 text-dorado" aria-hidden />
              {t("upsellTitulo")}
            </DialogTitle>
            <DialogDescription>{t("upsellTexto")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild variant="premium">
              <Link href="/locatario/plan">{t("verPlan")}</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
