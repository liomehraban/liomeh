import { AppShell } from "@/components/shell/AppShell";
import { CartFab } from "@/components/shell/CartFab";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell perfil="consumidor" extra={<CartFab />}>
      {children}
    </AppShell>
  );
}
