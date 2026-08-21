const COLORS = [
  { token: "alu-fond", hex: "#14171A", usage: "Fond général", bg: "bg-alu-fond" },
  { token: "alu-surface", hex: "#1E2227", usage: "Cartes, feuilles", bg: "bg-alu-surface" },
  { token: "alu-brosse", hex: "#C9CED4", usage: "Texte principal", bg: "bg-alu-brosse" },
  { token: "alu-mat", hex: "#7C848C", usage: "Texte secondaire", bg: "bg-alu-mat" },
  { token: "serigraphie", hex: "#F25C1F", usage: "Accent d'action, unique", bg: "bg-serigraphie" },
  { token: "condensation", hex: "#4FB3A5", usage: "États positifs, statuts", bg: "bg-condensation" },
] as const;

export default function DesignTokensPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="display text-3xl">Ta Cannouche</h1>
        <p className="text-sm text-alu-mat">Jetons de design — S1-02</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="display text-lg">Couleurs</h2>
        <ul className="flex flex-col gap-2">
          {COLORS.map((c) => (
            <li
              key={c.token}
              className="flex items-center gap-3 rounded-lg bg-alu-surface p-3"
            >
              <span
                className={`${c.bg} size-12 shrink-0 rounded-md border border-alu-mat/30`}
                aria-hidden
              />
              <span className="flex flex-col">
                <span className="text-sm">--{c.token}</span>
                <span className="font-mono text-xs text-alu-mat">
                  {c.hex} · {c.usage}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="display text-lg">Polices</h2>

        <div className="flex flex-col gap-1 rounded-lg bg-alu-surface p-4">
          <span className="font-mono text-xs text-alu-mat">Display · Archivo Expanded</span>
          <span className="display text-2xl">La Chouffe Triple</span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-alu-surface p-4">
          <span className="font-mono text-xs text-alu-mat">Texte · Public Sans</span>
          <span className="font-sans text-base">
            Une bière blonde équilibrée, notes d&apos;agrumes et finale sèche.
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-alu-surface p-4">
          <span className="font-mono text-xs text-alu-mat">Données · IBM Plex Mono</span>
          <span className="font-mono text-base tabular-nums">
            4,5/5 · 2,30 € · 4,60 €/L · 21/08/2026
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="display text-lg">Accent</h2>
        <button
          type="button"
          className="min-h-12 rounded-lg bg-serigraphie px-4 font-sans text-base font-semibold text-alu-fond"
        >
          Enregistrer la dégustation
        </button>
        <p className="text-sm text-condensation">Synchro réussie · vue il y a 3 jours</p>
      </section>
    </main>
  );
}
