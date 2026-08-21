"use client";

import { useRef, useState } from "react";

// Composant de notation « languette » (S3-01, SPECS §3.4).
// Cinq languettes remplies au glissement horizontal, de 0,5 à 5 par pas de 0,5.
// Tap direct possible, retour haptique à chaque demi-cran. Valeur 0 = pas de note.

const STEPS = 5;

function TabGlyph({ fill }: { fill: number }) {
  // fill : 0 → 1, fraction remplie (pour l'affichage des demi-notes).
  const clip = `inset(0 ${100 - Math.round(fill * 100)}% 0 0)`;
  return (
    <span className="relative block size-9">
      <PullTab className="absolute inset-0 text-alu-mat/40" filled={false} />
      <span className="absolute inset-0" style={{ clipPath: clip }}>
        <PullTab className="text-serigraphie" filled />
      </span>
    </span>
  );
}

function PullTab({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden>
      <rect
        x="8"
        y="4"
        width="20"
        height="28"
        rx="10"
        stroke="currentColor"
        strokeWidth="3"
        fill={filled ? "currentColor" : "none"}
      />
      <ellipse cx="18" cy="15" rx="5" ry="7" fill="#14171A" />
    </svg>
  );
}

export function RatingTab({
  name = "rating",
  defaultValue = 0,
}: {
  name?: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const rowRef = useRef<HTMLDivElement>(null);

  const setFromClientX = (clientX: number) => {
    const el = rowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fraction = (clientX - rect.left) / rect.width;
    const raw = Math.round(fraction * STEPS * 2) / 2; // pas de 0,5
    const next = Math.min(STEPS, Math.max(0.5, raw));
    setValue((prev) => {
      if (next !== prev && "vibrate" in navigator) navigator.vibrate(8);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-4xl text-serigraphie">
          {value > 0 ? value.toFixed(1).replace(".", ",") : "—"}
        </span>
        <span className="text-sm text-alu-mat">/ 5</span>
      </div>

      <div
        ref={rowRef}
        role="slider"
        aria-label="Note"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={value}
        tabIndex={0}
        className="flex touch-none gap-2 py-2"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0) setFromClientX(e.clientX);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setValue((v) => Math.min(5, v + 0.5));
          if (e.key === "ArrowLeft") setValue((v) => Math.max(0, v - 0.5));
        }}
      >
        {Array.from({ length: STEPS }, (_, i) => (
          <TabGlyph key={i} fill={Math.min(1, Math.max(0, value - i))} />
        ))}
      </div>

      {value > 0 && (
        <button
          type="button"
          onClick={() => setValue(0)}
          className="text-xs text-alu-mat underline underline-offset-4"
        >
          Retirer la note
        </button>
      )}

      <input type="hidden" name={name} value={value > 0 ? value : ""} />
    </div>
  );
}
