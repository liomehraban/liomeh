/** Intérprete del guion (docs/06_demo.md) sobre el DOM real. Solo cliente. */
import type { Locale } from "@/i18n/routing";
import type { AccionDemo, PasoDemo } from "@/lib/presentacion";

export type Entorno = {
  navegar: (ruta: string, locale: Locale) => void;
  /** Mueve el dedo al elemento; `tocar` dibuja el toque. Resuelve cuando termina la animación. */
  dedo: (el: Element, tocar: boolean) => Promise<void>;
  vivo: () => boolean;
  reducido: boolean;
};

export class Cancelado extends Error {}

const TIMEOUT = 12_000;
const esc = (s: string) => s.replace(/(["\\])/g, "\\$1");

function buscar(demo: string, dentro?: string): HTMLElement | null {
  const raiz: ParentNode | null = dentro ? document.querySelector(`[data-demo="${esc(dentro)}"]`) : document;
  if (!raiz) return null;
  const todos = [...raiz.querySelectorAll<HTMLElement>(`[data-demo="${esc(demo)}"]`)];
  // el primero visible y habilitado
  return todos.find((el) => el.getClientRects().length > 0 && !(el as HTMLButtonElement).disabled) ?? null;
}

async function pausa(ms: number, e: Entorno) {
  await new Promise((r) => setTimeout(r, e.reducido ? Math.min(ms, 250) : ms));
  if (!e.vivo()) throw new Cancelado();
}

async function esperar<T>(fn: () => T | null | false, e: Entorno, que: string): Promise<T> {
  const fin = Date.now() + TIMEOUT;
  for (;;) {
    const v = fn();
    if (v) return v;
    if (!e.vivo()) throw new Cancelado();
    if (Date.now() > fin) throw new Error(`presentación: no apareció ${que}`);
    await new Promise((r) => setTimeout(r, 100));
  }
}

async function enfocar(el: HTMLElement, e: Entorno) {
  el.scrollIntoView({ block: "center", behavior: e.reducido ? "auto" : "smooth" });
  await pausa(350, e);
}

function tocar(el: HTMLElement) {
  const o = { bubbles: true, cancelable: true, button: 0 };
  el.dispatchEvent(new PointerEvent("pointerdown", { ...o, pointerType: "mouse" }));
  el.dispatchEvent(new MouseEvent("mousedown", o));
  el.dispatchEvent(new PointerEvent("pointerup", { ...o, pointerType: "mouse" }));
  el.dispatchEvent(new MouseEvent("mouseup", o));
  el.click();
}

/** Cambia el valor de un input controlado por React disparando el evento que React escucha. */
function fijarValor(el: HTMLInputElement, valor: string) {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set;
  setter?.call(el, valor);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

async function accion(a: AccionDemo, locale: Locale, e: Entorno) {
  switch (a.tipo) {
    case "ir": {
      e.navegar(a.ruta, locale);
      const destino = `/${locale}${a.ruta.split("?")[0]}`;
      await esperar(() => window.location.pathname === destino, e, destino);
      await pausa(500, e);
      return;
    }
    case "esperar":
      return pausa(a.ms, e);
    case "esperarRuta":
      await esperar(() => window.location.pathname.includes(a.contiene), e, a.contiene);
      return pausa(600, e);
    case "esperarElemento":
      await esperar(() => buscar(a.demo), e, a.demo);
      return;
    case "senalar": {
      const el = await esperar(() => buscar(a.demo), e, a.demo);
      await enfocar(el, e);
      await e.dedo(el, false);
      return pausa(700, e);
    }
    case "clic": {
      const el = await esperar(() => buscar(a.demo, a.dentro), e, a.demo);
      await enfocar(el, e);
      await e.dedo(el, true);
      tocar(el);
      return pausa(450, e);
    }
    case "clicMientras": {
      for (let i = 0; i < a.max; i++) {
        const el = buscar(a.demo);
        if (!el) return;
        await e.dedo(el, true);
        tocar(el);
        await pausa(1100, e);
      }
      return;
    }
    case "escribir": {
      const el = (await esperar(() => buscar(a.demo), e, a.demo)) as HTMLInputElement;
      await enfocar(el, e);
      await e.dedo(el, true);
      el.focus();
      if (e.reducido) fijarValor(el, a.texto);
      else for (let i = 1; i <= a.texto.length; i++) {
        fijarValor(el, a.texto.slice(0, i));
        await pausa(55, e);
      }
      await pausa(300, e);
      if (a.enviar) el.form?.requestSubmit();
      return pausa(400, e);
    }
  }
}

export async function ejecutarPaso(paso: PasoDemo, e: Entorno) {
  for (const a of paso.acciones) await accion(a, paso.locale, e);
}
