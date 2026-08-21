import type { MetadataRoute } from "next";

// Manifeste PWA (S1-09). Next l'expose sur /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ta Cannouche",
    short_name: "Cannouche",
    description: "Carnet de dégustation de canettes, suivi de budget et repérage en rayon.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14171A",
    theme_color: "#14171A",
    categories: ["food", "lifestyle", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
