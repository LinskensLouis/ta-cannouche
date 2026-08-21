import type { FormatMl } from "@/types/db";

// Formateurs d'affichage (français). Les montants sont stockés en centimes
// entiers ; jamais de calcul monétaire en float ailleurs qu'à l'affichage.

const eurosFmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function euros(cents: number): string {
  return eurosFmt.format(cents / 100);
}

// Format canette en libellé court : "330" → "33 cl".
export function formatMlLabel(ml: FormatMl): string {
  return `${Number(ml) / 10} cl`;
}

// Prix au litre à partir d'un prix total (centimes), d'un volume unitaire (ml)
// et du nombre d'unités. Renvoie une chaîne "x,xx €/L" ou null si indéterminé.
export function pricePerLiter(totalCents: number, unitMl: number, units: number): string | null {
  const totalMl = unitMl * units;
  if (totalMl <= 0) return null;
  const centsPerLiter = (totalCents / totalMl) * 1000;
  return `${eurosFmt.format(centsPerLiter / 100)}/L`;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

// Ancienneté lisible : "aujourd'hui", "il y a 3 jours"… (S5-03).
export function timeAgo(iso: string, now: Date): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months === 1) return "il y a 1 mois";
  if (months < 12) return `il y a ${months} mois`;
  return "il y a plus d'un an";
}
