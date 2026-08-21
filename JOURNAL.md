# Journal d'avancement

> À mettre à jour **à la fin de chaque session**. Ajouter les nouvelles entrées en haut.
> Format : date · ce qui est fait · décisions prises · ce qui reste · points bloquants.

---

## État actuel

**Sprint en cours :** MVP (sprints 1→4) complet, tous les Must couverts. Reste S3-06 (photo, Should) + sprint 5 (post-MVP).
**Prochaine tâche :** au choix de Louis — S3-06 (photo), sprint 5 (enseignes/social), ou tests terrain sur téléphone.
**Projet démarrable :** oui — `npm install` puis `npm run dev`
**Boucle MVP fonctionnelle :** scan/saisie code-barres → Open Food Facts → fiche →
note languette → feed + historique + note du groupe ; achat → prix/L → stats,
graphique, classements. Testée de bout en bout dans le navigateur.

> 👉 **Au retour, lis `A_TRAITER.md` en premier** : GitHub à pousser, file
> hors-ligne (Must) à finir, photo à faire, scan caméra + PWA à tester sur ton
> iPhone, et 2 données/comptes de test à nettoyer.

> ✅ `supabase login` + `link` faits (project ref `cctxlrnuvrgjpemujode`). Le mot de
> passe base est en cache CLI : `npx supabase db push` fonctionne sans re-saisie.
>
> **Régénérer les types après toute migration :** `npm run db:types`
> (→ `src/types/database.ts`, ne pas éditer à la main ; raccourcis dans `src/types/db.ts`).

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

### 2026-08-21 — session 5 (autonome)

> Session menée en autonomie à la demande de Louis, cap sur un MVP quasi
> fonctionnel. Priorité : interface utilisable d'abord. Blocages consignés dans
> `A_TRAITER.md`.

**Sprints 2, 3 et 4 réalisés en plus du sprint 1 (voir détail par tâche dans TACHES.md).**

- **Sprint 2 (scan & référentiel) :** intégration Open Food Facts testée sur
  données réelles (`src/lib/off`), résolution code-barres → fiche existante /
  création auto / formulaire pré-rempli, abstraction de scan (natif + zxing iOS),
  écran de scan avec saisie manuelle, fiche bière, recherche par nom. Flux
  code-barres → OFF → fiche validé de bout en bout.
- **Sprint 3 (notation) :** composant languette (glissement, pas de 0,5,
  haptique), formulaire de dégustation, enregistrement en ligne, historique
  perso, note bayésienne, feed du groupe. Boucle scan → note → feed validée.
- **Sprint 4 (budget & classements) :** saisie d'achat + prix/L en direct, écran
  Stats (dépense, moyenne/semaine active, volume), graphique Recharts, top
  groupe + palmarès. Flux achat → stats validé.
- **Dépendances ajoutées (autorisées) :** `sharp` (dev, icônes), `@zxing/browser`
  + `@zxing/library` (scan iOS), `recharts` (graphiques).
- **Migrations :** `001` schéma, `002` RLS, `003` trigger profil. Config auth
  poussée (`config push`) pour désactiver la confirmation d'email.
- **S1-10 (file hors-ligne, Must) :** fait après coup. File IndexedDB
  (`src/lib/offline/`) + endpoint `/api/checkins` + indicateur de synchro, branché
  sur la dégustation. Testé en simulant une coupure réseau (mise en file → rejeu
  auto au retour). À revalider en vrai mode avion sur mobile.
- **Périmètre canettes renforcé :** filtre des bières en bouteille au scan
  (packaging OFF), sur reprécision de Louis.
- **Reste (voir A_TRAITER) :** S3-06 photo (Should), scan caméra + PWA + mode
  avion à tester sur appareil, sprint 5 (enseignes/social) non entamé.
- **Tous les Must du MVP (sprints 1→4) sont couverts.**

- **S1-05 · Politiques RLS — fait.** `002_rls_policies.sql`. Groupe fermé : tout
  authentifié lit référentiel + activité ; écriture réservée au propriétaire ;
  `purchases` visibles du groupe seulement si `expenses_visibility = 'group'`.
  Isolation prouvée par test à 2 utilisateurs (B ne peut ni modifier, ni
  supprimer, ni usurper le check-in de A ; ne voit pas son achat privé).
- **S1-06 · Types générés — fait.** `npm run db:types` → `src/types/database.ts`,
  clients paramétrés `<Database>`, raccourcis `Row/Insert/Update` dans `src/types/db.ts`.
- **S1-07 · Authentification — fait.** Écrans connexion/inscription mobile,
  actions serveur, trigger `handle_new_user` (`003_`, gère les collisions de
  pseudo), proxy Next 16 (session + protection des routes). Parcours complet
  testé via l'UI réelle (inscription → session → app). **Next 16 : `middleware`
  renommé `proxy`** (fichier `src/proxy.ts`). **Confirmation d'email désactivée**
  via `config push` (voir A_TRAITER : rate limit du service email intégré).
- **S1-08 · Coquille mobile — fait.** Route group `(app)`, navigation basse 5
  onglets (Feed · Recherche · **Scan** central proéminent · Stats · Profil),
  5 pages avec états vides à la bonne voix, safe areas iOS, cibles ≥ 48 px
  (vérifié : 78×64 / 64×64). Profil affiche le pseudo réel + déconnexion.

- **À vérifier sur un vrai téléphone :** installation PWA (S1-09), rendu de la
  nav sous la barre de gestes iOS, lisibilité en lumière basse.

---

### 2026-08-21 — session 4

- **Fait : S1-04 · Migration initiale du schéma — fait.**
  - `supabase/migrations/001_init_schema.sql` : 9 tables (`profiles`, `breweries`, `beers`, `stores`, `purchases`, `checkins`, `beer_availability`, `lists`, `list_items`) + 4 enums (`format_ml`, `checkin_context`, `beer_source`, `expenses_visibility`).
  - Contraintes : montants `integer` centimes avec `CHECK (>= 0)` ; `rating numeric(2,1)` nullable avec `CHECK` (0,5→5,0, pas de 0,5) ; `abv` bornée 0–100 ; `format_ml` NOT NULL et contraint par enum ; unicité `barcode`, plus index unique partiel `(lower(name), brewery_id, format_ml)` quand `barcode` nul.
  - `expenses_visibility` sur `profiles`, défaut `private` (décision « dépenses réglables, privé par défaut »). Servira à la RLS des `purchases` en S1-05.
  - **RLS activée sur les 9 tables** dès cette migration (aucune politique = tout refusé). Politiques en S1-05.
  - FK à la suppression : lignes possédées (`checkins`, `purchases`, profil, listes) en cascade ; `beers.created_by` et `brewery_id` passent à `NULL` ; `beer_id` des achats/dégustations en `restrict` (on ne supprime pas une bière encore consommée).
  - **Appliquée** sur la base distante via `npx supabase db push` (mot de passe en cache). `migration list` : `001` local = `001` distant.
  - **Contraintes prouvées** par une page serveur temporaire (clé service_role, contourne la RLS) : `format_ml` hors enum → `22P02` refusé ; montant négatif → `23514` refusé ; `rating = 3.3` → `23514` refusé ; `rating = null` et `4.5` acceptés. Jeu de test créé puis supprimé ; base re-vérifiée vierge (0 ligne). Page retirée.
  - Vérifié : `typecheck`, `lint`, `build` verts.

- **Note de réconciliation :** CLAUDE.md §4.2 impose « RLS dès la 1re migration » alors que TACHES sépare S1-04 (schéma) et S1-05 (politiques). Résolu en activant la RLS ici (fermé par défaut) et en réservant les politiques à S1-05.

- **À vérifier :** rien sur téléphone.

---

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
