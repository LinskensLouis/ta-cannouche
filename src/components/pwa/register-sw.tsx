"use client";

import { useEffect } from "react";

// Enregistre le service worker en production uniquement : en développement il
// entrerait en conflit avec le rechargement à chaud de Next.
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Échec silencieux : l'app reste utilisable sans hors-ligne.
    });
  }, []);

  return null;
}
