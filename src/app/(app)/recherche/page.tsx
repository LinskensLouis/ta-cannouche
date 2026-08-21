import { ScreenHeader, EmptyState } from "@/components/layout/screen";

// Recherche de canettes par nom (S2-06).
export default function RecherchePage() {
  return (
    <>
      <ScreenHeader title="Recherche" subtitle="Retrouve une canette par son nom." />
      <EmptyState
        title="Cherche une canette"
        hint="La recherche dans le référentiel arrive au sprint 2."
      />
    </>
  );
}
