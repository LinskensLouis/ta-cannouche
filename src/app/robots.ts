import type { MetadataRoute } from "next";

// App privée (groupe fermé) : on décourage l'indexation par les moteurs.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
