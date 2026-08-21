# Journal d'avancement

> À mettre à jour **à la fin de chaque session**. Ajouter les nouvelles entrées en haut.
> Format : date · ce qui est fait · décisions prises · ce qui reste · points bloquants.

---

## État actuel

**Sprint en cours :** 1 — Socle
**Prochaine tâche :** S1-04 · Migration initiale du schéma
**Projet démarrable :** oui — `npm install` puis `npm run dev`

> ⏳ **À faire par Louis avant S1-04** (commandes interactives, dans un terminal PowerShell à la racine) :
> ```
> npx supabase login
> npx supabase link --project-ref cctxlrnuvrgjpemujode
> ```
> Le `link` demande le mot de passe de la base (celui noté à la création du projet).

---

## Décisions structurantes déjà prises

| Décision | Motif |
|---|---|
| Canettes uniquement | Garantit un code-barres, contraint les formats, rend la feature « enseigne » cohérente |
| Achat et dégustation en deux tables | Un pack de 6 acheté un mardi se boit sur deux semaines ; fusionner casse les stats |
| Supabase plutôt qu'un backend maison | Projet solo, temps limité, auth et storage inclus |
| PWA d'abord, Capacitor plus tard | Une seule base de code, pas de réécriture pour passer sur mobile |
| Open Food Facts plutôt qu'Untappd | Gratuit, sans clé, bonne couverture des produits de grande surface |
| Hors-ligne traité dès le sprint 1 | Un check-in perdu dans un rayon sans réseau ne sera jamais ressaisi |
| Notation par languette, pas par étoiles | Dix demi-étoiles sur 375 px font des cibles de 34 px, trop imprécises au pouce |

### Décisions prises en session 1

| Décision | Motif | Impact |
|---|---|---|
| Les quatre documents remontent à la racine | `CLAUDE.md` n'est pas chargé automatiquement depuis un sous-dossier, et `CLAUDE.md` §6 décrivait déjà cette structure | fait |
| Tailwind v4, tokens en `@theme` dans `globals.css` | v4 est ce qu'installe `create-next-app` ; v3 serait obsolète avant la fin du projet | S1-02 : plus de `tailwind.config.ts` |
| `format_ml` reste sur `beers` ; `checkins.quantity_ml` est pré-rempli depuis la bière et modifiable en un tap | Le code-barres détermine le format, ce qui rend le prix au litre calculable ; les 4 boutons de E3-5 servent de correction, pas de saisie | S1-04, S3-02 |
| Colonne renommée `format_ml` partout | `SPECS.md` §4.3 mentionnait `volume_ml` dans l'index de secours — coquille | S1-04 |
| Valeurs d'enum en anglais, libellés français côté affichage | `CLAUDE.md` §5 interdit le franglais dans le code ; `context` devient `home / out / party / festival / other` | S1-04 |
| Visibilité des dépenses réglable, **privé par défaut** | Question ouverte n°2 ; la colonne doit exister dès la migration initiale, pas être ajoutée sur une base remplie sous RLS | S1-04, S1-05 |
| RLS sprint 1 = « tout utilisateur authentifié lit tout » | Il n'existe aucune notion de groupe dans le schéma, et l'invitation par lien (E1-7) est un *Should* hors sprint 1 | S1-05 |
| Nom conservé : « Ta Cannouche » | Tranché par Louis | — |
| Placement de S1-10 (file hors-ligne) | Non tranché, à revoir plus tard | ouvert |

---

## Sessions

### 2026-08-21 — session 3

- **Fait : S1-03 · Projet Supabase et variables d'environnement — fait.**
  - Dépendances ajoutées (validées) : `@supabase/supabase-js` + `@supabase/ssr` (runtime), `supabase` (devDep, CLI via `npx`).
  - `npx supabase init` → `supabase/config.toml` (`project_id = "ta-cannouche"`). `.temp` et les `.env*.local` ignorés par le `supabase/.gitignore` posé par la CLI.
  - Clients écrits dans `src/lib/supabase/` : `client.ts` (navigateur, `createBrowserClient`) et `server.ts` (serveur, `createServerClient` + cookies). Les deux ne lisent que les `NEXT_PUBLIC_*` ; le service_role n'y apparaît jamais. TODO S1-06 : paramétrer avec le type `Database`.
  - **Connexion vérifiée depuis l'app** : page serveur temporaire interrogeant une table volontairement absente → réponse PostgREST `PGRST205` (table introuvable), qui prouve base atteinte + clé valide. Page supprimée après coup.
  - Projet Supabase créé par Louis en région EU, `.env.local` renseigné par lui (nouveau format de clés `sb_publishable_` / `sb_secret_`). Je n'ai jamais vu le secret. Project ref : `cctxlrnuvrgjpemujode`.
  - Vérifié : `typecheck`, `lint`, `build` verts ; `.env.local` absent de l'index Git.

- **Incident corrigé :** `.env.local.example` avait disparu du disque (renommé en `.env.local` lors de la saisie des clés). Recréé sans aucune valeur — il doit rester versionné (CLAUDE.md §6/§8).

- **Reste à faire :** S1-04 (schéma). **Prérequis Louis** : lancer `npx supabase login` puis `link` (voir encart en haut). Sans ça je ne peux pas pousser la migration ; je peux quand même l'écrire.

- **À vérifier :** rien sur téléphone à ce stade.

---

### 2026-08-21 — session 2

- **Fait : S1-02 · Tokens de design — fait.**
  - Six couleurs de §4.4 déclarées dans le bloc `@theme` de `globals.css` (`--color-alu-*`, `--color-serigraphie`, `--color-condensation`) → utilitaires `bg-*`, `text-*`.
  - Trois polices via `next/font/google` : **Public Sans** (`font-sans`, défaut du body), **Archivo** (`font-display`) et **IBM Plex Mono** (`font-mono`, poids 400/500/600 car ce n'est pas une variable font).
  - « Archivo Expanded » résolu : Archivo est une variable font, l'axe `wdth` est chargé (`axes: ['wdth']`) et la largeur maximale est appliquée par l'utilitaire `.display` (`font-stretch: 125%` + poids 700). Confirmé par inspection : le rendu est vraiment élargi, pas du gras.
  - Fond sombre déclaré au navigateur : `themeColor: "#14171A"` + `colorScheme: "dark"` dans le `viewport`.
  - Page de démo (`src/app/page.tsx`) affichant chaque couleur (pastille + hex + usage), chaque police et l'accent. Provisoire, remplacée à la coquille S1-08.
  - Vérifié : `typecheck`, `lint`, `build` verts ; à 375 px rendu conforme, à 1024 px pas de scroll horizontal ni de casse.

- **Décision :** rester sur **Next.js 16** (version stable la plus récente) plutôt que rétrograder en 15. `CLAUDE.md` §4.1 mis à jour en conséquence (Next 16 + Tailwind v4), dans un commit dédié.

- **À vérifier sur un vrai téléphone :** le rendu d'Archivo élargi et la lisibilité de Public Sans / IBM Plex Mono en lumière basse (l'app s'ouvre surtout le soir). Rien de bloquant.

- **Reste à faire :** S1-03. **Il me faut de ta part** : un projet Supabase en région EU + ses clés (`URL`, `anon`, `service_role`), et un dépôt distant GitHub.

---

### 2026-08-21 — session 1

- **Fait :**
  - Lecture des specs, cadrage et levée des ambiguïtés avant tout code.
  - Remontée de `CLAUDE.md`, `SPECS.md`, `TACHES.md`, `JOURNAL.md` de `specs/` vers la racine.
  - **S1-01 · Initialiser le projet — fait.** Squelette `create-next-app` (App Router, TypeScript, Tailwind, ESLint, `src/`, alias `@/*`), typage durci (`noUncheckedIndexedAccess`, `noImplicitReturns`), règle ESLint `no-explicit-any` en `error`, boilerplate nettoyé, structure de dossiers de `CLAUDE.md` §6 créée, `.env.local.example` posé sans aucune valeur, dépôt Git initialisé.
  - Vérifié : `npm run typecheck`, `npm run lint` et `npm run build` passent ; `npm run dev` sert la page à 375 px sans erreur console.

- **Décisions :** voir le tableau « Décisions prises en session 1 » ci-dessus.

- **Écart à signaler :** `create-next-app@latest` installe **Next.js 16.3.2**, pas Next.js 15 comme l'indique `CLAUDE.md` §4.1. React 19.2, Tailwind v4, Turbopack par défaut. À confirmer ou à rétrograder — c'est maintenant que ça coûte le moins cher. `CLAUDE.md` n'a pas été modifié.

- **Reste à faire :** S1-02 · Tokens de design.

- **À vérifier sur un vrai téléphone :** rien à ce stade, S1-01 est purement local. Le premier vrai test mobile concerne S1-08 (coquille et safe areas).

- **Bloqué sur :** rien. Pour S1-03 il me faudra un projet Supabase en région EU, ses clés, et un dépôt distant GitHub.

---

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement, http://localhost:3000 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | build de production |
