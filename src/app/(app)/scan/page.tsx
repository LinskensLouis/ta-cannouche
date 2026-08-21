import { ScreenHeader } from "@/components/layout/screen";
import { Scanner } from "./scanner";

// Écran de scan (S2-01 / S2-02) : caméra plein cadre, cadre de visée, et
// saisie manuelle en filet de sécurité (permission refusée ou appareil sans
// caméra). Une fois le code lu, on résout vers la fiche ou la création.
export default function ScanPage() {
  return (
    <>
      <ScreenHeader title="Scanner" subtitle="Vise le code-barres d'une canette." />
      <Scanner />
    </>
  );
}
