import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex shrink-0 items-center justify-center gap-2 rounded-pill text-center text-base leading-tight text-balance font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:text-tinta-2 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // Deshabilitado: fondo neutro con texto tinta-2 (AA ≥ 7:1), nunca un color de marca desvanecido.
        default: "bg-primary text-primary-foreground hover:bg-morado-700 disabled:bg-[color-mix(in_oklab,var(--color-gris)_22%,white)]",
        secondary: "border-2 border-primary bg-transparent text-primary hover:bg-morado-50 disabled:border-gris/40 disabled:bg-[color-mix(in_oklab,var(--color-gris)_10%,white)]",
        premium: "bg-dorado text-morado-900 hover:bg-dorado/90 disabled:bg-[color-mix(in_oklab,var(--color-gris)_22%,white)]",
        ghost: "text-primary hover:bg-morado-50 disabled:bg-transparent",
        destructive: "bg-destructive text-white hover:bg-destructive/90 disabled:bg-[color-mix(in_oklab,var(--color-gris)_22%,white)]",
        link: "text-primary underline-offset-4 hover:underline disabled:no-underline",
      },
      size: {
        default: "min-h-12 px-6 py-2 max-[374px]:px-4 max-[374px]:text-[15px]",
        sm: "min-h-11 px-4 py-1.5 text-sm",
        lg: "min-h-14 px-6 py-2 text-lg max-[374px]:px-4 max-[374px]:text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
