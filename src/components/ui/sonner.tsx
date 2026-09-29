"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "!rounded-card !border-morado-50 !bg-crema !text-tinta !font-sans",
          description: "!text-tinta-2",
          actionButton: "!rounded-pill !bg-morado !text-crema !font-semibold !h-8 !px-3",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
