// Génère les icônes PWA à partir d'un motif « languette de canette » (SVG),
// rastérisé en PNG par sharp. Régénérer : `node scripts/generate-icons.mjs`.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const FOND = "#14171A";
const ORANGE = "#F25C1F";
const OUT = "public/icons";
mkdirSync(OUT, { recursive: true });

// Motif languette : anneau (le trou du doigt) + rivet, en orange.
// `scale` réduit le motif pour la version maskable (zone de sécurité).
function svg({ rounded, scale = 1 }) {
  const bg = rounded
    ? `<rect width="512" height="512" rx="112" fill="${FOND}"/>`
    : `<rect width="512" height="512" fill="${FOND}"/>`;
  const s = scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${bg}
    <g transform="translate(256 256) scale(${s}) translate(-256 -256)" fill="none">
      <rect x="196" y="150" width="120" height="250" rx="60" fill="none" stroke="${ORANGE}" stroke-width="34"/>
      <ellipse cx="256" cy="235" rx="52" ry="70" fill="${FOND}" stroke="${ORANGE}" stroke-width="26"/>
      <circle cx="256" cy="372" r="24" fill="${ORANGE}"/>
    </g>
  </svg>`;
}

async function png(name, size, opts) {
  await sharp(Buffer.from(svg(opts)))
    .resize(size, size)
    .png()
    .toFile(`${OUT}/${name}`);
  console.log(`✓ ${name} (${size}px)`);
}

await png("icon-192.png", 192, { rounded: true });
await png("icon-512.png", 512, { rounded: true });
await png("icon-maskable-512.png", 512, { rounded: false, scale: 0.7 });
await png("apple-touch-icon.png", 180, { rounded: false });
