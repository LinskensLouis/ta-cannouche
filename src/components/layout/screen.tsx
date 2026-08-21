import type { ReactNode } from "react";

// En-tête d'écran : titre display + sous-titre optionnel. Contexte en haut,
// actions primaires en bas (SPECS §3.2).
export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex flex-col gap-1 px-5 pt-8 pb-4">
      <h1 className="display text-2xl">{title}</h1>
      {subtitle && <p className="text-sm text-alu-mat">{subtitle}</p>}
    </header>
  );
}

// État vide : une invitation, pas une excuse (SPECS §3.5).
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
      <p className="display text-lg text-alu-brosse">{title}</p>
      {hint && <p className="text-sm text-alu-mat">{hint}</p>}
      {action}
    </div>
  );
}
