export default function Layout({ children }: { children: React.ReactNode }) {
  return <main id="contenido" className="h-full overflow-y-auto">{children}</main>;
}
