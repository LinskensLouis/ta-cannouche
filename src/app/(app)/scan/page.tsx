import { ScreenHeader, EmptyState } from "@/components/layout/screen";

// Écran de scan du code-barres (S2-01 / S2-02).
export default function ScanPage() {
  return (
    <>
      <ScreenHeader title="Scanner" subtitle="Vise le code-barres d'une canette." />
      <EmptyState
        title="La caméra arrive bientôt"
        hint="Le scan du code-barres est la première tâche du sprint 2."
      />
    </>
  );
}
