import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ta Cannouche",
  description: "Carnet de dégustation de canettes, suivi de budget et repérage en rayon.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `cover` est requis pour que `env(safe-area-inset-*)` renvoie autre chose que 0
  // sur iPhone. Nécessaire à la barre de navigation basse (S1-08).
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
