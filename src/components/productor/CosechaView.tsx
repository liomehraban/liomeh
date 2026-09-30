"use client";

import { useMemo, useState } from "react";
import { Camera, PackagePlus, Sprout } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EncabezadoPerfil } from "@/components/locatario/EncabezadoPerfil";
import { reducirFoto } from "@/components/resenas/foto";
import { fmtDia } from "@/components/ui/dialogo-reserva";
import { proximosDias } from "@/lib/huertos";
import { formatMXN } from "@/lib/money";
import { difPrecio } from "@/lib/productor";
import type { Productor } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useAppStore, useHydrated, type Lote } from "@/store/useAppStore";

const UNIDADES = ["piezas", "kg", "manojos", "caja", "ciento"];
/** «Lechuga orejona (pieza)» → producto y unidad. */
const partir = (c: string) => {
  const m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(c);
  return m ? { producto: m[1], unidad: m[2] } : { producto: c, unidad: "kg" };
};

function TarjetaLote({ l, productor, nuevo }: { l: Omit<Lote, "id">; productor: Productor; nuevo?: boolean }) {
  const t = useTranslations("productor.cosecha");
  const locale = useLocale();
  return (
    <article className="flex gap-3 rounded-card border border-border bg-white p-3">
      {l.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={l.fotoUrl} alt="" className="size-16 shrink-0 rounded-2xl object-cover" />
      ) : (
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-nopal text-crema" aria-hidden>
          <Sprout className="size-7" />
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 font-bold text-morado-700">
          {l.producto || "—"}
          {nuevo && <span className="rounded-pill bg-dorado px-2 text-[11px] text-morado-900">{t("nuevo")}</span>}
        </span>
        <span className="text-sm">
          {l.cantidad} {l.unidad} · <strong>{formatMXN(l.precio || 0, locale)}</strong>/{l.unidad.replace(/s$/, "")}
        </span>
        <span className="text-[12px] text-tinta-2">
          {productor.nombre} · {productor.pueblo}
        </span>
        {l.disponible && <span className="text-[12px] font-semibold text-nopal">{t("disponible", { fecha: fmtDia(l.disponible, locale, { weekday: "short", day: "numeric", month: "short" }) })}</span>}
      </div>
    </article>
  );
}

/** M17 · Productor › Cosecha: lotes activos, «Publicar cosecha» y vista previa. */
export function CosechaView({ productor, nombre }: { productor: Productor; nombre: string }) {
  const t = useTranslations("productor.cosecha");
  const tp = useTranslations("productor");
  const locale = useLocale();
  const hydrated = useHydrated();
  const lotes = useAppStore((s) => s.productor.lotes);
  const publicar = useAppStore((s) => s.publicarLote);
  const dias = useMemo(() => proximosDias(14), []);
  const opciones = productor.catalogo.map(partir);
  const [form, setForm] = useState<Omit<Lote, "id" | "publicado">>({ producto: opciones[0]?.producto ?? "", cantidad: 0, unidad: "piezas", precio: 0, disponible: dias[0] });

  // Referencia: el último lote del mismo producto, o el precio de mayoreo del producto principal.
  const referencia = lotes.find((l) => l.producto === form.producto)?.precio ?? productor.precio_mayoreo_app.precio;
  const dif = form.precio ? difPrecio(form.precio, referencia) : 0;
  const valido = form.producto && form.cantidad > 0 && form.precio > 0;

  const enviar = () => {
    if (!valido) return;
    publicar(form);
    toast.success(t("publicado", { cantidad: form.cantidad, unidad: form.unidad, producto: form.producto }));
    setForm({ ...form, cantidad: 0, precio: 0, fotoUrl: undefined });
  };

  return (
    <div className="flex flex-col">
      <EncabezadoPerfil titulo={tp("hola", { nombre })} subtitulo={`${productor.nombre} · ${t("mayoreo")}`} />
      <div className="flex flex-col gap-5 p-5">
        <section aria-labelledby="publicar" className="flex flex-col gap-3 rounded-card border border-border bg-white p-4">
          <h2 id="publicar" className="flex items-center gap-2 text-xl font-bold text-morado-700">
            <PackagePlus className="size-5" aria-hidden />
            {t("publicar")}
          </h2>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t("producto")}
            <select
              value={form.producto}
              onChange={(e) => {
                const o = opciones.find((x) => x.producto === e.target.value);
                setForm({ ...form, producto: e.target.value, unidad: o ? (o.unidad === "pieza" ? "piezas" : o.unidad === "manojo" ? "manojos" : o.unidad) : form.unidad });
              }}
              className="h-12 rounded-pill border border-input bg-white px-4 font-normal"
            >
              {opciones.map((o) => (
                <option key={o.producto}>{o.producto}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t("cantidad")}
              <Input data-demo="lote-cantidad" type="number" inputMode="numeric" min={1} value={form.cantidad || ""} onChange={(e) => setForm({ ...form, cantidad: Math.max(0, Math.round(Number(e.target.value))) })} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              {t("unidad")}
              <select value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} className="h-12 rounded-pill border border-input bg-white px-4 font-normal">
                {[...new Set([form.unidad, ...UNIDADES])].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t("precio")}
            <Input data-demo="lote-precio" type="number" inputMode="numeric" min={1} value={form.precio || ""} onChange={(e) => setForm({ ...form, precio: Math.max(0, Math.round(Number(e.target.value))) })} />
            <span className={cn("text-[13px] font-normal", dif > 15 ? "text-chile" : dif < -15 ? "text-cempasuchil" : "text-tinta-2")}>
              {t("referencia", { precio: formatMXN(referencia, locale), unidad: form.unidad.replace(/s$/, ""), dif: dif > 0 ? `+${dif}` : dif })}
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t("fecha")}
            <select value={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.value })} className="h-12 rounded-pill border border-input bg-white px-4 font-normal">
              {dias.map((d) => (
                <option key={d} value={d}>
                  {fmtDia(d, locale, { weekday: "long", day: "numeric", month: "long" })}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-pill border border-dashed border-nopal px-4 text-sm font-semibold text-nopal focus-within:ring-[3px] focus-within:ring-ring/50">
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
          <div className="flex flex-col gap-1.5 rounded-2xl bg-papel p-3" aria-live="polite">
            <span className="text-[13px] font-bold text-tinta-2">{t("vistaPrevia")}</span>
            <TarjetaLote l={form} productor={productor} nuevo />
          </div>
          <Button onClick={enviar} disabled={!valido} className="bg-nopal hover:bg-nopal/90" data-demo="publicar-lote">
            {t("publicar")}
          </Button>
        </section>

        <section aria-labelledby="lotes" className="flex flex-col gap-2">
          <h2 id="lotes" className="text-xl font-bold text-morado-700">
            {t("lotes")}
          </h2>
          {hydrated && lotes.length === 0 && <p className="text-tinta-2">{t("sinLotes")}</p>}
          {hydrated && lotes.map((l) => <TarjetaLote key={l.id} l={l} productor={productor} nuevo={!!l.publicado} />)}
        </section>
      </div>
    </div>
  );
}
