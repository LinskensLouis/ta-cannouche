"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { startScan, type ScanController } from "@/lib/scan/detector";
import { lookupBarcodeAction } from "./actions";

type Status = "idle" | "scanning" | "denied" | "unsupported" | "resolving";

export function Scanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controllerRef = useRef<ScanController | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const resolve = (code: string) => {
    setError("");

    // Retrouver une canette (base du groupe + Open Food Facts) demande le réseau.
    // Le code a bien été lu localement, mais on ne peut pas le résoudre hors-ligne.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError(
        "Code-barres lu ✓ — mais retrouver ou ajouter la canette demande une connexion. Réessaie une fois reconnecté.",
      );
      setStatus("idle");
      return;
    }

    setStatus("resolving");
    startTransition(async () => {
      try {
        const res = await lookupBarcodeAction(code);
        // En cas de succès, l'action redirige (on n'arrive pas ici).
        if (res?.error) {
          setError(res.error);
          setStatus("idle");
        }
      } catch {
        setError("Recherche impossible (réseau ?). Réessaie une fois connecté.");
        setStatus("idle");
      }
    });
  };

  const begin = async () => {
    setStatus("scanning");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      controllerRef.current = await startScan(video, resolve);
    } catch {
      setStatus("denied");
    }
  };

  useEffect(() => {
    return () => controllerRef.current?.stop();
  }, []);

  return (
    <div className="flex flex-col gap-4 px-5">
      {/* Zone caméra / cadre de visée */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        {status !== "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            {status === "resolving" ? (
              <p className="text-sm text-alu-mat">Recherche de la canette…</p>
            ) : (
              <>
                <p className="text-sm text-alu-mat">
                  {status === "denied"
                    ? "Accès caméra refusé. Saisis le code-barres à la main."
                    : status === "unsupported"
                      ? "Caméra indisponible sur cet appareil. Saisis le code-barres."
                      : "Vise le code-barres d'une canette."}
                </p>
                {status !== "denied" && status !== "unsupported" && (
                  <button
                    type="button"
                    onClick={begin}
                    className="min-h-12 rounded-lg bg-serigraphie px-5 font-semibold text-alu-fond"
                  >
                    Activer la caméra
                  </button>
                )}
              </>
            )}
          </div>
        )}
        {status === "scanning" && (
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-serigraphie/80" />
        )}
      </div>

      {/* Saisie manuelle : filet de sécurité, toujours disponible */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) resolve(manual.trim());
        }}
        className="flex flex-col gap-2"
      >
        {error && <p className="text-sm text-serigraphie">{error}</p>}
        <label className="text-sm text-alu-mat">Ou saisis le code-barres</label>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            placeholder="3080216052885"
            className="min-h-12 flex-1 rounded-lg bg-alu-surface px-4 font-mono text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
          />
          <button
            type="submit"
            disabled={isPending || !manual.trim()}
            className="min-h-12 rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond disabled:opacity-50"
          >
            Chercher
          </button>
        </div>
      </form>
    </div>
  );
}
