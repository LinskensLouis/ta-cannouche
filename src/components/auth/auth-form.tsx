"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/app/(auth)/actions";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

const LABELS = {
  login: { title: "Connexion", submit: "Se connecter", alt: "Pas de compte ?", altLink: "/signup", altLabel: "Créer un compte" },
  signup: { title: "Créer un compte", submit: "Créer mon compte", alt: "Déjà inscrit ?", altLink: "/login", altLabel: "Se connecter" },
} as const;

const inputClass =
  "min-h-12 w-full rounded-lg bg-alu-surface px-4 text-base text-alu-brosse placeholder:text-alu-mat outline-none focus-visible:ring-2 focus-visible:ring-serigraphie";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const t = LABELS[mode];

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="display text-3xl">Ta Cannouche</h1>
        <p className="text-sm text-alu-mat">
          {mode === "login" ? "Connecte-toi pour retrouver ton carnet." : "Rejoins le groupe et note tes cannouches."}
        </p>

        <div className="mt-2 flex flex-col gap-3">
          {mode === "signup" && (
            <label className="flex flex-col gap-1">
              <span className="text-sm text-alu-mat">Pseudo</span>
              <input name="pseudo" type="text" autoComplete="nickname" required placeholder="Ton pseudo" className={inputClass} />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-alu-mat">Email</span>
            <input name="email" type="email" autoComplete="email" required placeholder="toi@exemple.fr" className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-alu-mat">Mot de passe</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              placeholder="8 caractères minimum"
              className={inputClass}
            />
          </label>
        </div>

        {state.error && <p className="text-sm text-serigraphie">{state.error}</p>}
        {state.info && <p className="text-sm text-condensation">{state.info}</p>}
      </div>

      {/* Action primaire dans le tiers inférieur (SPECS §3.2). */}
      <div className="flex flex-col gap-3 pb-2">
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 rounded-lg bg-serigraphie px-4 text-base font-semibold text-alu-fond disabled:opacity-50"
        >
          {pending ? "…" : t.submit}
        </button>
        <p className="text-center text-sm text-alu-mat">
          {t.alt}{" "}
          <Link href={t.altLink} className="text-serigraphie underline underline-offset-4">
            {t.altLabel}
          </Link>
        </p>
      </div>
    </form>
  );
}
