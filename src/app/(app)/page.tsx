import Link from "next/link";
import { ScreenHeader, EmptyState } from "@/components/layout/screen";

// Feed des dégustations du groupe (le contenu réel arrive en S5-04).
export default function FeedPage() {
  return (
    <>
      <ScreenHeader title="Le feed" subtitle="Ce que le groupe a bu récemment." />
      <EmptyState
        title="Rien à boire ici… pour l'instant"
        hint="Les dégustations du groupe s'afficheront ici."
        action={
          <Link
            href="/scan"
            className="mt-2 flex min-h-12 items-center rounded-lg bg-serigraphie px-5 font-semibold text-alu-fond"
          >
            Scanne ta première cannouche
          </Link>
        }
      />
    </>
  );
}
