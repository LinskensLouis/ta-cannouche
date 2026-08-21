import type { CheckinContext } from "@/types/db";

// Libellés français des enums (les valeurs restent en anglais en base).
export const CONTEXT_LABELS: Record<CheckinContext, string> = {
  home: "À la maison",
  out: "Dehors",
  party: "En soirée",
  festival: "En festival",
  other: "Autre",
};

export const CONTEXTS = Object.keys(CONTEXT_LABELS) as CheckinContext[];
