# Journal d'avancement

> À mettre à jour **à la fin de chaque session**. Ajouter les nouvelles entrées en haut.
> Format : date · ce qui est fait · décisions prises · ce qui reste · points bloquants.

---

## État actuel

**Sprint en cours :** 1 — Socle
**Prochaine tâche :** S1-02 · Tokens de design
**Projet démarrable :** oui — `npm install` puis `npm run dev`

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
