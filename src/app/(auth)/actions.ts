"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; info?: string };

// Traduit les messages d'erreur Supabase (anglais) en français.
function toFrench(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Email pas encore confirmé. Vérifie ta boîte mail.";
  if (m.includes("user already registered")) return "Un compte existe déjà avec cet email.";
  if (m.includes("password")) return "Mot de passe trop faible (8 caractères minimum).";
  if (m.includes("unable to validate email")) return "Adresse email invalide.";
  return "Une erreur est survenue. Réessaie.";
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Renseigne ton email et ton mot de passe." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: toFrench(error.message) };

  redirect("/");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const pseudo = String(formData.get("pseudo") ?? "").trim();
  if (!email || !password || !pseudo) return { error: "Tous les champs sont requis." };
  if (password.length < 8) return { error: "Mot de passe : 8 caractères minimum." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { pseudo } },
  });
  if (error) return { error: toFrench(error.message) };

  // Si la confirmation d'email est activée, aucune session n'est ouverte.
  if (!data.session) {
    return { info: "Compte créé. Confirme ton email, puis connecte-toi." };
  }

  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
