import type { Metadata, Viewport } from "next";
import { Archivo, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Display — CLAUDE.md §4.4 demande « Archivo Expanded ». Sur Google Fonts, ce
// n'est pas une famille distincte : c'est la variable font Archivo avec un axe
// de largeur `wdth`. On charge cet axe ici ; la largeur « expanded » est appliquée
// en CSS via `font-stretch` (voir globals.css, utilitaire .display).
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

// Texte courant.
const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

// Chiffres, prix, dates. IBM Plex Mono n'est pas une variable font : poids
// explicites. On ne charge que 400 (défaut) et 600 (semibold), seules graisses
// utilisées — le 500 était chargé pour rien.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Ta Cannouche",
  description: "Carnet de dégustation de canettes, suivi de budget et repérage en rayon.",
  // App privée : pas d'indexation par les moteurs de recherche.
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  applicationName: "Ta Cannouche",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cannouche",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    // iOS lit encore cette balise historique pour ouvrir la PWA en plein écran ;
    // Next ne génère que la version standardisée `mobile-web-app-capable`.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `cover` est requis pour que `env(safe-area-inset-*)` renvoie autre chose que 0
  // sur iPhone. Nécessaire à la barre de navigation basse (S1-08).
  viewportFit: "cover",
  // Fond sombre assumé (SPECS §3.5) : on l'annonce au navigateur.
  themeColor: "#14171A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${publicSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-alu-fond text-alu-brosse font-sans">
        {children}
        <RegisterServiceWorker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
