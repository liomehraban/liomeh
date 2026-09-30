"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePhoneContainer } from "@/hooks/usePhoneContainer";

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetContent({
  className,
  children,
  side = "bottom",
  closeLabel,
  container,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  closeLabel?: string;
  container?: HTMLElement | null;
}) {
  const phone = usePhoneContainer();
  const t = useTranslations("comun");
  const panel = React.useRef<HTMLDivElement>(null);
  const cerrar = React.useRef<HTMLButtonElement>(null);
  const arrastre = React.useRef<{ y0: number; t0: number } | null>(null);
  // Arrastrar la manija hacia abajo cierra la hoja (más de 100 px o un tirón rápido); si no, regresa.
  const alBajar = (e: React.PointerEvent) => {
    arrastre.current = { y0: e.clientY, t0: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const alMover = (e: React.PointerEvent) => {
    if (!arrastre.current || !panel.current) return;
    const dy = Math.max(0, e.clientY - arrastre.current.y0);
    panel.current.style.transition = "none";
    panel.current.style.transform = `translateY(${dy}px)`;
  };
  const alSoltar = (e: React.PointerEvent) => {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a || !panel.current) return;
    const dy = Math.max(0, e.clientY - a.y0);
    const rapido = dy / Math.max(1, performance.now() - a.t0) > 0.6;
    panel.current.style.transition = "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)";
    if (dy > 100 || (rapido && dy > 30)) cerrar.current?.click();
    else panel.current.style.transform = "";
  };
  return (
    <SheetPrimitive.Portal container={container ?? phone}>
      <SheetPrimitive.Overlay data-slot="sheet-overlay" className="absolute inset-0 z-50 bg-morado-900/40" />
      <SheetPrimitive.Content
        ref={panel}
        data-slot="sheet-content"
        className={cn(
          "absolute z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-out",
          side === "right" && "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
          side === "top" && "inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "inset-x-0 bottom-0 h-auto max-h-[90%] rounded-t-card border-t pt-2",
          className,
        )}
        {...props}
      >
        {side === "bottom" && (
          <div
            aria-hidden
            onPointerDown={alBajar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
            className="-mt-2 flex h-7 shrink-0 cursor-grab touch-none justify-center pt-2 active:cursor-grabbing"
          >
            <span className="h-1.5 w-12 rounded-pill bg-gris/40" />
          </div>
        )}
        {children}
        <SheetPrimitive.Close
          ref={cerrar}
          aria-label={closeLabel ?? t("cerrar")}
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-pill text-tinta-2 hover:bg-morado-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <XIcon className="size-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 px-5 pr-14", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-xl font-bold text-morado-700", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
