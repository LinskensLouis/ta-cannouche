import type { Database } from "@/types/database";

// Raccourcis vers les types générés (src/types/database.ts est régénéré par
// `npm run db:types`, ne pas éditer à la main). Usage : `Row<"beers">`.
type Public = Database["public"];

export type Tables = Public["Tables"];
export type Enums = Public["Enums"];

export type Row<T extends keyof Tables> = Tables[T]["Row"];
export type Insert<T extends keyof Tables> = Tables[T]["Insert"];
export type Update<T extends keyof Tables> = Tables[T]["Update"];

export type FormatMl = Enums["format_ml"];
export type CheckinContext = Enums["checkin_context"];
export type BeerSource = Enums["beer_source"];
export type ExpensesVisibility = Enums["expenses_visibility"];
