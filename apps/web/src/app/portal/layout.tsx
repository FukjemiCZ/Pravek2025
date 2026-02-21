import { auth0 } from "@/lib/auth0";
import AppShell from "@/app/app-shell";
import { ReactNode } from "react";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <AppShell menuType="race">
        <div style={{ padding: "2rem" }}>
          <h2>Pro přístup do portálu je nutné přihlášení.</h2>
          <a href="/auth/login">Přihlásit se</a>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell menuType="race"> 
      {children}
    </AppShell>
  );
}
