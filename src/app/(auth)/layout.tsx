import type { ReactNode } from "react";

// Écrans d'authentification : colonne centrée, plein écran, safe areas respectées.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-6 pb-[env(safe-area-inset-bottom)] pt-10">
      {children}
    </div>
  );
}
