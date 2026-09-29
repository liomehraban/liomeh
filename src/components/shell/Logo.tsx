import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return <span className={cn("font-display text-5xl text-crema", className)}>Pásele</span>;
}
