import type { CheckinContext, FormatMl } from "@/types/db";

// Charge utile d'une dégustation, partagée entre la file cliente (IndexedDB),
// la synchro et l'endpoint de rejeu serveur.
export type CheckinPayload = {
  beer_id: string;
  rating: number | null;
  comment: string | null;
  quantity_ml: number;
  context: CheckinContext | null;
  consumed_at: string; // ISO
  photo_url: string | null;
  retroactive: boolean; // true = déjà goûtée avant, hors feed d'activité récente
};

export const FORMATS: FormatMl[] = ["250", "330", "440", "500"];
export const CONTEXTS: CheckinContext[] = ["home", "out", "party", "festival", "other"];
