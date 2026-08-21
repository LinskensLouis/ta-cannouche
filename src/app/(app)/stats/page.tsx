import { ScreenHeader, EmptyState } from "@/components/layout/screen";

// Suivi de conso et de dépenses (sprint 4).
export default function StatsPage() {
  return (
    <>
      <ScreenHeader title="Mes stats" subtitle="Conso, dépenses, prix au litre." />
      <EmptyState
        title="Pas encore de chiffres"
        hint="Enregistre des dégustations et des achats pour voir tes stats."
      />
    </>
  );
}
