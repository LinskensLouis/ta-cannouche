"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RatingTab } from "@/components/rating/rating-tab";
import { FormatPicker } from "@/components/beer/format-picker";
import { CONTEXTS, CONTEXT_LABELS } from "@/lib/i18n/labels";
import { submitCheckin } from "@/lib/offline/sync";
import { FORMATS, type CheckinPayload } from "@/lib/offline/types";
import { compressImage } from "@/lib/photo/compress";
import { uploadCheckinPhoto } from "@/lib/photo/upload";
import { updateCheckinAction } from "@/app/(app)/checkin/[id]/modifier/actions";
import type { CheckinContext, FormatMl } from "@/types/db";

// Dégustation existante à modifier. Absent = mode création.
export type CheckinEditData = {
  id: string;
  rating: number | null;
  comment: string | null;
  quantity_ml: number | null;
  context: CheckinContext | null;
  consumed_at: string; // ISO
  photo_url: string | null;
};

export function CheckinForm({
  beerId,
  defaultFormat,
  today,
  edit,
}: {
  beerId: string;
  defaultFormat: FormatMl;
  today: string;
  edit?: CheckinEditData;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [queued, setQueued] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const isEdit = !!edit;
  const initialFormat: FormatMl =
    edit && FORMATS.includes(String(edit.quantity_ml) as FormatMl)
      ? (String(edit.quantity_ml) as FormatMl)
      : defaultFormat;
  // Photo affichée : nouvel aperçu prioritaire, sinon la photo existante.
  const shownPhoto = preview ?? edit?.photo_url ?? null;

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    const format = String(form.get("format") ?? "");
    if (!FORMATS.includes(format as FormatMl)) {
      setError("Choisis un format.");
      return;
    }
    const ratingRaw = String(form.get("rating") ?? "").trim();
    const contextRaw = String(form.get("context") ?? "");
    const dateRaw = String(form.get("consumed_at") ?? "").trim();

    setBusy(true);

    // Photo : compression client à ~1200 px puis upload. En édition, si aucune
    // nouvelle photo n'est choisie, on garde l'existante.
    let photoUrl: string | null = edit?.photo_url ?? null;
    if (photo) {
      try {
        const compressed = await compressImage(photo);
        const uploaded = await uploadCheckinPhoto(compressed);
        if (uploaded) photoUrl = uploaded;
        else setError("Photo non envoyée (réseau ?), enregistrée sans le nouveau cliché.");
      } catch {
        setError("Photo illisible, enregistrée sans le nouveau cliché.");
      }
    }

    const base = {
      rating: ratingRaw ? Number(ratingRaw) : null,
      comment: String(form.get("comment") ?? "").trim() || null,
      quantity_ml: Number(format),
      context: CONTEXTS.includes(contextRaw as CheckinContext) ? (contextRaw as CheckinContext) : null,
      consumed_at: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(),
      photo_url: photoUrl,
    };

    // Édition : mise à jour en ligne, puis retour à la fiche.
    if (edit) {
      try {
        await updateCheckinAction(edit.id, { beerId, ...base });
      } catch (err) {
        // redirect() lève une exception de contrôle : on la laisse remonter.
        if (err && typeof err === "object" && "digest" in err) throw err;
        setError("Modification impossible (réseau ?). Réessaie une fois connecté.");
        setBusy(false);
      }
      return;
    }

    // Création : interface optimiste + file hors-ligne.
    const payload: CheckinPayload = { beer_id: beerId, ...base };
    let synced = false;
    try {
      synced = await submitCheckin(payload);
    } catch {
      synced = false;
    }

    if (synced) {
      router.push(`/beer/${beerId}`);
      router.refresh();
    } else {
      setQueued(true);
      setBusy(false);
    }
  }

  if (queued) {
    return (
      <div className="flex flex-col gap-4 px-5 pt-6">
        <div className="rounded-2xl bg-alu-surface p-6 text-center">
          <p className="display text-lg text-condensation">Dégustation enregistrée</p>
          <p className="mt-2 text-sm text-alu-mat">
            Pas de réseau pour l&apos;instant : elle se synchronisera toute seule dès que tu
            seras reconnecté. Le bandeau en bas suit ce qui reste à envoyer.
          </p>
        </div>
        <Link
          href="/"
          className="flex min-h-12 items-center justify-center rounded-lg border border-white/10 text-alu-brosse active:bg-white/5"
        >
          Retour au feed
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 px-5 pb-6">
      <div className="rounded-2xl bg-alu-surface p-5">
        <RatingTab defaultValue={edit?.rating ?? 0} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Format bu</span>
        <FormatPicker defaultValue={initialFormat} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Contexte</span>
        <div className="flex flex-wrap gap-2">
          {CONTEXTS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="context"
                value={c}
                defaultChecked={edit?.context === c}
                className="peer sr-only"
              />
              <span className="flex min-h-12 items-center rounded-lg bg-alu-surface px-4 text-sm peer-checked:bg-serigraphie peer-checked:text-alu-fond">
                {CONTEXT_LABELS[c]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Date de dégustation</span>
        <input
          type="date"
          name="consumed_at"
          defaultValue={edit ? edit.consumed_at.slice(0, 10) : today}
          max={today}
          className="min-h-12 rounded-lg bg-alu-surface px-4 font-mono text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Commentaire</span>
        <textarea
          name="comment"
          rows={3}
          defaultValue={edit?.comment ?? ""}
          placeholder="Amertume, arômes, le moment…"
          className="rounded-lg bg-alu-surface px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
        />
      </label>

      {/* Photo (facultative) : compressée à ~1200 px avant upload */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Photo</span>
        <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/15 px-4 text-sm text-alu-mat active:bg-white/5">
          {shownPhoto ? "Changer la photo" : "Ajouter une photo de la canette"}
          <input type="file" accept="image/*" capture="environment" onChange={onPickPhoto} className="sr-only" />
        </label>
        {shownPhoto && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg bg-alu-surface">
            <Image src={shownPhoto} alt="Aperçu" fill unoptimized className="object-cover" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-serigraphie">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="min-h-12 rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond disabled:opacity-50"
      >
        {busy ? "…" : isEdit ? "Enregistrer les modifications" : "Enregistrer la dégustation"}
      </button>
    </form>
  );
}
