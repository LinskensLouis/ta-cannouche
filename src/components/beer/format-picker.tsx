"use client";

import { useState } from "react";
import type { FormatMl } from "@/types/db";
import { formatMlLabel } from "@/lib/format";

const FORMATS: FormatMl[] = ["250", "330", "440", "500"];

// Sélecteur de format en quatre boutons (SPECS §1.1 / E3-5). Publie la valeur
// dans un input caché nommé `format` pour les formulaires à action serveur.
export function FormatPicker({ name = "format", defaultValue }: { name?: string; defaultValue?: FormatMl }) {
  const [value, setValue] = useState<FormatMl | "">(defaultValue ?? "");

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-4 gap-2">
        {FORMATS.map((f) => {
          const active = value === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setValue(f)}
              aria-pressed={active}
              className={`min-h-12 rounded-lg font-mono text-sm ${
                active
                  ? "bg-serigraphie text-alu-fond"
                  : "bg-alu-surface text-alu-brosse active:bg-white/5"
              }`}
            >
              {formatMlLabel(f)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
