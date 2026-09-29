import { cn } from "@/lib/utils";

/** Avatar de «Marchanta»: marchanta con mandil y canasta. Plano, 3 colores (morado, dorado, crema). */
export function MarchantaAvatar({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-10", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="32" cy="32" r="32" fill="#FEFAEB" />
      {/* chongo y cabello */}
      <circle cx="32" cy="13" r="6" fill="#93408F" />
      <path d="M19 27c0-9 6-14 13-14s13 5 13 14c-3-4-8-6-13-6s-10 2-13 6z" fill="#93408F" />
      {/* cara */}
      <circle cx="32" cy="29" r="10" fill="#C8A96A" />
      <circle cx="28.5" cy="28" r="1.3" fill="#93408F" />
      <circle cx="35.5" cy="28" r="1.3" fill="#93408F" />
      <path d="M28.5 32.5c2 2 5 2 7 0" stroke="#93408F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* cuerpo y mandil */}
      <path d="M14 64c0-14 8-23 18-23s18 9 18 23z" fill="#93408F" />
      <path d="M24 44h16v20H24z" fill="#FEFAEB" />
      <path d="M24 50h16" stroke="#C8A96A" strokeWidth="2" />
      <path d="M24 56h16" stroke="#C8A96A" strokeWidth="2" />
      {/* canasta */}
      <path d="M41 49h14l-2.5 10h-9z" fill="#C8A96A" />
      <path d="M43 49c0-5 10-5 10 0" stroke="#C8A96A" strokeWidth="2" fill="none" />
      <path d="M43.5 53h9M44.5 56h7" stroke="#FEFAEB" strokeWidth="1.2" />
    </svg>
  );
}
