import type { ReactNode } from "react";
import { BottomNav } from "@/components/nav/bottom-nav";

// Coquille de l'app authentifiée : contenu défilant + navigation basse fixe.
// Le padding-bottom réserve la place de la barre (64px) et de la safe area iOS.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <main className="min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
