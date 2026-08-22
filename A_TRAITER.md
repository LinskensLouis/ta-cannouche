# À traiter / décisions

> Journal des points ouverts et des décisions prises. Mis à jour au fil des
> sessions. Le gros est réglé ; ce qui reste est côté dashboard ou en réserve.

---

## Actions restantes (de ton côté, pas de code)

- 🟠 **Couper l'inscription publique quand tout le groupe est inscrit.** L'app est
  ouverte : n'importe qui avec le lien peut créer un compte. Un `noindex` limite
  la découverte (fait), mais pour verrouiller vraiment, une fois tous les potes
  dedans : dans `supabase/config.toml`, passer `[auth] enable_signup = false` **et**
  `[auth.email] enable_signup = false`, puis `npx supabase config push`. Pour
  ajouter quelqu'un ensuite : le recréer côté dashboard, ou rouvrir temporairement.
  Dis-moi quand vous êtes au complet et je le fais.

- 🟢 **Analytics + Speed Insights** activés dans Vercel (fait par Louis). Données
  visibles dans les onglets dédiés ; me les partager (capture/chiffres) pour analyse.
- 🔵 **(Optionnel) Tester sur iPhone** l'installation PWA et le scan caméra.
  Sur **Android** c'est déjà validé (scan OK, mode avion OK, bouteille refusée OK).

---

## Décisions actées (2026-08-21)

- **Inscription sans confirmation d'email** — *gardé*. Simple pour un groupe fermé.
  Pour resserrer plus tard : brancher un SMTP (ex. Resend) puis réactiver
  `enable_confirmations` dans `supabase/config.toml`.
- **Photos en bucket public** — *gardé*. URL non devinable, suffisant pour le
  groupe. Passable en privé + URLs signées si besoin.
- **Filtre « canettes uniquement »** — *gardé tel quel*. On rejette les bières
  explicitement en bouteille (packaging OFF) ; celles au conditionnement non
  renseigné passent (sinon on perdrait de vraies canettes mal taguées). Format
  toujours borné aux 4 tailles canette.
- **Photo hors-ligne** — *limite acceptée*. Sans réseau, la dégustation part en
  file mais **sans** la photo (message affiché). À revoir si l'usage le réclame.
- **Création de bière hors-ligne** — *reportée*. Sans réseau, le scan lit le code
  mais retrouver/créer la canette exige une connexion → message clair pour
  l'instant. On fera la file complète (bière + dégustation + gestion des doublons)
  seulement si le cas « zéro réseau + canette inconnue » gêne vraiment le groupe.
  Rappel : navigation limitée hors-ligne (pages rendues côté serveur ; seul le
  feed « / » est mis en cache par le service worker).

---

## Performance — optimisations (audit build mobile, 2026-08-22)

> Audit fait sur le build. À l'échelle actuelle l'app était déjà rapide ; les
> gains ci-dessous préparent surtout la montée en charge et la fluidité mobile.

**Fait (2026-08-22)**
- ✅ **Proxy `getUser()` → `getClaims()`** : plus d'aller-retour réseau vers
  l'Auth Supabase à chaque navigation, vérification locale du JWT. Toutes les
  redirections d'auth testées.
  ⚠️ *Effet de bord assumé* : un compte supprimé garde une session valide jusqu'à
  expiration du jeton (~1 h), car on ne revérifie plus l'existence côté serveur à
  chaque requête. Sans impact réel pour le groupe.
- ✅ **Vues d'agrégation Postgres** (`beer_stats`, `user_stats`,
  `user_daily_consumption`, migration 005) : note de groupe, tier list et stats
  membres calculées en SQL au lieu de scans complets recalculés en JS.
- ✅ **Lazy-load du graphique Recharts** (`next/dynamic`, hors bundle initial de /stats).
- ✅ **Polices allégées** : IBM Plex Mono réduit aux graisses 400/600 (378 → 346 Ko).
- ✅ **Fiche bière** : requêtes note/historique/achats en parallèle + `getClaims`.

**Reste (à arbitrer plus tard)**
- 🟠 **Archivo (axe de largeur ~172 Ko)** : c'est la signature visuelle (lettrage
  large). Non touché volontairement — le couper allégerait le LCP mobile mais
  changerait le look. À décider si le poids pose vraiment problème à l'usage.
- 🔵 **Cache/`revalidate` court sur le feed** pour éviter des refetch redondants
  entre navigations. À envisager si le feed devient lourd.
- 🔵 Si les données explosent : passer `beer_stats` en **vue matérialisée**
  (la moyenne globale bayésienne rescanne les checkins à chaque calcul).

---

## Livré (rappel)

MVP complet (sprints 1→4) + tier list du groupe + recherche par marque et
instantanée + Vercel Analytics/Speed Insights. Détail par tâche dans `TACHES.md`,
historique dans `JOURNAL.md`. Base réelle : **6 comptes** (le groupe l'utilise
activement — plusieurs canettes notées : NATZ, 86 Cherry, Maison Canaille…).

Points connexes déjà réglés : GitHub + Vercel en prod, `site_url` calé sur la
prod, filtre bouteilles, file d'attente hors-ligne (+ correctif mode avion),
photo de dégustation. Données et comptes de test tous supprimés.
