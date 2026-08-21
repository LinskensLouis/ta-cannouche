import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Images produits Open Food Facts (S2-03).
    remotePatterns: [
      { protocol: "https", hostname: "images.openfoodfacts.org" },
      { protocol: "https", hostname: "static.openfoodfacts.org" },
      { protocol: "https", hostname: "world.openfoodfacts.org" },
    ],
  },
};

export default nextConfig;
