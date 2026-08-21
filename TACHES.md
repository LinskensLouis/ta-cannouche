# Ta Cannouche — Tâches

> Ordre d'exécution strict. Une tâche à la fois. Chaque tâche doit laisser le projet dans un état qui démarre.
> Statuts : `à faire` · `en cours` · `fait` · `bloqué`

---

## Sprint 1 — Socle
**Objectif de fin de sprint :** je me connecte sur mon téléphone, la coquille mobile est en place, la base existe et est sécurisée.

### S1-01 · Initialiser le projet — `fait`
Next.js 15 (App Router), TypeScript strict, Tailwind, ESLint. Structure de dossiers conforme à `CLAUDE.md` §6.
**Terminé quand :** `npm run dev` démarre, `tsc --noEmit` passe, le dépôt Git est initialisé avec un `.gitignore` correct.

### S1-02 · Tokens de design — `fait`
Les six couleurs et les trois polices de `CLAUDE.md` §4.4 déclarées dans le bloc `@theme` de `src/app/globals.css` (Tailwind v4 n'utilise plus `tailwind.config.ts`) et chargées via `next/font`.
**Terminé quand :** une page de démonstration affiche chaque token et chaque police, et aucune couleur n'est écrite en dur.

### S1-03 · Projet Supabase et variables d'environnement — `fait`
Création du projet, récupération des clés, mise en place de `.env.local` et de `.env.local.example`, client Supabase dans `src/lib/supabase/`.
**Terminé quand :** une requête de test aboutit depuis l'app, et aucune clé n'est présente dans un fichier suivi par Git.
**Point de vigilance :** la clé `service_role` ne sort jamais du serveur.

### S1-04 · Migration initiale du schéma — `à faire`
Toutes les tables de `SPECS.md` §4.3 : `profiles`, `breweries`, `beers`, `checkins`, `purchases`, `stores`, `beer_availability`, `lists`, `list_items`. Enums `format_ml`, `context`, `source`. Index d'unicité sur `barcode`.
**Terminé quand :** la migration s'applique sans erreur sur une base vierge, et les contraintes (montants entiers, `rating` nullable, `format_ml` contraint) sont vérifiables par un test d'insertion.

### S1-05 · Politiques RLS — `à faire`
RLS activée sur **toutes** les tables. Règles : chacun lit les données du groupe, chacun n'écrit et ne modifie que ses propres `checkins`, `purchases` et son profil. Le référentiel `beers` est en lecture pour tous, en écriture pour les membres authentifiés.
**Terminé quand :** un test prouve qu'un utilisateur A ne peut ni modifier ni supprimer un `checkin` de l'utilisateur B.

### S1-06 · Génération des types — `à faire`
`supabase gen types typescript` branché sur un script npm, sortie dans `src/types/database.ts`.
**Terminé quand :** les types sont importés et utilisés dans le client, et la commande de régénération est documentée dans `JOURNAL.md`.

### S1-07 · Authentification — `à faire`
Inscription et connexion par email + mot de passe. Création automatique du `profile` (pseudo, avatar) à l'inscription, via trigger Postgres. Écrans de connexion et d'inscription au design mobile.
**Terminé quand :** je crée un compte depuis mon téléphone, je me reconnecte, et le profil existe en base.

### S1-08 · Coquille mobile — `à faire`
Barre de navigation basse fixe à 5 onglets — Feed · Recherche · **Scan** · Stats · Profil — avec le bouton scan en position centrale proéminente. Cinq pages vides. Gestion de `env(safe-area-inset-bottom)`.
**Terminé quand :** la navigation est utilisable au pouce sur un vrai téléphone, ne passe pas sous la barre de gestes iOS, et toutes les cibles font au moins 48 px.

### S1-09 · PWA installable — `à faire`
`manifest.json`, icônes, service worker, thème sombre déclaré.
**Terminé quand :** l'app s'ajoute à l'écran d'accueil sur Android et sur iOS, et s'ouvre en plein écran sans barre de navigateur.

### S1-10 · File d'attente hors-ligne — `à faire`
Couche de synchronisation en IndexedDB : les écritures sont mises en file quand le réseau est absent, rejouées au retour, avec un indicateur discret du nombre d'éléments en attente.
**Terminé quand :** en mode avion, une écriture de test est acceptée puis synchronisée automatiquement au retour du réseau, sans action de ma part.
**Point de vigilance :** à construire maintenant, en générique, pas à rétro-adapter au sprint 3.

---

## Sprint 2 — Scan et référentiel
**Objectif de fin de sprint :** je scanne une canette et sa fiche s'affiche.

- **S2-01** · Abstraction de scan : `BarcodeDetector` natif sur Android, repli sur `@zxing/library` pour Safari iOS. **À tester sur un vrai iPhone avant de passer à la suite.**
- **S2-02** · Écran de scan : caméra plein écran, cadre de visée, gestion du refus de permission avec lien vers la saisie manuelle.
- **S2-03** · Intégration Open Food Facts : appel par code-barres, filtre sur `en:beers`, mapping des champs vers `beers`, mise en cache locale.
- **S2-04** · Fiche bière : visuel, nom, brasserie, format, degré, note moyenne du groupe.
- **S2-05** · Code inconnu d'OFF : bascule automatique vers un formulaire de création pré-rempli avec le code-barres.
- **S2-06** · Recherche par nom dans le référentiel local.

**Critère d'acceptation du sprint :** moins de 3 secondes entre l'ouverture de la caméra et l'affichage de la fiche, en conditions normales.

---

## Sprint 3 — Notation
**Objectif de fin de sprint :** je note une canette et je vois la moyenne du groupe.

- **S3-01** · Composant de notation « languette » : anneau rempli au glissement horizontal, de 0,5 à 5 par pas de 0,5, retour haptique, tap direct possible. **C'est le composant le plus utilisé de l'app, il mérite d'être soigné.**
- **S3-02** · Formulaire de dégustation : note facultative, commentaire, format en quatre boutons, date modifiable, contexte.
- **S3-03** · Enregistrement en interface optimiste, branché sur la file du S1-10.
- **S3-04** · Historique personnel des dégustations d'une canette.
- **S3-05** · Note moyenne par canette, en moyenne bayésienne (`m = 3`).
- **S3-06** · Photo de dégustation avec compression client à ~1200 px avant upload.

**Critère d'acceptation du sprint :** le parcours « scan → note → enregistré » tient en moins de 15 secondes et 3 taps.

---

## Sprint 4 — Budget et classements
**Objectif de fin de sprint :** MVP diffusable au groupe.

- **S4-01** · Saisie d'achat : `total_price_cents`, `pack_size`, `pack_count`, enseigne, date.
- **S4-02** · Calcul dérivé du prix unitaire et du prix au litre.
- **S4-03** · Écran Stats : dépense totale, dépense moyenne par semaine active, volume consommé.
- **S4-04** · Graphique de conso dans le temps (Recharts), filtres 30 j / 3 mois / 1 an / tout.
- **S4-05** · Top des canettes du groupe.
- **S4-06** · Palmarès personnel.
- **S4-07** · États vides explicites partout — « Scanne ta première cannouche », jamais un `0,00 €` trompeur.

**Fin du sprint 4 : on livre au groupe.** Les sprints suivants s'arbitrent sur l'usage réel, pas sur les intuitions de départ.

---

## Sprint 5 — Enseignes et social
- **S5-01** · Enseignes : création, recherche, rattachement à un achat.
- **S5-02** · Signalement de disponibilité, alimenté automatiquement par la saisie d'achat du S4-01.
- **S5-03** · Affichage « vue il y a X jours » avec l'ancienneté de l'information.
- **S5-04** · Feed des dégustations du groupe.
- **S5-05** · Mur de languettes collectées sur le profil.

---

## Réserve — non planifié
Signalement de rupture · filtrage des classements par style · export CSV · badges · listes thématiques · récap annuel · fusion des doublons · notation multi-critères · empaquetage Capacitor.

---

## Questions ouvertes à trancher avec le groupe

1. Le classement des membres récompense la **diversité** (canettes distinctes, styles explorés) ou le **volume** ? La diversité est plus saine et plus intéressante à jouer.
2. Le suivi de dépenses est-il visible par le groupe ou strictement privé ? Prévoir a minima un réglage de visibilité.
3. Le nom final : « Ta Cannouche » ou « Cannouche » ?
