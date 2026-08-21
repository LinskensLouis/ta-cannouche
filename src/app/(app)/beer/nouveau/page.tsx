import { ScreenHeader } from "@/components/layout/screen";
import { BeerForm, type BeerPrefill } from "@/components/beer/beer-form";
import type { FormatMl } from "@/types/db";

const FORMATS: FormatMl[] = ["250", "330", "440", "500"];

// Création d'une canette à la main (S2-05). Pré-remplie depuis OFF quand le code
// a été trouvé sans format sûr, ou vierge (hors code-barres) sinon.
export default async function NouvelleBierePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawFormat = first(sp.format);

  const prefill: BeerPrefill = {
    barcode: first(sp.barcode),
    name: first(sp.name),
    brand: first(sp.brand),
    abv: first(sp.abv),
    image: first(sp.image),
    source: first(sp.source) ?? "manual",
    format: FORMATS.includes(rawFormat as FormatMl) ? (rawFormat as FormatMl) : undefined,
  };

  return (
    <>
      <ScreenHeader
        title="Nouvelle canette"
        subtitle={prefill.name ? "Complète la fiche." : "Ajoute une canette absente du catalogue."}
      />
      <BeerForm prefill={prefill} />
    </>
  );
}
