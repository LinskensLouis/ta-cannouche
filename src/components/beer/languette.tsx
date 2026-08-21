// Languette de canette stylisée — élément signature (SPECS §3.5). Silhouette
// pleine (couleur héritée via `currentColor`) avec un trou évidé sur le fond.
// `holeColor` doit correspondre au fond de la puce pour « percer » le trou.
export function Languette({
  width = 14,
  holeColor = "var(--color-alu-fond)",
  className,
}: {
  width?: number;
  holeColor?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={width * 1.25}
      className={className}
      aria-hidden
    >
      <rect x="7" y="2" width="10" height="20" rx="5" fill="currentColor" />
      <ellipse cx="12" cy="8" rx="2.6" ry="3.4" fill={holeColor} />
    </svg>
  );
}
